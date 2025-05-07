const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/', inventoryController.getAllMovements);
router.get('/:id', inventoryController.getMovementById);
router.post('/', inventoryController.createMovement);
router.delete('/:id', inventoryController.deleteMovement);

module.exports = router; 