const twilio = require('twilio');
const { CallLog, Client, User, Employee } = require('../models');

// ─── GET /api/twilio/users ──────────────────────────────────────────────────
// Lấy danh sách users có employee để gọi nội bộ (app-to-app)
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { is_active: 1 },
      attributes: ['id', 'full_name', 'username', 'role', 'employee_id'],
      include: [{ model: Employee, as: 'employee', attributes: ['first_name', 'last_name', 'emp_code'] }],
    });

    // Loại bỏ chính mình khỏi danh sách
    const filtered = users
      .filter(u => u.id !== req.user.id && u.employee_id)
      .map(u => ({
        userId: u.id,
        identity: `user_${u.id}`,
        displayName: u.employee
          ? `${u.employee.last_name} ${u.employee.first_name} (${u.employee.emp_code})`
          : u.full_name || u.username,
        role: u.role,
      }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const apiKey     = process.env.TWILIO_API_KEY;
const apiSecret  = process.env.TWILIO_API_SECRET;
const twimlAppSid   = process.env.TWILIO_TWIML_APP_SID;
const twilioPhone   = process.env.TWILIO_PHONE_NUMBER;

// ─── GET /api/twilio/token ──────────────────────────────────────────────────
// Tạo Access Token cho Twilio Voice SDK (browser client)
// Identity = "user_<userId>" để Twilio biết user nào đang online
const generateToken = async (req, res) => {
  try {
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant  = AccessToken.VoiceGrant;

    const identity = `user_${req.user.id}`;

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true,
    });

    const token = new AccessToken(accountSid, apiKey, apiSecret, {
      identity,
      ttl: 3600, // 1 giờ
    });
    token.addGrant(voiceGrant);

    res.json({ token: token.toJwt(), identity });
  } catch (err) {
    console.error('❌ Twilio token error:', err.message);
    res.status(500).json({ message: 'Không thể tạo token', error: err.message });
  }
};

// ─── POST /api/twilio/voice ─────────────────────────────────────────────────
// TwiML webhook: Twilio gọi endpoint này khi nhân viên bấm "Gọi ra" từ browser
// Params từ Twilio: To (số điện thoại đích), From (Twilio number)
const handleOutbound = (req, res) => {
  try {
    console.log('📞 Outbound webhook hit — req.body:', req.body);
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();

    // Twilio Voice SDK đặt To = APxxxx (TwiML App SID). Lấy destination thật từ custom_to hoặc target
    let to = req.body.custom_to || req.body.target || req.body.To || req.body.to;

    // Nếu 'to' nhận được là TwiML App SID (bắt đầu bằng AP) thì dùng custom_to hoặc target
    if (to && to.startsWith('AP')) {
      to = req.body.custom_to || req.body.target || req.body.destination;
    }

    if (!to || to.startsWith('AP')) {
      console.error('❌ Không tìm thấy destination To hợp lệ:', req.body);
      twiml.say({ language: 'vi-VN' }, 'Không tìm thấy số điện thoại đích.');
      return res.type('text/xml').send(twiml.toString());
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    let baseUrl = '';

    // Chỉ dùng recordingStatusCallback nếu host là public URL (không chứa localhost/127.0.0.1)
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1') && !host.includes('::1')) {
      baseUrl = `${protocol}://${host}`;
    }

    const dialOptions = {
      record: 'record-from-answer',
    };

    if (baseUrl) {
      dialOptions.recordingStatusCallback = `${baseUrl}/api/twilio/recording`;
      dialOptions.recordingStatusCallbackMethod = 'POST';
    }

    if (to.startsWith('client:') || to.startsWith('user_')) {
      const targetClient = to.replace(/^client:/, '');
      console.log(`📞 Dialing internal client: [${targetClient}] with recording (baseUrl: ${baseUrl || 'N/A'})`);
      const dial = twiml.dial(dialOptions);
      dial.client(targetClient);
    } else {
      console.log(`📞 Dialing external number: [${to}] with recording (baseUrl: ${baseUrl || 'N/A'})`);
      const dial = twiml.dial({ ...dialOptions, callerId: twilioPhone });
      dial.number(to);
    }

    const xml = twiml.toString();
    console.log('📄 Generated TwiML:\n', xml);
    res.type('text/xml').send(xml);
  } catch (err) {
    console.error('❌ Twilio outbound error:', err.message);
    res.status(500).send('Error generating TwiML');
  }
};

