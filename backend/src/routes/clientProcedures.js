const express = require('express');
const router = express.Router();
const c = require('../controllers/clientProcedureController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', c.getAll);
router.post('/', authorize('admin', 'manager'), c.create);
router.put('/:id', authorize('admin', 'manager'), c.update);
router.delete('/:id', authorize('admin', 'manager'), c.remove);

module.exports = router;
