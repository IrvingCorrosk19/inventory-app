const db = require('../config/database');

class Role {
  static async findAll() {
    const query = 'SELECT * FROM roles ORDER BY name';
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM roles WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async findByName(name) {
    const query = 'SELECT * FROM roles WHERE name = $1';
    const { rows } = await db.query(query, [name]);
    return rows[0];
  }

  static async create({ name, description }) {
    const query = `
      INSERT INTO roles (name, description)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [name, description];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async update(id, { name, description }) {
    const query = `
      UPDATE roles
      SET name = $1, description = $2
      WHERE id = $3
      RETURNING *
    `;
    const values = [name, description, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM roles WHERE id = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Role; 