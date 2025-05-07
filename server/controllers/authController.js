const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'inventory_app_secret_key_2024';

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Intento de inicio de sesión:', { username });

    // Buscar usuario por username
    const user = await User.findByUsername(username);
    console.log('Usuario encontrado:', user ? {
      id: user.id,
      username: user.username,
      role_id: user.role_id,
      role_name: user.role_name
    } : 'No');
    
    if (!user) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // Verificar contraseña
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    console.log('Contraseña válida:', isValidPassword ? 'Sí' : 'No');
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // Generar token JWT
    const tokenPayload = { 
      id: user.id, 
      username: user.username,
      role: user.role_name
    };
    console.log('Payload del token:', tokenPayload);

    const token = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Token generado:', token);
    res.json({ token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}; 