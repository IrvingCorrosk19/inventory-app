const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'inventory_db',
  password: 'Panama2020$',
  port: 5432,
});

// Add error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Successfully connected to the database');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}; 