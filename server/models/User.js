const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async findAll() {
    const query = `
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async findByUsername(username) {
    const query = `
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.username = $1
    `;
    const { rows } = await db.query(query, [username]);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0];
  }

  static async create({ username, email, password, role_id }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (username, email, password_hash, role_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [username, email, hashedPassword, role_id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async update(id, { username, email, password, role_id, is_active }) {
    let query;
    let values;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `
        UPDATE users
        SET username = $1, email = $2, password_hash = $3, role_id = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;
      values = [username, email, hashedPassword, role_id, is_active, id];
    } else {
      query = `
        UPDATE users
        SET username = $1, email = $2, role_id = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `;
      values = [username, email, role_id, is_active, id];
    }

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User; 