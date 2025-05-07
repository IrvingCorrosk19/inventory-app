const jwt = require('jsonwebtoken');
const JWT_SECRET = 'inventory_app_secret_key_2024';

function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token decodificado:', decoded);
      
      const userRole = decoded.role?.toLowerCase();
      console.log('Rol del usuario:', userRole);
      console.log('Roles permitidos:', allowedRoles);

      // Si el usuario es admin, permitir acceso sin importar los roles permitidos
      if (userRole === 'admin') {
        req.user = decoded;
        return next();
      }

      const hasPermission = allowedRoles.some(role => role.toLowerCase() === userRole);
      console.log('Tiene permiso:', hasPermission);
      
      if (!hasPermission) {
        return res.status(403).json({ message: 'No tienes permisos suficientes' });
      }
      req.user = decoded;
      next();
    } catch (err) {
      console.error('Error al verificar token:', err);
      return res.status(401).json({ message: 'Token inválido' });
    }
  };
}

module.exports = authorizeRole; 