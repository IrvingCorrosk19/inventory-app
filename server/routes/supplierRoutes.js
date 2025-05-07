const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticateToken } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

router.get('/', supplierController.getAllSuppliers);
router.post('/', supplierController.createSupplier);
router.put('/:id', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router; 