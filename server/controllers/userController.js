const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role_id } = req.body;
    const user = await User.create({ username, email, password, role_id });
    await AuditLog.create({
      user_id: req.user.id,
      action: 'CREAR',
      entity: 'Usuario',
      entity_id: user.id,
      details: JSON.stringify(user)
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, email, password, role_id, is_active } = req.body;
    const user = await User.update(req.params.id, { username, email, password, role_id, is_active });
    await AuditLog.create({
      user_id: req.user.id,
      action: 'ACTUALIZAR',
      entity: 'Usuario',
      entity_id: user.id,
      details: JSON.stringify(user)
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.delete(req.params.id);
    await AuditLog.create({
      user_id: req.user.id,
      action: 'ELIMINAR',
      entity: 'Usuario',
      entity_id: user.id,
      details: JSON.stringify(user)
    });
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 