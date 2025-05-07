const Purchase = require('../models/Purchase');
const InventoryMovement = require('../models/InventoryMovement');
const Invoice = require('../models/Invoice');

exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.findAll();
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPurchase = async (req, res) => {
  try {
    const { product_id, quantity, user_id, invoice } = req.body;
    // Crear factura si se envía
    let invoiceRecord = null;
    if (invoice) {
      invoiceRecord = await Invoice.create(invoice);
    }
    // Registrar la compra
    const purchase = await Purchase.create({
      product_id,
      quantity,
      user_id,
      invoice_id: invoiceRecord ? invoiceRecord.id : null,
    });
    // Crear movimiento de inventario (Entrada)
    await InventoryMovement.create({
      product_id,
      movement_type: 'Entrada',
      quantity,
      user_id,
      notes: 'Compra registrada',
    });
    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

 