// ─── POST /api/twilio/incoming ──────────────────────────────────────────────
// TwiML webhook: Twilio gọi endpoint này khi có cuộc gọi đến số Twilio
const handleIncoming = async (req, res) => {
  try {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();

    const targetIdentity = req.query.targetIdentity || req.body.targetIdentity;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    let baseUrl = '';

    if (host && !host.includes('localhost') && !host.includes('127.0.0.1') && !host.includes('::1')) {
      baseUrl = `${protocol}://${host}`;
    }

    const dialOptions = {
      callerId: req.body.From || twilioPhone,
      record: 'record-from-answer',
    };

    if (baseUrl) {
      dialOptions.recordingStatusCallback = `${baseUrl}/api/twilio/recording`;
      dialOptions.recordingStatusCallbackMethod = 'POST';
    }

    const dial = twiml.dial(dialOptions);

    if (targetIdentity) {
      dial.client(targetIdentity);
    } else {
      twiml.say({ language: 'vi-VN' }, 'Xin chào, hiện không có nhân viên nào sẵn sàng. Vui lòng gọi lại sau.');
    }

    res.type('text/xml').send(twiml.toString());
  } catch (err) {
    console.error('❌ Twilio incoming error:', err.message);
    res.status(500).send('Error generating TwiML');
  }
};

