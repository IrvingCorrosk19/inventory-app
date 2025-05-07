const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const saleRoutes = require('./routes/saleRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const fs = require('fs');
const path = require('path');
const db = require('./config/database');

// Configuración de variables de entorno
dotenv.config();

const app = express();

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.method === 'POST') {
    console.log('Body:', req.body);
  }
  next();
});

// Configuración CORS más detallada
app.use(cors({
  origin: '*', // Permitir todas las conexiones durante el desarrollo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error('Error en la aplicación:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Ejecutar script de migración
const runMigration = async () => {
  try {
    const migrationPath = path.join(__dirname, '..', 'migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    await db.query(migrationSQL);
    console.log('Migración ejecutada exitosamente');
  } catch (error) {
    console.error('Error al ejecutar la migración:', error);
  }
};

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Ruta básica
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de Inventario' });
});

// Puerto
const PORT = process.env.PORT || 5000;

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  await runMigration();
}); 