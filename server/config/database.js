const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://inventory_55ix_user:UVcS1IhIzI5QszIGItsBcGnUkR9beNVJ@dpg-d0dbb4c9c44c73caai7g-a.oregon-postgres.render.com/inventory_55ix',
  ssl: {
    rejectUnauthorized: false // necesario para Render
  }
});

// Verificación opcional de conexión
pool.connect()
  .then(client => {
    return client
      .query('SELECT NOW()')
      .then(res => {
        console.log('✅ Base de datos conectada correctamente:', res.rows[0]);
        client.release();
      })
      .catch(err => {
        console.error('❌ Error en la consulta de prueba:', err.stack);
        client.release();
      });
  })
  .catch(err => {
    console.error('❌ Error al conectar a la base de datos:', err.stack);
  });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
