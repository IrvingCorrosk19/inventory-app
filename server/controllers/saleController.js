const Sale = require('../models/Sale');
const InventoryMovement = require('../models/InventoryMovement');
const Invoice = require('../models/Invoice');

exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.findAll();
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSale = async (req, res) => {
  try {
    const { product_id, quantity, user_id, invoice } = req.body;
    // Crear factura si se envía
    let invoiceRecord = null;
    if (invoice) {
      invoiceRecord = await Invoice.create(invoice);
    }
    // Registrar la venta
    const sale = await Sale.create({
      product_id,
      quantity,
      user_id,
      invoice_id: invoiceRecord ? invoiceRecord.id : null,
    });
    // Crear movimiento de inventario (Salida)
    await InventoryMovement.create({
      product_id,
      movement_type: 'Salida',
      quantity,
      user_id,
      notes: 'Venta registrada',
    });
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 