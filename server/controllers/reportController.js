const InventoryMovement = require('../models/InventoryMovement');

exports.getMovementsReport = async (req, res) => {
  try {
    const { startDate, endDate, type, productId } = req.query;
    let movements = await InventoryMovement.findAll();
    if (startDate) {
      movements = movements.filter(m => new Date(m.created_at) >= new Date(startDate));
    }
    if (endDate) {
      movements = movements.filter(m => new Date(m.created_at) <= new Date(endDate));
    }
    if (type) {
      movements = movements.filter(m => m.movement_type === type);
    }
    if (productId) {
      movements = movements.filter(m => m.product_id == productId);
    }
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 