// ─── POST /api/twilio/recording ─────────────────────────────────────────────
// Webhook từ Twilio báo khi file ghi âm đã được khởi tạo xong
const handleRecordingCallback = async (req, res) => {
  try {
    const { CallSid, RecordingUrl, RecordingSid, RecordingDuration } = req.body;
    console.log(`🎙️ Recording Callback hit — CallSid: ${CallSid}, Duration: ${RecordingDuration}s, URL: ${RecordingUrl}`);

    if (!CallSid || !RecordingUrl) {
      return res.status(200).send('OK');
    }

    const mp3Url = `${RecordingUrl}.mp3`;
    const { Op } = require('sequelize');

    // 1. Tìm tất cả CallLog có notes chứa CallSid (parent call)
    const parentLogs = await CallLog.findAll({
      where: { notes: { [Op.like]: `%${CallSid}%` } },
    });

    // 2. Tìm child calls qua Twilio API (outbound-dial có parentCallSid = CallSid)
    let childCallSids = [];
    try {
      const twilioClient = twilio(accountSid, authToken);
      const childCalls = await twilioClient.calls.list({ parentCallSid: CallSid, limit: 5 });
      childCallSids = childCalls.map(c => c.sid);
      console.log(`🔗 Found ${childCallSids.length} child calls for parent ${CallSid}:`, childCallSids);
    } catch (err) {
      console.warn('⚠️ Could not fetch child calls:', err.message);
    }

    // 3. Tìm CallLog cho các child call SIDs
    let childLogs = [];
    if (childCallSids.length > 0) {
      const conditions = childCallSids.map(sid => ({ [Op.like]: `%${sid}%` }));
      childLogs = await CallLog.findAll({
        where: { notes: { [Op.or]: conditions } },
      });
    }

    // 4. Gộp tất cả logs cần cập nhật (chỉ dùng CallSid match chính xác)
    const allLogs = [...parentLogs, ...childLogs];

    // 6. Cập nhật recording_url cho tất cả log tìm được
    if (allLogs.length > 0) {
      const updatedIds = [];
      for (const log of allLogs) {
        if (!log.recording_url) {
          await log.update({
            recording_url: mp3Url,
            recording_sid: RecordingSid || null,
          });
          updatedIds.push(log.id);
        }
      }
      console.log(`✅ Updated ${updatedIds.length} CallLog(s) with recording: #${updatedIds.join(', #')}`);
    } else {
      console.warn(`⚠️ No CallLog found for CallSid ${CallSid} or its children`);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Recording callback error:', err.message);
    res.status(500).send('Error');
  }
};

// ─── GET /api/twilio/recording-proxy ────────────────────────────────────────
// Endpoint proxy phát/tải audio MP3 ghi âm từ Twilio (xử lý Basic Auth)
const proxyRecording = async (req, res) => {
  try {
    const { url, download } = req.query;
    if (!url) return res.status(400).send('Thiếu tham số url');

    let targetUrl = url;
    if (targetUrl.includes('twilio.com') && !targetUrl.endsWith('.mp3')) {
      targetUrl = `${targetUrl}.mp3`;
    }
    if (targetUrl.startsWith('http://')) targetUrl = targetUrl.replace('http://', 'https://');

    const headers = {};
    if (targetUrl.includes('twilio.com')) {
      headers.Authorization = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    }

    const response = await fetch(targetUrl, { headers });

    if (!response.ok) {
      console.error(`❌ Proxy recording fetch failed (${response.status}):`, targetUrl);
      return res.status(response.status).send('Không thể tải file ghi âm');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Accept-Ranges', 'bytes');

    if (download === '1' || download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="call-recording-${Date.now()}.mp3"`);
    } else {
      res.setHeader('Content-Disposition', 'inline');
    }

    res.send(buffer);
  } catch (err) {
    console.error('❌ Proxy recording error:', err.message);
    res.status(500).send('Lỗi tải file ghi âm');
  }
};

// ─── POST /api/twilio/status ────────────────────────────────────────────────
// StatusCallback: Twilio gọi endpoint này khi cuộc gọi kết thúc
// Tự động tạo CallLog với duration thực tế
const handleStatusCallback = async (req, res) => {
  try {
    const {
      CallStatus,
      CallSid,
      Duration,      // tính bằng giây
      To,
      From,
      Direction,     // inbound | outbound-api | outbound-dial
      CallerId,
      RecordingUrl,
    } = req.body;

    // Chỉ xử lý khi cuộc gọi đã hoàn tất
    if (CallStatus !== 'completed') {
      return res.status(200).send('OK');
    }

    const durationMinutes = Math.ceil((parseInt(Duration) || 0) / 60);
    const callType = Direction === 'inbound' ? 'inbound' : 'outbound';

    // Xác định số điện thoại của đối phương
    const externalNumber = callType === 'inbound' ? From : To;

    // Tìm client theo số điện thoại (nếu có field phone trong DB)
    let clientId = null;
    try {
      const client = await Client.findOne({ where: { phone: externalNumber } });
      if (client) clientId = client.id;
    } catch (_) { /* phone field có thể không tồn tại, bỏ qua */ }

    // Tìm employee từ identity (format: user_<userId>)
    let employeeId = null;
    const identityMatch = (To || '').match(/user_(\d+)/);
    if (identityMatch) {
      const userId = parseInt(identityMatch[1]);
      const userRecord = await User.findByPk(userId);
      if (userRecord) employeeId = userRecord.employee_id;
    }

    if (!employeeId) {
      const fromIdentityMatch = (From || '').match(/user_(\d+)/);
      if (fromIdentityMatch) {
        const userId = parseInt(fromIdentityMatch[1]);
        const userRecord = await User.findByPk(userId);
        if (userRecord) employeeId = userRecord.employee_id;
      }
    }

    // Tạo CallLog (chỉ tạo khi có đủ thông tin cơ bản)
    if (employeeId) {
      const mp3Url = RecordingUrl ? `${RecordingUrl}.mp3` : null;
      await CallLog.create({
        client_id: clientId || null,
        employee_id: employeeId,
        call_type: callType,
        call_datetime: new Date(),
        duration_minutes: durationMinutes,
        purpose: `Cuộc gọi ${callType === 'inbound' ? 'đến' : 'đi'} — ${externalNumber}`,
        outcome: durationMinutes > 0 ? 'completed' : 'no_answer',
        notes: `CallSid: ${CallSid} | Duration: ${Duration}s`,
        recording_url: mp3Url,
      });
      console.log(`✅ Auto CallLog created — SID: ${CallSid}, Duration: ${Duration}s, Employee: ${employeeId}, Recording: ${mp3Url || 'N/A'}`);
    } else {
      console.log(`⚠️ CallLog skipped — could not resolve employee from SID: ${CallSid}`);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ StatusCallback error:', err.message);
    res.status(500).send('Error');
  }
};

// ─── POST /api/twilio/log ───────────────────────────────────────────────────
// Frontend fallback: tạo CallLog từ phía browser (khi StatusCallback fail)
const createCallLog = async (req, res) => {
  try {
    const { client_id, duration_seconds, call_type, purpose, outcome, notes, call_sid, recording_url } = req.body;

    const userRecord = await User.findByPk(req.user.id);
    let employeeId = userRecord?.employee_id;

    if (!employeeId) {
      const firstEmp = await Employee.findOne({ attributes: ['id'] });
      employeeId = firstEmp ? firstEmp.id : 1;
    }

    const log = await CallLog.create({
      client_id: client_id || null,
      employee_id: employeeId,
      call_type: call_type || 'outbound',
      call_datetime: new Date(),
      duration_minutes: Math.ceil((parseInt(duration_seconds) || 0) / 60),
      purpose: purpose || 'Cuộc gọi qua hệ thống',
      outcome: outcome || 'completed',
      notes: notes || (call_sid ? `CallSid: ${call_sid}` : ''),
      recording_url: recording_url || null,
    });

    res.status(201).json({ message: 'Tạo call log thành công', log });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = {
  getUsers,
  generateToken,
  handleOutbound,
  handleIncoming,
  handleRecordingCallback,
  proxyRecording,
  handleStatusCallback,
  createCallLog,
};
