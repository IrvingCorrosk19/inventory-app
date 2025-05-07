const db = require('../config/database');

class AuditLog {
  static async create({ user_id, action, entity, entity_id, details }) {
    const query = `
      INSERT INTO audit_logs (user_id, action, entity, entity_id, details)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [user_id, action, entity, entity_id, details];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = `
      SELECT al.*, u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }
}

module.exports = AuditLog; 