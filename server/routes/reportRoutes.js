const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/movements', reportController.getMovementsReport);

module.exports = router; 