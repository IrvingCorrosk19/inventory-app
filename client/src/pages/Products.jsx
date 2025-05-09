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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import { API_URLS, fetchWithAuth } from '../config/api';

const API_URL = API_URLS.products.list;

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    stock: '',
    minimum_stock: '',
    category_id: '',
    supplier_id: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetchWithAuth(API_URL);
      
      if (res.status === 401) {
        toast.error('Sesión expirada');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      const data = await res.json();
      
      // Mapear los productos para incluir category y supplier
      const mappedProducts = data.map(product => ({
        ...product,
        category: product.category_name,
        supplier: product.supplier_name
      }));
      
      setProducts(mappedProducts);
    } catch (error) {
      toast.error('Error al obtener productos');
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No estás autenticado');
        return;
      }

      const res = await fetchWithAuth(API_URLS.categories.list);
      
      if (res.status === 401) {
        toast.error('Sesión expirada');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast.error('Error al obtener categorías');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No estás autenticado');
        return;
      }

      const res = await fetchWithAuth(API_URLS.suppliers.list);
      
      if (res.status === 401) {
        toast.error('Sesión expirada');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      const data = await res.json();
      setSuppliers(data);
    } catch (error) {
      toast.error('Error al obtener proveedores');
    }
  };

  const columns = [
    { field: 'sku', headerName: 'SKU', width: 130 },
    { field: 'name', headerName: 'Nombre', width: 200 },
    { field: 'description', headerName: 'Descripción', width: 250 },
    { field: 'category', headerName: 'Categoría', width: 130 },
    { field: 'supplier', headerName: 'Proveedor', width: 150 },
    { field: 'price', headerName: 'Precio', width: 130, type: 'number' },
    { field: 'stock', headerName: 'Stock', width: 100, type: 'number' },
    { field: 'minimum_stock', headerName: 'Stock Mínimo', width: 130, type: 'number' },
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
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      sku: '',
      price: '',
      stock: '',
      minimum_stock: '',
      category_id: '',
      supplier_id: '',
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      sku: product.sku,
      price: product.price,
      stock: product.stock,
      minimum_stock: product.minimum_stock,
      category_id: product.category_id,
      supplier_id: product.supplier_id,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('No estás autenticado');
          return;
        }

        const res = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.status === 401) {
          toast.error('Sesión expirada');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }

        if (res.ok) {
          toast.success('Producto eliminado correctamente');
          fetchProducts();
        } else {
          const errorData = await res.json();
          toast.error(errorData.error || 'Error al eliminar producto');
        }
      } catch (error) {
        toast.error('Error al eliminar producto');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No estás autenticado');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      if (selectedProduct) {
        // Actualizar producto existente
        const res = await fetch(`${API_URL}/${selectedProduct.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            ...formData,
            category_id: parseInt(formData.category_id),
            supplier_id: parseInt(formData.supplier_id),
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            minimum_stock: parseInt(formData.minimum_stock)
          }),
        });

        if (res.status === 401) {
          toast.error('Sesión expirada');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }

        if (res.ok) {
          toast.success('Producto actualizado correctamente');
          fetchProducts();
        } else {
          const errorData = await res.json();
          toast.error(errorData.error || 'Error al actualizar producto');
        }
      } else {
        // Crear nuevo producto
        const res = await fetch(API_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...formData,
            category_id: parseInt(formData.category_id),
            supplier_id: parseInt(formData.supplier_id),
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            minimum_stock: parseInt(formData.minimum_stock)
          }),
        });

        if (res.status === 401) {
          toast.error('Sesión expirada');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }

        if (res.ok) {
          toast.success('Producto creado correctamente');
          fetchProducts();
        } else {
          const errorData = await res.json();
          toast.error(errorData.error || 'Error al crear producto');
        }
      }
    } catch (error) {
      toast.error('Error al guardar producto');
    }
    handleCloseDialog();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const filteredProducts = products.filter((product) =>
    Object.values(product).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Productos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Nuevo Producto
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Paper>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredProducts}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SKU"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    label="Categoría"
                  >
                    {Array.isArray(categories) && categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Proveedor</InputLabel>
                  <Select
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleChange}
                    label="Proveedor"
                  >
                    {Array.isArray(suppliers) && suppliers.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Precio"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Stock Mínimo"
                  name="minimum_stock"
                  type="number"
                  value={formData.minimum_stock}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {selectedProduct ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Products; 