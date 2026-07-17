const express = require('express');
const router = express.Router();
const c = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');
router.use(authenticate);
router.use(authorize('admin', 'manager'));
router.get('/', c.getAll);
router.get('/overdue', c.getOverdue);
router.post('/', c.create);
router.post('/:id/remind', c.sendReminder);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
module.exports = router;

