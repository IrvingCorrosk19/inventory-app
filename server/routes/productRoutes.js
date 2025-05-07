const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Rutas para productos
router.post('/', productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/:id/regenerate-barcode', productController.regenerateBarcode);

module.exports = router; 