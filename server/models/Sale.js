const db = require('../config/database');

class Sale {
  static async findAll() {
    const query = `
      SELECT s.*, p.name as product_name, u.username as user_name, i.id as invoice_id
      FROM sales s
      LEFT JOIN products p ON s.product_id = p.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN invoices i ON s.invoice_id = i.id
      ORDER BY s.created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async create({ product_id, quantity, user_id, invoice_id }) {
    const query = `
      INSERT INTO sales (product_id, quantity, user_id, invoice_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [product_id, quantity, user_id, invoice_id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }
}

module.exports = Sale; 