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

const API_URL = 'http://localhost:5000/api/users';

function Users() {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role_id: '',
    password: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const res = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al obtener usuarios');
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al obtener usuarios');
      setUsers([]);
    }
  };

  const columns = [
    { field: 'username', headerName: 'Usuario', width: 200 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'role_name', headerName: 'Rol', width: 130 },
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
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      role_id: '',
      password: '',
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      password: '',
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          toast.success('Usuario eliminado correctamente');
          fetchUsers();
        } else {
          throw new Error('Error al eliminar usuario');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al eliminar usuario');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      if (selectedUser) {
        // Actualizar usuario existente
        const res = await fetch(`${API_URL}/${selectedUser.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          toast.success('Usuario actualizado correctamente');
          fetchUsers();
        } else {
          throw new Error('Error al actualizar usuario');
        }
      } else {
        // Crear nuevo usuario
        const res = await fetch(API_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          toast.success('Usuario creado correctamente');
          fetchUsers();
        } else {
          throw new Error('Error al crear usuario');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar usuario');
    }
    handleCloseDialog();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Usuarios</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Paper>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 25]}
          disableSelectionOnClick
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Usuario"
                  name="username"
                  value={formData.username}
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
                <FormControl fullWidth required>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleChange}
                    label="Rol"
                  >
                    <MenuItem value={1}>Admin</MenuItem>
                    <MenuItem value={2}>Usuario</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!selectedUser}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {selectedUser ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Users; 