const AuditLog = require('../models/AuditLog');

exports.getAllLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 