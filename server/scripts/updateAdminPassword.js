const bcrypt = require('bcrypt');
const db = require('../config/database');

async function updateAdminPassword() {
  try {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      UPDATE users 
      SET password_hash = $1 
      WHERE username = 'admin' 
      RETURNING *
    `;
    
    const { rows } = await db.query(query, [hashedPassword]);
    
    if (rows.length > 0) {
      console.log('Contraseña actualizada exitosamente');
      console.log('Usuario:', rows[0]);
    } else {
      console.log('No se encontró el usuario admin');
    }
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
  } finally {
    process.exit();
  }
}

updateAdminPassword(); 