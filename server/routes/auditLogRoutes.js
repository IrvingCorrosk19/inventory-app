const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const authorizeRole = require('../middleware/authorizeRole');

router.get('/', authorizeRole('admin'), auditLogController.getAllLogs);

module.exports = router; 