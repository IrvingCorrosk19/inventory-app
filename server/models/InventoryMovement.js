const db = require('../config/database');

class InventoryMovement {
  static async findAll() {
    const query = `
      SELECT im.*, p.name as product_name, u.username as user_name
      FROM inventory_movements im
      LEFT JOIN products p ON im.product_id = p.id
      LEFT JOIN users u ON im.user_id = u.id
      ORDER BY im.created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT im.*, p.name as product_name, u.username as user_name
      FROM inventory_movements im
      LEFT JOIN products p ON im.product_id = p.id
      LEFT JOIN users u ON im.user_id = u.id
      WHERE im.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async findByProductId(productId) {
    const query = `
      SELECT im.*, p.name as product_name, u.username as user_name
      FROM inventory_movements im
      LEFT JOIN products p ON im.product_id = p.id
      LEFT JOIN users u ON im.user_id = u.id
      WHERE im.product_id = $1
      ORDER BY im.created_at DESC
    `;
    const { rows } = await db.query(query, [productId]);
    return rows;
  }

  static async create({ product_id, movement_type, quantity, user_id, notes }) {
    const query = `
      INSERT INTO inventory_movements (product_id, movement_type, quantity, user_id, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [product_id, movement_type, quantity, user_id, notes];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async update(id, { notes }) {
    const query = `
      UPDATE inventory_movements
      SET notes = $1
      WHERE id = $2
      RETURNING *
    `;
    const values = [notes, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM inventory_movements WHERE id = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = InventoryMovement; 