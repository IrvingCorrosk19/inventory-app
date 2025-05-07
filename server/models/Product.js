const db = require('../config/database');

class Product {
  static async findAll() {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.supplier_id,
        p.category_id,
        p.minimum_stock,
        p.maximum_stock,
        p.barcode,
        p.created_at,
        p.updated_at,
        c.name as category_name,
        s.name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.supplier_id,
        p.category_id,
        p.minimum_stock,
        p.maximum_stock,
        p.barcode,
        p.created_at,
        p.updated_at,
        c.name as category_name,
        s.name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async create({ name, description, price, stock, category_id, supplier_id, minimum_stock, maximum_stock }) {
    const query = `
      INSERT INTO products (
        name, description, price, stock, category_id, supplier_id, 
        minimum_stock, maximum_stock, barcode
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    // Generar código de barras único
    const barcode = `PRD${String(Date.now()).slice(-8)}`;
    const values = [name, description, price, stock, category_id, supplier_id, minimum_stock, maximum_stock, barcode];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async update(id, { name, description, price, stock, category_id, supplier_id, minimum_stock, maximum_stock }) {
    const query = `
      UPDATE products
      SET name = $1, description = $2, price = $3, stock = $4, 
          category_id = $5, supplier_id = $6, minimum_stock = $7, 
          maximum_stock = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;
    const values = [name, description, price, stock, category_id, supplier_id, minimum_stock, maximum_stock, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async regenerateBarcode(id) {
    const query = `
      UPDATE products
      SET barcode = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const newBarcode = `PRD${String(Date.now()).slice(-8)}`;
    const { rows } = await db.query(query, [newBarcode, id]);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async updateStock(id, quantity) {
    const query = `
      UPDATE products
      SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const { rows } = await db.query(query, [quantity, id]);
    return rows[0];
  }
}

module.exports = Product; 