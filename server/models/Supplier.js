const db = require('../config/database');

class Supplier {
  static async findAll() {
    const query = 'SELECT * FROM suppliers ORDER BY name';
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM suppliers WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async create({ name, contact_person, email, phone, address }) {
    const query = `
      INSERT INTO suppliers (name, contact_person, email, phone, address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [name, contact_person, email, phone, address];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async update(id, { name, contact_person, email, phone, address }) {
    const query = `
      UPDATE suppliers
      SET name = $1, contact_person = $2, email = $3, phone = $4, address = $5
      WHERE id = $6
      RETURNING *
    `;
    const values = [name, contact_person, email, phone, address, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM suppliers WHERE id = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Supplier; 