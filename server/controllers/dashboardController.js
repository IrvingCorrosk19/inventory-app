const Product = require('../models/Product');
const Category = require('../models/Category');
const InventoryMovement = require('../models/InventoryMovement');
const Sale = require('../models/Sale');

exports.getDashboardData = async (req, res) => {
  try {
    // Obtener total de productos
    const products = await Product.findAll();
    const totalProducts = products.length;
    
    // Obtener total de categorías
    const categories = await Category.findAll();
    const totalCategories = categories.length;
    
    // Obtener productos con bajo stock
    const lowStockProducts = products.filter(product => 
      product.stock < product.minimum_stock
    ).slice(0, 5);
    
    // Obtener ventas del mes actual
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const sales = await Sale.findAll();
    const monthlySales = sales
      .filter(sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate.getMonth() + 1 === currentMonth && 
               saleDate.getFullYear() === currentYear;
      })
      .reduce((total, sale) => total + (sale.total || 0), 0);
    
    // Obtener datos para la gráfica de stock
    const stockData = products
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5)
      .map(product => ({
        name: product.name,
        stock: product.stock
      }));

    res.json({
      totalProducts,
      totalCategories,
      lowStockProducts,
      monthlySales,
      stockData
    });
  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error);
    res.status(500).json({ error: 'Error al obtener datos del dashboard' });
  }
}; 