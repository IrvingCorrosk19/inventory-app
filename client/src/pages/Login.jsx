import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const API_URL = `${import.meta.env.VITE_API_URL}/auth/login`;

function Login() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Intentando login con:', formData);
      console.log('URL:', API_URL);
      
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log('Respuesta recibida:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Datos recibidos:', data);
        localStorage.setItem('token', data.token);
        toast.success('¡Bienvenido!');
        navigate('/dashboard');
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
        console.error('Error en la respuesta:', errorData);
        toast.error(errorData.message || 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error completo:', error);
      toast.error('Error de conexión con el servidor');
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
        p: 2,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Container 
        maxWidth="sm" 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: '400px !important',
        }}
      >
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                mb: 2,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <LockIcon
                sx={{
                  fontSize: 40,
                  color: 'white',
                }}
              />
            </Box>
            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                textAlign: 'center',
                mb: 1,
              }}
            >
              Sistema de Inventario
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: 'text.secondary',
                textAlign: 'center',
                mb: 3,
              }}
            >
              Inicia sesión para continuar
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Usuario"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                },
              }}
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login; 