const db = require('../config/database');

class Purchase {
  static async findAll() {
    const query = `
      SELECT p.*, pr.name as product_name, u.username as user_name, i.id as invoice_id
      FROM purchases p
      LEFT JOIN products pr ON p.product_id = pr.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN invoices i ON p.invoice_id = i.id
      ORDER BY p.created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async create({ product_id, quantity, user_id, invoice_id }) {
    const query = `
      INSERT INTO purchases (product_id, quantity, user_id, invoice_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [product_id, quantity, user_id, invoice_id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }
}

module.exports = Purchase; 