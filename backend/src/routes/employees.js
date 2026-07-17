const express = require('express');
const router = express.Router();
const c = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middleware/auth');
router.use(authenticate);
router.get('/', authorize('admin', 'manager', 'staff'), c.getAll);
router.get('/:id', authorize('admin', 'manager', 'staff'), c.getById);
router.post('/', authorize('admin'), c.create);
router.put('/:id', authorize('admin'), c.update);
router.delete('/:id', authorize('admin'), c.remove);
module.exports = router;

