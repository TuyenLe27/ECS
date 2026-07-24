import React, { useState, useEffect } from 'react';
import {
  Phone, PhoneOff, PhoneIncoming, PhoneMissed,
  Mic, MicOff, X, ChevronDown, ChevronUp, Loader
} from 'lucide-react';
import { useCall, CALL_STATE } from '../context/CallContext';
import { clientsApi } from '../api';
import api from '../api/axios';
import toast from 'react-hot-toast';

// ─── Quick Log Modal ─────────────────────────────────────────────────────────
function QuickLogModal({ data, onClose }) {
  const [outcome, setOutcome] = useState('completed');
  const [notes, setNotes]   = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/twilio/log', {
        ...data,
        outcome,
        notes,
      });
      toast.success('Đã lưu kết quả cuộc gọi!');
      onClose();
    } catch {
      toast.error('Không thể lưu call log');
    } finally {
      setSaving(false);
    }
  };

  const mins = Math.floor((data?.duration_seconds || 0) / 60);
  const secs = (data?.duration_seconds || 0) % 60;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 16, padding: 28,
        width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 16 }}>
            📋 Kết Quả Cuộc Gọi
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 16px',
          marginBottom: 18, display: 'flex', justifyContent: 'space-between',
          fontSize: 13, color: 'var(--text-muted)',
        }}>
          <span>⏱ Thời lượng</span>
          <strong style={{ color: 'var(--text-primary)' }}>
            {mins}:{String(secs).padStart(2, '0')} phút
          </strong>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Kết Quả Cuộc Gọi
          </label>
          <select
            className="form-control"
            value={outcome}
            onChange={e => setOutcome(e.target.value)}
          >
            <option value="completed">Completed</option>
            <option value="resolved">Resolved</option>
            <option value="callback">Callback</option>
            <option value="no_answer">No Answer</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Ghi Chú
          </label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Nội dung trao đổi, bước tiếp theo..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Bỏ qua
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : '💾 Lưu Log'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Outbound Call Modal ──────────────────────────────────────────────────────
function OutboundModal({ onClose }) {
  const { makeCall, deviceReady, initDevice } = useCall();
  const [tab, setTab]           = useState('internal'); // 'internal' | 'external'
  const [clients, setClients]   = useState([]);
  const [users, setUsers]       = useState([]);
  const [clientId, setClientId] = useState('');
  const [phone, setPhone]       = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [purpose, setPurpose]   = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!deviceReady) {
      initDevice();
    }
    Promise.all([
      clientsApi.getAll(),
      api.get('/twilio/users'),
    ]).then(([cRes, uRes]) => {
      setClients(cRes.data);
      setUsers(uRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [deviceReady, initDevice]);

  const selectedClient = clients.find(c => String(c.id) === String(clientId));

  const handleCall = () => {
    if (tab === 'internal') {
      if (!selectedUser) return toast.error('Vui lòng chọn nhân viên cần gọi');
      const user = users.find(u => u.identity === selectedUser);
      makeCall({
        to: `client:${selectedUser}`,
        clientName: user?.displayName || selectedUser,
        clientId: null,
        purpose: purpose || 'Gọi nội bộ',
      });
    } else {
      if (!phone) return toast.error('Vui lòng nhập số điện thoại');
      makeCall({
        to: phone,
        clientName: selectedClient?.company_name || phone,
        clientId: clientId || null,
        purpose,
      });
    }
    onClose();
  };

  const tabStyle = (active) => ({
    flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
    borderRadius: 8, transition: 'all 0.2s',
    background: active ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,0.05)',
    color: active ? '#fff' : '#64748b',
    boxShadow: active ? '0 4px 12px rgba(59,130,246,0.3)' : 'none',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 16, padding: 24,
        width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        border: '1px solid var(--border-color)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 16 }}>📞 Gọi Ra</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 10 }}>
          <button style={tabStyle(tab === 'internal')} onClick={() => setTab('internal')}>
            🏢 Gọi Nội Bộ
          </button>
          <button style={tabStyle(tab === 'external')} onClick={() => setTab('external')}>
            📱 Gọi Số Thật
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>Đang tải...</div>
        ) : tab === 'internal' ? (
          <>
            <div style={{
              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#60a5fa',
            }}>
              💡 Gọi trực tiếp tới trình duyệt của nhân viên khác — hoạt động với Twilio trial, không cần số thật.
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Chọn Nhân Viên *
              </label>
              {users.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 8, textAlign: 'center' }}>
                  Không có nhân viên nào đang online
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                  {users.map(u => (
                    <div
                      key={u.identity}
                      onClick={() => setSelectedUser(u.identity)}
                      style={{
                        padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                        background: selectedUser === u.identity ? 'rgba(59,130,246,0.15)' : 'var(--bg-secondary)',
                        border: selectedUser === u.identity ? '1px solid #3b82f6' : '1px solid transparent',
                        display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, color: '#fff',
                      }}>
                        {u.displayName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{u.displayName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{u.role}</div>
                      </div>
                      {selectedUser === u.identity && (
                        <div style={{ marginLeft: 'auto', color: '#3b82f6', fontSize: 16 }}>✓</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Mục Đích</label>
              <input className="form-control" placeholder="Họp nội bộ, hỗ trợ kỹ thuật..." value={purpose} onChange={e => setPurpose(e.target.value)} />
            </div>
          </>
        ) : (
          <>
            <div style={{
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#fbbf24',
            }}>
              ⚠️ Twilio trial chỉ gọi được số đã verify. Nâng cấp tài khoản để gọi mọi số.
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Khách Hàng (tuỳ chọn)</label>
              <select className="form-control" value={clientId} onChange={e => {
                setClientId(e.target.value);
                const cl = clients.find(c => String(c.id) === e.target.value);
                if (cl?.phone) setPhone(cl.phone);
              }}>
                <option value="">-- Chọn khách hàng --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Số Điện Thoại *</label>
              <input className="form-control" type="tel" placeholder="+84xxxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Mục Đích Cuộc Gọi</label>
              <input className="form-control" placeholder="Tư vấn dịch vụ..." value={purpose} onChange={e => setPurpose(e.target.value)} />
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Hủy</button>
          <button
            className="btn btn-primary"
            style={{ flex: 1, background: 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none' }}
            onClick={handleCall}
            disabled={tab === 'internal' ? !selectedUser : !phone}
          >
            <Phone size={15} style={{ marginRight: 6 }} />
            Gọi Ngay
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main CallWidget ──────────────────────────────────────────────────────────
export default function CallWidget() {
  const {
    callState, callerInfo, callDuration, isMuted,
    deviceReady, showLogModal, lastCallData,
    acceptCall, rejectCall, hangUp, toggleMute,
    formatDuration, closeLogModal,
  } = useCall();

  const [showOutboundModal, setShowOutboundModal] = useState(false);
  const [minimized, setMinimized] = useState(false);

  // Tự động mở widget & phát âm thanh chuông reo khi có cuộc gọi đến
  useEffect(() => {
    if (callState === CALL_STATE.RINGING) {
      setMinimized(false);
      let audioCtx = null;
      let interval = null;

      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const playBeep = () => {
          if (!audioCtx || audioCtx.state === 'closed') return;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.4);
        };

        playBeep();
        interval = setInterval(playBeep, 1200);
      } catch (_) {}

      return () => {
        if (interval) clearInterval(interval);
        if (audioCtx) audioCtx.close();
      };
    }
  }, [callState]);

  const widgetStyle = {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 8888,
    fontFamily: 'inherit',
  };

  // ── Trạng thái: Reo chuông (inbound) ────────────────────────────────────
  if (callState === CALL_STATE.RINGING) {
    return (
      <>
        <div style={widgetStyle}>
          <div style={{
            background: 'linear-gradient(135deg,#1e293b,#0f172a)',
            border: '2px solid #22c55e',
            borderRadius: 20,
            padding: '20px 24px',
            minWidth: 280,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 4px rgba(34,197,94,0.15)',
            animation: 'pulse-ring 1.5s infinite',
            color: '#fff',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', fontSize: 24,
                boxShadow: '0 0 20px rgba(34,197,94,0.4)',
              }}>
                <PhoneIncoming size={26} color="#fff" />
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', letterSpacing: 1, marginBottom: 4 }}>
                CUỘC GỌI ĐẾN
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9' }}>
                {callerInfo?.name || 'Số không xác định'}
              </div>
              {callerInfo?.number && callerInfo.number !== callerInfo.name && (
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                  {callerInfo.number}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              <button
                id="reject-call-btn"
                onClick={rejectCall}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                  color: '#fff', fontWeight: 600, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: '0 4px 15px rgba(239,68,68,0.3)',
                }}
              >
                <PhoneMissed size={16} /> Từ chối
              </button>
              <button
                id="accept-call-btn"
                onClick={acceptCall}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                  color: '#fff', fontWeight: 600, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: '0 4px 15px rgba(34,197,94,0.3)',
                }}
              >
                <Phone size={16} /> Nghe
              </button>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes pulse-ring {
            0%,100% { box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 4px rgba(34,197,94,0.15); }
            50% { box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 8px rgba(34,197,94,0.3); }
          }
        `}</style>
      </>
    );
  }

  // ── Trạng thái: Đang gọi (in-call) ───────────────────────────────────────
  if (callState === CALL_STATE.IN_CALL || callState === CALL_STATE.CONNECTING) {
    const isConnecting = callState === CALL_STATE.CONNECTING;
    return (
      <div style={widgetStyle}>
        <div style={{
          background: 'linear-gradient(135deg,#1e293b,#0f172a)',
          border: '2px solid #3b82f6',
          borderRadius: 20,
          padding: '18px 22px',
          minWidth: 260,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          color: '#fff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: isConnecting
                ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                : 'linear-gradient(135deg,#3b82f6,#2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {isConnecting ? <Loader size={20} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> : <Phone size={20} color="#fff" />}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', letterSpacing: 1 }}>
                {isConnecting ? 'ĐANG KẾT NỐI...' : 'ĐANG GỌI'}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>
                {callerInfo?.name || callerInfo?.number || 'Đang kết nối...'}
              </div>
              {!isConnecting && (
                <div style={{ fontSize: 13, color: '#3b82f6', fontWeight: 600, fontFamily: 'monospace' }}>
                  {formatDuration(callDuration)}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              id="mute-call-btn"
              onClick={toggleMute}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: isMuted ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)',
                color: isMuted ? '#ef4444' : '#94a3b8', fontWeight: 500, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}
            >
              {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button
              id="hangup-btn"
              onClick={hangUp}
              style={{
                flex: 2, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                color: '#fff', fontWeight: 600, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: '0 4px 15px rgba(239,68,68,0.3)',
              }}
            >
              <PhoneOff size={15} /> Tắt Máy
            </button>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Trạng thái: Idle ──────────────────────────────────────────────────────
  return (
    <>
      {!minimized ? (
        <div style={widgetStyle}>
          <div style={{
            background: 'linear-gradient(135deg,#1e293b,#0f172a)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 18,
            padding: '14px 18px',
            minWidth: 230,
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
            color: '#fff',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: deviceReady ? 'default' : 'pointer' }}
                onClick={() => !deviceReady && initDevice()}
                title={deviceReady ? 'Thiết bị đang hoạt động bình thường' : 'Bấm để kết nối lại với Twilio'}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: deviceReady ? '#22c55e' : '#f59e0b',
                  boxShadow: deviceReady ? '0 0 6px #22c55e' : '0 0 6px #f59e0b',
                }} />
                <span style={{ fontSize: 12, color: deviceReady ? '#94a3b8' : '#f59e0b', fontWeight: deviceReady ? 400 : 600 }}>
                  {deviceReady ? 'Sẵn sàng nhận cuộc gọi' : 'Chưa kết nối (Bấm để thử lại)'}
                </span>
              </div>
              <button
                onClick={() => setMinimized(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}
              >
                <ChevronDown size={16} />
              </button>
            </div>

            <button
              id="outbound-call-btn"
              onClick={() => setShowOutboundModal(true)}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                color: '#fff', fontWeight: 600, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                boxShadow: '0 4px 15px rgba(34,197,94,0.25)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Phone size={15} /> Gọi Ra
            </button>
          </div>
        </div>
      ) : (
        <div style={widgetStyle}>
          <button
            onClick={() => setMinimized(false)}
            style={{
              width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#22c55e,#16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(34,197,94,0.4)',
              color: '#fff',
            }}
            title="Mở điện thoại"
          >
            <Phone size={22} />
          </button>
        </div>
      )}

      {showOutboundModal && <OutboundModal onClose={() => setShowOutboundModal(false)} />}
      {showLogModal && <QuickLogModal data={lastCallData} onClose={closeLogModal} />}
    </>
  );
}
