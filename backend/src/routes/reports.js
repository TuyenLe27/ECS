const express = require('express');
const router = express.Router();
const c = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
router.use(authenticate);
router.get('/dashboard', c.getDashboard);
router.get('/export-excel', c.exportExcel);
router.get('/export-pdf', c.exportPdf);
module.exports = router;
