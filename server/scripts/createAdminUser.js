const db = require('../config/database');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  try {
    // Verificar si existe el rol de admin
    const roleQuery = 'SELECT id FROM roles WHERE name = $1';
    const { rows: roleRows } = await db.query(roleQuery, ['admin']);
    
    if (roleRows.length === 0) {
      console.log('El rol de admin no existe. Creando...');
      const insertRoleQuery = `
        INSERT INTO roles (name, description)
        VALUES ('admin', 'Administrador del sistema con acceso total')
        RETURNING id
      `;
      const { rows: newRoleRows } = await db.query(insertRoleQuery);
      roleRows.push(newRoleRows[0]);
    }

    const roleId = roleRows[0].id;

    // Verificar si ya existe el usuario admin
    const userQuery = 'SELECT id FROM users WHERE username = $1';
    const { rows: userRows } = await db.query(userQuery, ['admin']);

    if (userRows.length === 0) {
      console.log('Creando usuario administrador...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const insertUserQuery = `
        INSERT INTO users (username, email, password_hash, role_id)
        VALUES ('admin', 'admin@inventory.com', $1, $2)
        RETURNING id
      `;
      await db.query(insertUserQuery, [hashedPassword, roleId]);
      console.log('Usuario administrador creado exitosamente');
    } else {
      console.log('El usuario administrador ya existe');
    }
  } catch (error) {
    console.error('Error al crear usuario administrador:', error);
  }
}

createAdminUser(); 