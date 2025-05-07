const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function runMigration() {
  try {
    // Leer el archivo SQL
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../migrations/add_barcode_to_products.sql'),
      'utf8'
    );

    // Ejecutar la migración
    await db.query(migrationSQL);
    
    console.log('Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error ejecutando la migración:', error);
    process.exit(1);
  }
}

runMigration(); 