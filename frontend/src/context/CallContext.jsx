import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { Device } from '@twilio/voice-sdk';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CallContext = createContext(null);

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within CallProvider');
  return ctx;
};

// Trạng thái cuộc gọi
export const CALL_STATE = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  RINGING: 'ringing',       // inbound đang reo
  IN_CALL: 'in-call',
  ENDING: 'ending',
};

export function CallProvider({ children }) {
  const [callState, setCallState] = useState(CALL_STATE.IDLE);
  const [callerInfo, setCallerInfo] = useState(null);  // { name, number, direction }
  const [callDuration, setCallDuration] = useState(0); // giây
  const [isMuted, setIsMuted] = useState(false);
  const [deviceReady, setDeviceReady] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [lastCallData, setLastCallData] = useState(null);

  const deviceRef  = useRef(null);
  const activeCallRef = useRef(null);
  const timerRef   = useRef(null);
  const startTimeRef = useRef(null);

  // ── Khởi tạo Twilio Device ─────────────────────────────────────────────
  const initDevice = useCallback(async () => {
    // KHÔNG re-init nếu đang có cuộc gọi hoạt động — tránh bị drop call
    if (activeCallRef.current) {
      console.log('⚠️ initDevice skipped — active call in progress');
      return;
    }

    // Nếu device đã registered rồi thì không cần re-init
    if (deviceRef.current && deviceRef.current.state === 'registered') {
      console.log('✅ initDevice skipped — device already registered');
      return;
    }

    // Nếu đã có device cũ (chưa registered), hủy bỏ trước khi đăng ký với user mới
    if (deviceRef.current) {
      try {
        deviceRef.current.destroy();
      } catch (_) {}
      deviceRef.current = null;
      setDeviceReady(false);
    }

    try {
      const { data } = await api.get('/twilio/token');
      console.log('🔑 Twilio token retrieved for identity:', data.identity);

      const device = new Device(data.token, {
        logLevel: 1,
        codecPreferences: ['opus', 'pcmu'],
        enableImprovedSignalingErrorPrecision: true,
      });

      device.on('registered', () => {
        console.log(`✅ Twilio Device registered for [${data.identity}], ready for calls`);
        setDeviceReady(true);
      });

      device.on('unregistered', () => {
        console.log('⚠️ Twilio Device unregistered');
        setDeviceReady(false);
      });

      device.on('error', (twilioError) => {
        console.error('❌ Twilio Device error:', twilioError);
        if (twilioError.code === 31208 || twilioError.message?.includes('Permission')) {
          toast.error('Trình duyệt chưa cho phép truy cập Micro. Vui lòng bật Micro!');
        } else {
          toast.error(`Lỗi thiết bị Twilio (${twilioError.code || ''}): ${twilioError.message}`);
        }
      });

      // Nhận cuộc gọi đến
      device.on('incoming', (call) => {
        console.log('📲 Incoming call received! From:', call.parameters.From, 'CallSid:', call.parameters.CallSid);
        activeCallRef.current = call;
        setCallerInfo({
          name: call.parameters.From || 'Số không xác định',
          number: call.parameters.From,
          direction: 'inbound',
        });
        setCallState(CALL_STATE.RINGING);

        // Gắn sự kiện cho cuộc gọi đến
        call.on('cancel', () => {
          console.log('📞 Incoming call cancelled by caller');
          resetCall();
        });
        call.on('disconnect', (c) => {
          console.log('📞 Incoming call disconnected. Status:', c?.status?.());
          handleCallEnd('inbound');
        });
        call.on('error', (error) => {
          console.error('❌ Incoming call error:', error.code, error.message);
          toast.error(`Lỗi cuộc gọi: ${error.message}`);
          resetCall();
        });
        call.on('accept', () => {
          console.log('✅ Incoming call ACCEPTED by Twilio SDK — audio bridge established');
        });
        call.on('reject', () => {
          console.log('📞 Incoming call rejected');
          resetCall();
        });
        call.on('reconnecting', (error) => {
          console.warn('🔄 Incoming call reconnecting...', error?.message);
        });
        call.on('reconnected', () => {
          console.log('✅ Incoming call reconnected');
        });
      });

      device.on('tokenWillExpire', async () => {
        const { data } = await api.get('/twilio/token');
        device.updateToken(data.token);
      });

      await device.register();
      deviceRef.current = device;
    } catch (err) {
      console.error('❌ Không thể khởi tạo Twilio Device:', err.message);
      if (err.response?.status === 429) {
        console.warn('🔄 Quá nhiều request lấy Twilio token (429). Thử lại sau 4s...');
        setTimeout(() => {
          initDevice();
        }, 4000);
      }
    }
  }, []);

  // ── Gọi ra ───────────────────────────────────────────────────────────────
  const makeCall = useCallback(async ({ to, clientName, clientId, purpose }) => {
    if (!deviceRef.current) {
      toast.loading('Đang khởi tạo lại thiết bị cuộc gọi...', { id: 'init-dev' });
      await initDevice();
      toast.dismiss('init-dev');
    }
    if (!deviceRef.current) {
      toast.error('Không thể kết nối dịch vụ thoại Twilio. Vui lòng F5 trang!');
      return;
    }
    try {
      setCallState(CALL_STATE.CONNECTING);
      setCallerInfo({ name: clientName || to, number: to, direction: 'outbound', clientId, purpose });

      const call = await deviceRef.current.connect({
        params: {
          To: to,
          custom_to: to,
          target: to,
          Purpose: purpose || '',
          ClientId: String(clientId || ''),
        },
      });

      activeCallRef.current = call;

      call.on('accept', () => {
        setCallState(CALL_STATE.IN_CALL);
        startTimer();
      });

      call.on('ringing', () => setCallState(CALL_STATE.CONNECTING));

      call.on('disconnect', () => handleCallEnd('outbound'));

      call.on('error', (err) => {
        toast.error('Cuộc gọi thất bại: ' + err.message);
        resetCall();
      });
    } catch (err) {
      toast.error('Không thể thực hiện cuộc gọi');
      resetCall();
    }
  }, []);

  // ── Nghe cuộc gọi đến ────────────────────────────────────────────────────
  const acceptCall = useCallback(() => {
    if (!activeCallRef.current) {
      console.error('❌ acceptCall: No active call to accept');
      return;
    }
    try {
      console.log('📞 Accepting incoming call...', 'Status before accept:', activeCallRef.current.status());
      activeCallRef.current.accept();
      console.log('📞 call.accept() called. Status after accept:', activeCallRef.current.status());
      setCallState(CALL_STATE.IN_CALL);
      startTimer();
    } catch (err) {
      console.error('❌ Error accepting call:', err);
      toast.error('Không thể nghe máy: ' + err.message);
      resetCall();
    }
  }, []);

  // ── Từ chối cuộc gọi đến ─────────────────────────────────────────────────
  const rejectCall = useCallback(() => {
    if (!activeCallRef.current) return;
    activeCallRef.current.reject();
    resetCall();
  }, []);

  // ── Kết thúc cuộc gọi ────────────────────────────────────────────────────
  const hangUp = useCallback(() => {
    if (!activeCallRef.current) return;
    activeCallRef.current.disconnect();
  }, []);

  // ── Mute/Unmute ───────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    if (!activeCallRef.current) return;
    const next = !isMuted;
    activeCallRef.current.mute(next);
    setIsMuted(next);
  }, [isMuted]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  const startTimer = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ── Xử lý sau khi cuộc gọi kết thúc ──────────────────────────────────────
  const handleCallEnd = (direction) => {
    stopTimer();
    const duration = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 0;

    setLastCallData({
      duration_seconds: duration,
      call_type: direction,
      call_sid: activeCallRef.current?.parameters?.CallSid,
      client_id: callerInfo?.clientId || null,
      purpose: callerInfo?.purpose || '',
    });

    activeCallRef.current = null;
    startTimeRef.current = null;
    setCallDuration(0);
    setIsMuted(false);
    setCallState(CALL_STATE.IDLE);

    // Mở modal điền kết quả cuộc gọi
    if (duration > 5) {
      setShowLogModal(true);
    }
  };

  const resetCall = () => {
    stopTimer();
    activeCallRef.current = null;
    startTimeRef.current = null;
    setCallDuration(0);
    setIsMuted(false);
    setCallerInfo(null);
    setCallState(CALL_STATE.IDLE);
  };

  const closeLogModal = () => {
    setShowLogModal(false);
    setLastCallData(null);
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const value = {
    callState,
    callerInfo,
    callDuration,
    isMuted,
    deviceReady,
    showLogModal,
    lastCallData,
    initDevice,
    makeCall,
    acceptCall,
    rejectCall,
    hangUp,
    toggleMute,
    formatDuration,
    closeLogModal,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}
