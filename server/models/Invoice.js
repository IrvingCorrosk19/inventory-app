const db = require('../config/database');

class Invoice {
  static async findAll() {
    const query = `
      SELECT * FROM invoices ORDER BY created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async create({ number, date, total, type }) {
    const query = `
      INSERT INTO invoices (number, date, total, type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [number, date, total, type];
    const { rows } = await db.query(query, values);
    return rows[0];
  }
}

module.exports = Invoice; 