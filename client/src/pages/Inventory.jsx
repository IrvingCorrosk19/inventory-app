import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Tooltip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  LinearProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { API_URLS, fetchWithAuth } from '../config/api';

const API_URL = API_URLS.inventory.list;
const PRODUCTS_API_URL = API_URLS.products.list;
const movementTypes = ['ENTRY', 'EXIT', 'ADJUSTMENT'];

function Inventory() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [lowStockAlert, setLowStockAlert] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    movementType: '',
    productId: ''
  });
  const [reportPeriod, setReportPeriod] = useState('week');
  const [topProducts, setTopProducts] = useState([]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    product_id: '',
    type: '',
    quantity: '',
    notes: '',
  });

  useEffect(() => {
    fetchMovements();
    fetchProducts();
  }, []);

  useEffect(() => {
    const lowStock = products.filter(product => 
      product.stock < product.minimum_stock
    );
    setLowStockProducts(lowStock);
    setLowStockAlert(lowStock.length > 0);
  }, [products]);

  const fetchMovements = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setMovements(data);
    } catch (error) {
      toast.error('Error al obtener movimientos');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(PRODUCTS_API_URL);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error('Error al obtener productos');
    }
  };

  const columns = [
    { 
      field: 'created_at', 
      headerName: 'Fecha', 
      width: 130,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
    { 
      field: 'product_name', 
      headerName: 'Producto', 
      width: 200 
    },
    { 
      field: 'movement_type', 
      headerName: 'Tipo', 
      width: 130,
      renderCell: (params) => (
        <Typography
          color={params.value === 'ENTRY' ? 'success.main' : 
                 params.value === 'EXIT' ? 'error.main' : 
                 'warning.main'}
        >
          {params.value === 'ENTRY' ? 'Entrada' : 
           params.value === 'EXIT' ? 'Salida' : 
           'Ajuste'}
        </Typography>
      )
    },
    { 
      field: 'quantity', 
      headerName: 'Cantidad', 
      width: 130, 
      type: 'number',
      renderCell: (params) => (
        <Typography
          color={params.row.movement_type === 'ENTRY' ? 'success.main' : 
                 params.row.movement_type === 'EXIT' ? 'error.main' : 
                 'warning.main'}
        >
          {params.row.movement_type === 'ENTRY' ? '+' : 
           params.row.movement_type === 'EXIT' ? '-' : 
           '±'}{params.value}
        </Typography>
      )
    },
    { 
      field: 'user_name', 
      headerName: 'Usuario', 
      width: 150 
    },
    { 
      field: 'notes', 
      headerName: 'Notas', 
      width: 300 
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Editar">
            <IconButton
              onClick={() => handleEdit(params.row)}
              color="primary"
              size="small"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              onClick={() => handleDelete(params.row.id)}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setSelectedMovement(null);
    setSelectedProduct(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      product_id: '',
      type: '',
      quantity: '',
      notes: '',
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMovement(null);
  };

  const handleEdit = (movement) => {
    setSelectedMovement(movement);
    const product = products.find(p => p.id === movement.product_id);
    setSelectedProduct(product);
    setFormData({
      date: movement.date,
      product_id: movement.product_id,
      type: movement.type,
      quantity: movement.quantity,
      notes: movement.notes,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este movimiento?')) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Movimiento eliminado correctamente');
          fetchMovements();
        } else {
          toast.error('Error al eliminar movimiento');
        }
      } catch (error) {
        toast.error('Error al eliminar movimiento');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validaciones del frontend
      if (!formData.product_id) {
        toast.error('Debes seleccionar un producto');
        return;
      }

      if (!formData.type) {
        toast.error('Debes seleccionar un tipo de movimiento');
        return;
      }

      if (!formData.quantity || formData.quantity <= 0) {
        toast.error('La cantidad debe ser mayor a 0');
        return;
      }

      // Validación de fecha
      const selectedDate = new Date(formData.date);
      const today = new Date();
      if (selectedDate > today) {
        toast.error('No se pueden registrar movimientos con fecha futura');
        return;
      }

      // Validación de stock para salidas
      if (formData.type === 'EXIT' && selectedProduct && selectedProduct.stock < formData.quantity) {
        toast.error(`Stock insuficiente. Stock actual: ${selectedProduct.stock}`);
        return;
      }

      // Validación de stock máximo para entradas
      if (formData.type === 'ENTRY' && selectedProduct && selectedProduct.maximum_stock) {
        const newStock = selectedProduct.stock + parseInt(formData.quantity);
        if (newStock > selectedProduct.maximum_stock) {
          toast.error(`Stock máximo excedido. Stock máximo permitido: ${selectedProduct.maximum_stock}`);
          return;
        }
      }

      // Validación de stock para ajustes
      if (formData.type === 'ADJUSTMENT' && selectedProduct && formData.quantity < 0) {
        toast.error('El stock no puede ser negativo');
        return;
      }

      // Confirmación para movimientos grandes
      if (formData.quantity > 100) {
        const confirmed = window.confirm(
          `¿Estás seguro de registrar un movimiento de ${formData.quantity} unidades?`
        );
        if (!confirmed) return;
      }

      if (selectedMovement) {
        // Actualizar movimiento existente (no afecta stock)
        const res = await fetch(`${API_URL}/${selectedMovement.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          toast.success('Movimiento actualizado correctamente');
          fetchMovements();
        } else {
          const errorData = await res.json();
          toast.error(errorData.error || 'Error al actualizar movimiento');
        }
      } else {
        // Crear nuevo movimiento y verificar bajo stock
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const data = await res.json();
          toast.success('Movimiento creado correctamente');
          if (data.isLowStock) {
            toast.warn('¡Atención! El producto quedó en bajo stock.');
          }
          fetchMovements();
        } else {
          const errorData = await res.json();
          toast.error(errorData.error || 'Error al crear movimiento');
        }
      }
    } catch (error) {
      toast.error('Error al guardar movimiento');
    }
    handleCloseDialog();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProductChange = (event) => {
    const productId = event.target.value;
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
    setFormData({
      ...formData,
      product_id: productId
    });
  };

  // Función para validar la cantidad máxima permitida
  const getMaxQuantity = () => {
    if (!selectedProduct) return 0;
    if (formData.type === 'ENTRY') return 999999; // No hay límite para entradas
    if (formData.type === 'EXIT') return selectedProduct.stock;
    if (formData.type === 'ADJUSTMENT') return 999999; // No hay límite para ajustes
    return 0;
  };

  // Calcular resumen de movimientos
  const getMovementSummary = () => {
    const filtered = filterMovements(movements);
    return {
      totalEntries: filtered.filter(m => m.movement_type === 'ENTRY')
        .reduce((sum, m) => sum + m.quantity, 0),
      totalExits: filtered.filter(m => m.movement_type === 'EXIT')
        .reduce((sum, m) => sum + m.quantity, 0),
      totalAdjustments: filtered.filter(m => m.movement_type === 'ADJUSTMENT')
        .reduce((sum, m) => sum + m.quantity, 0),
      totalMovements: filtered.length
    };
  };

  // Filtrar movimientos
  const filterMovements = (movements) => {
    return movements.filter(movement => {
      const movementDate = new Date(movement.created_at);
      const matchesDate = (!filters.startDate || movementDate >= new Date(filters.startDate)) &&
                         (!filters.endDate || movementDate <= new Date(filters.endDate));
      const matchesType = !filters.movementType || movement.movement_type === filters.movementType;
      const matchesProduct = !filters.productId || movement.product_id === parseInt(filters.productId);
      const matchesSearch = Object.values(movement).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchesDate && matchesType && matchesProduct && matchesSearch;
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const filteredMovements = movements.filter((movement) =>
    Object.values(movement).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Preparar datos para gráficos
  const getChartData = () => {
    const filtered = filterMovements(movements);
    const dailyData = {};
    const typeData = {};
    const productData = {};

    filtered.forEach(movement => {
      const date = new Date(movement.created_at).toLocaleDateString();
      dailyData[date] = (dailyData[date] || 0) + movement.quantity;

      typeData[movement.movement_type] = (typeData[movement.movement_type] || 0) + movement.quantity;

      const productName = movement.product_name;
      productData[productName] = (productData[productName] || 0) + movement.quantity;
    });

    return {
      dailyData: Object.entries(dailyData).map(([date, total]) => ({ date, total })),
      typeData: Object.entries(typeData).map(([type, total]) => ({
        type: type === 'ENTRY' ? 'Entrada' : type === 'EXIT' ? 'Salida' : 'Ajuste',
        total
      })),
      productData: Object.entries(productData).map(([product, total]) => ({ product, total }))
    };
  };

  // Exportar a Excel
  const exportToExcel = () => {
    const filtered = filterMovements(movements);
    const data = filtered.map(movement => ({
      Fecha: new Date(movement.created_at).toLocaleDateString(),
      Producto: movement.product_name,
      Tipo: movement.movement_type === 'ENTRY' ? 'Entrada' : movement.movement_type === 'EXIT' ? 'Salida' : 'Ajuste',
      Cantidad: movement.quantity,
      Usuario: movement.user_name,
      Notas: movement.notes
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, 'movimientos_inventario.xlsx');
  };

  // Calcular nivel de stock
  const getStockLevel = (product) => {
    if (!product.maximum_stock) return 0;
    return (product.stock / product.maximum_stock) * 100;
  };

  // Obtener color según nivel de stock
  const getStockColor = (product) => {
    const level = getStockLevel(product);
    if (level < 20) return 'error';
    if (level < 50) return 'warning';
    return 'success';
  };

  // Calcular productos más vendidos
  const calculateTopProducts = () => {
    const productMovements = {};
    
    movements.forEach(movement => {
      if (movement.movement_type === 'EXIT') {
        if (!productMovements[movement.product_id]) {
          productMovements[movement.product_id] = {
            name: movement.product_name,
            quantity: 0
          };
        }
        productMovements[movement.product_id].quantity += movement.quantity;
      }
    });
    
    return Object.values(productMovements)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  useEffect(() => {
    setTopProducts(calculateTopProducts());
  }, [movements]);

  return (
    <Box>
      {/* Alerta de bajo stock */}
      {lowStockAlert && (
        <Snackbar
          open={lowStockAlert}
          autoHideDuration={6000}
          onClose={() => setLowStockAlert(false)}
        >
          <Alert
            severity="warning"
            icon={<WarningIcon />}
            action={
              <Button color="inherit" size="small" onClick={() => setLowStockAlert(false)}>
                Cerrar
              </Button>
            }
          >
            {lowStockProducts.length} producto(s) con bajo stock
          </Alert>
        </Snackbar>
      )}

      {/* Resumen de movimientos del día */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Movimientos del Día</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">Entradas</Typography>
            <Typography variant="h6" color="success.main">
              +{movements
                .filter(m => new Date(m.created_at).toDateString() === new Date().toDateString() && m.movement_type === 'ENTRY')
                .reduce((sum, m) => sum + m.quantity, 0)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">Salidas</Typography>
            <Typography variant="h6" color="error.main">
              -{movements
                .filter(m => new Date(m.created_at).toDateString() === new Date().toDateString() && m.movement_type === 'EXIT')
                .reduce((sum, m) => sum + m.quantity, 0)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">Total</Typography>
            <Typography variant="h6">
              {movements
                .filter(m => new Date(m.created_at).toDateString() === new Date().toDateString())
                .reduce((sum, m) => sum + (m.movement_type === 'ENTRY' ? m.quantity : -m.quantity), 0)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Movimientos de Inventario</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportToExcel}
            sx={{ mr: 2 }}
          >
            Exportar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Nuevo Movimiento
          </Button>
        </Box>
      </Box>

      {/* Indicadores de stock */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Estado del Inventario</Typography>
        <Grid container spacing={2}>
          {products.map(product => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1">{product.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Stock: {product.stock}
                  </Typography>
                  {product.minimum_stock && (
                    <Typography variant="body2" color="text.secondary">
                      (Mín: {product.minimum_stock})
                    </Typography>
                  )}
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getStockLevel(product)}
                  color={getStockColor(product)}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Tabla" />
          <Tab label="Gráficos" />
          <Tab label="Reportes" />
        </Tabs>
      </Paper>

      {activeTab === 1 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Movimientos por Día</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData().dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Movimientos por Tipo</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getChartData().typeData}
                    dataKey="total"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {getChartData().typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.type === 'Entrada' ? '#4caf50' :
                        entry.type === 'Salida' ? '#f44336' :
                        '#ff9800'
                      } />
                    ))}
                  </Pie>
                  <ChartTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Movimientos por Producto</Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getChartData().productData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        </Paper>
      )}

      {activeTab === 2 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Productos más Vendidos</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Cantidad Vendida</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell align="right">{product.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Movimientos por Período</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Período</InputLabel>
                <Select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  label="Período"
                >
                  <MenuItem value="day">Hoy</MenuItem>
                  <MenuItem value="week">Esta Semana</MenuItem>
                  <MenuItem value="month">Este Mes</MenuItem>
                </Select>
              </FormControl>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Entradas</TableCell>
                      <TableCell align="right">
                        {movements
                          .filter(m => {
                            const date = new Date(m.created_at);
                            const now = new Date();
                            switch (reportPeriod) {
                              case 'day':
                                return date.toDateString() === now.toDateString();
                              case 'week':
                                return date >= new Date(now.setDate(now.getDate() - 7));
                              case 'month':
                                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                              default:
                                return true;
                            }
                          })
                          .filter(m => m.movement_type === 'ENTRY')
                          .reduce((sum, m) => sum + m.quantity, 0)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Salidas</TableCell>
                      <TableCell align="right">
                        {movements
                          .filter(m => {
                            const date = new Date(m.created_at);
                            const now = new Date();
                            switch (reportPeriod) {
                              case 'day':
                                return date.toDateString() === now.toDateString();
                              case 'week':
                                return date >= new Date(now.setDate(now.getDate() - 7));
                              case 'month':
                                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                              default:
                                return true;
                            }
                          })
                          .filter(m => m.movement_type === 'EXIT')
                          .reduce((sum, m) => sum + m.quantity, 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Resumen de movimientos */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">Total Entradas</Typography>
            <Typography variant="h6" color="success.main">
              +{getMovementSummary().totalEntries}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">Total Salidas</Typography>
            <Typography variant="h6" color="error.main">
              -{getMovementSummary().totalExits}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">Total Ajustes</Typography>
            <Typography variant="h6" color="warning.main">
              ±{getMovementSummary().totalAdjustments}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">Total Movimientos</Typography>
            <Typography variant="h6">
              {getMovementSummary().totalMovements}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha Inicio"
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha Fin"
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Movimiento</InputLabel>
              <Select
                name="movementType"
                value={filters.movementType}
                onChange={handleFilterChange}
                label="Tipo de Movimiento"
              >
                <MenuItem value="">Todos</MenuItem>
                {movementTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type === 'ENTRY' ? 'Entrada' : type === 'EXIT' ? 'Salida' : 'Ajuste'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Producto</InputLabel>
              <Select
                name="productId"
                value={filters.productId}
                onChange={handleFilterChange}
                label="Producto"
              >
                <MenuItem value="">Todos</MenuItem>
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar movimientos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Paper>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filterMovements(movements)}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 25]}
          disableSelectionOnClick
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedMovement ? 'Editar Movimiento' : 'Nuevo Movimiento'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fecha"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    max: new Date().toISOString().split('T')[0]
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Producto</InputLabel>
                  <Select
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleProductChange}
                    label="Producto"
                  >
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Tipo"
                  >
                    {movementTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type === 'ENTRY' ? 'Entrada' : type === 'EXIT' ? 'Salida' : 'Ajuste'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cantidad"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  inputProps={{
                    min: 1,
                    max: getMaxQuantity(),
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                {selectedProduct && (
                  <Typography variant="body2" color="text.secondary">
                    Stock actual: {selectedProduct.stock}
                    {selectedProduct.maximum_stock && ` (Máx: ${selectedProduct.maximum_stock})`}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notas"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {selectedMovement ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Inventory; 