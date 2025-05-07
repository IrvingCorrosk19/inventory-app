const InventoryMovement = require('../models/InventoryMovement');
const Product = require('../models/Product');

exports.getAllMovements = async (req, res) => {
  try {
    const movements = await InventoryMovement.findAll();
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMovementById = async (req, res) => {
  try {
    const movement = await InventoryMovement.findById(req.params.id);
    if (!movement) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    res.json(movement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createMovement = async (req, res) => {
  try {
    const { product_id, movement_type, quantity, user_id, notes } = req.body;

    // Validar que el tipo de movimiento sea válido
    if (!['ENTRY', 'EXIT', 'ADJUSTMENT'].includes(movement_type)) {
      return res.status(400).json({ error: 'Tipo de movimiento inválido' });
    }

    // Validar que la cantidad sea positiva
    if (quantity <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    // Obtener el producto para validar el stock
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Validar stock disponible para salidas
    if (movement_type === 'EXIT' && product.stock < quantity) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    // Crear el movimiento
    const movement = await InventoryMovement.create({ product_id, movement_type, quantity, user_id, notes });

    // Actualizar el stock del producto
    const stockChange = movement_type === 'ENTRY' ? quantity : 
                       movement_type === 'EXIT' ? -quantity : 
                       quantity - product.stock; // Para ajustes, la diferencia con el stock actual
    const updatedProduct = await Product.updateStock(product_id, stockChange);

    // Verificar bajo stock
    const isLowStock = updatedProduct.stock < updatedProduct.minimum_stock;
    res.status(201).json({ movement, updatedProduct, isLowStock });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMovement = async (req, res) => {
  try {
    const movement = await InventoryMovement.delete(req.params.id);
    if (!movement) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    res.json({ message: 'Movimiento eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 