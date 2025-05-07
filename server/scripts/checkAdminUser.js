const db = require('../config/database');

async function checkAdminUser() {
  try {
    // Verificar si existe el usuario admin
    const query = `
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.username = 'admin'
    `;
    
    const { rows } = await db.query(query);
    
    if (rows.length > 0) {
      console.log('Usuario admin encontrado:', rows[0]);
    } else {
      console.log('No se encontró el usuario admin');
    }
  } catch (error) {
    console.error('Error al verificar el usuario admin:', error);
  }
}

checkAdminUser(); 