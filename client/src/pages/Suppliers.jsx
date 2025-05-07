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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api/suppliers';

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No estás autenticado');
        return;
      }

      const res = await fetch(API_URL, {
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

      const data = await res.json();
      setSuppliers(data);
    } catch (error) {
      toast.error('Error al obtener proveedores');
    }
  };

  const columns = [
    { field: 'name', headerName: 'Nombre', width: 200 },
    { field: 'contact_person', headerName: 'Contacto', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Teléfono', width: 150 },
    { field: 'address', headerName: 'Dirección', width: 300 },
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
    setSelectedSupplier(null);
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSupplier(null);
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
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
        if (res.ok) {
          toast.success('Proveedor eliminado correctamente');
          fetchSuppliers();
        } else {
          toast.error('Error al eliminar proveedor');
        }
      } catch (error) {
        toast.error('Error al eliminar proveedor');
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

      if (selectedSupplier) {
        // Actualizar proveedor existente
        const res = await fetch(`${API_URL}/${selectedSupplier.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          toast.success('Proveedor actualizado correctamente');
          fetchSuppliers();
        } else {
          toast.error('Error al actualizar proveedor');
        }
      } else {
        // Crear nuevo proveedor
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          toast.success('Proveedor creado correctamente');
          fetchSuppliers();
        } else {
          toast.error('Error al crear proveedor');
        }
      }
    } catch (error) {
      toast.error('Error al guardar proveedor');
    }
    handleCloseDialog();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    Object.values(supplier).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Proveedores</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Nuevo Proveedor
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar proveedores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Paper>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredSuppliers}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 25]}
          disableSelectionOnClick
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
                  label="Persona de Contacto"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {selectedSupplier ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Suppliers; 