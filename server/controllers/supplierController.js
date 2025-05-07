const Supplier = require('../models/Supplier');
const AuditLog = require('../models/AuditLog');

exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    await AuditLog.create({
      user_id: req.user.id,
      action: 'CREAR',
      entity: 'Proveedor',
      entity_id: supplier.id,
      details: JSON.stringify(supplier)
    });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.update(req.params.id, req.body);
    await AuditLog.create({
      user_id: req.user.id,
      action: 'ACTUALIZAR',
      entity: 'Proveedor',
      entity_id: supplier.id,
      details: JSON.stringify(supplier)
    });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.delete(req.params.id);
    await AuditLog.create({
      user_id: req.user.id,
      action: 'ELIMINAR',
      entity: 'Proveedor',
      entity_id: supplier.id,
      details: JSON.stringify(supplier)
    });
    res.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 