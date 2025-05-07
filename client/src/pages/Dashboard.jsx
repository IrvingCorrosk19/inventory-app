import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api/dashboard';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalCategories: 0,
    lowStockProducts: [],
    monthlySales: 0,
    stockData: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener datos del dashboard');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Tarjetas de resumen */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InventoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Productos</Typography>
              </Box>
              <Typography variant="h4">{dashboardData.totalProducts}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CategoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Categorías</Typography>
              </Box>
              <Typography variant="h4">{dashboardData.totalCategories}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Bajo Stock</Typography>
              </Box>
              <Typography variant="h4">{dashboardData.lowStockProducts.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Productos por debajo del mínimo
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Ventas</Typography>
              </Box>
              <Typography variant="h4">${dashboardData.monthlySales.toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">
                Este mes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfica de stock */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Stock por Producto
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.stockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stock" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Lista de productos con bajo stock */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Productos con Bajo Stock
            </Typography>
            <List>
              {dashboardData.lowStockProducts.map((product, index) => (
                <Box key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={product.name}
                      secondary={`Stock: ${product.stock} (Mínimo: ${product.minimum_stock})`}
                    />
                  </ListItem>
                  {index < dashboardData.lowStockProducts.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 