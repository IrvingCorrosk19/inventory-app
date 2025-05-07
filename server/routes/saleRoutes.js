const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

router.get('/', saleController.getAllSales);
router.post('/', saleController.createSale);

module.exports = router; 