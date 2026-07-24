const express = require('express');
const router = express.Router();
const c = require('../controllers/twilioController');
const { authenticate } = require('../middleware/auth');

// ── Route yêu cầu đăng nhập (JWT) ──────────────────────────────────────────

// Tạo Access Token cho Twilio Voice SDK
router.get('/token', authenticate, c.generateToken);

// Danh sách nhân viên để gọi nội bộ (app-to-app)
router.get('/users', authenticate, c.getUsers);

// Frontend fallback: tạo CallLog thủ công sau cuộc gọi
router.post('/log', authenticate, c.createCallLog);

// Proxy phát stream / tải file ghi âm audio MP3 (cần JWT hoặc công khai)
router.get('/recording-proxy', c.proxyRecording);

// ── Twilio Webhooks (KHÔNG cần JWT — Twilio gọi trực tiếp) ─────────────────

// TwiML cho cuộc gọi ra (outbound từ browser)
router.post('/voice', c.handleOutbound);

// TwiML cho cuộc gọi vào (inbound từ số Twilio)
router.post('/incoming', c.handleIncoming);

// Recording StatusCallback: Twilio báo khi có file ghi âm mới
router.post('/recording', c.handleRecordingCallback);

// StatusCallback: Twilio báo khi cuộc gọi kết thúc → tạo CallLog tự động
router.post('/status', c.handleStatusCallback);

module.exports = router;
