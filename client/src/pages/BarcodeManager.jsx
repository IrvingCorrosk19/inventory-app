import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { BarcodeLabel } from "../components/BarcodeLabel.tsx";
import PrintSettings from "../components/PrintSettings.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  IconButton,
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Refresh as RefreshIcon, Print as PrintIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { API_URLS, fetchWithAuth } from '../config/api';

const API_URL = API_URLS.barcode;

// Datos de ejemplo para cuando el backend no esté disponible
const sampleProducts = [
  { id: 1, name: 'Producto 1', barcode: '123456789', category_name: 'Categoría 1' },
  { id: 2, name: 'Producto 2', barcode: '987654321', category_name: 'Categoría 2' },
  { id: 3, name: 'Producto 3', barcode: '456789123', category_name: 'Categoría 1' },
];

const BarcodeManager = () => {
  const [settings, setSettings] = useState({
    width: 50,
    height: 25,
    fontSize: 12,
    columns: 3,
    rows: 10,
    marginX: 10,
    marginY: 10,
    gapX: 5,
    gapY: 5,
    barcodeWidth: 40,   // ancho del contenedor del código de barras (mm)
    barcodeHeight: 15,  // alto del contenedor del código de barras (mm)
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const printWindowRef = useRef(null);

  // Cargar productos
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No estás autenticado');
        return;
      }

      const response = await axios.get(`${API_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setProducts(response.data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar los productos. Por favor, intenta nuevamente.');
      toast.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handlePrint = () => {
    const labelsToPrint = selectedProducts.length > 0 
      ? selectedProducts.slice(0, settings.columns * settings.rows)
      : filteredProducts.slice(0, settings.columns * settings.rows);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('No se pudo abrir la ventana de impresión. Por favor, desactiva el bloqueador de ventanas emergentes.');
      return;
    }

    printWindowRef.current = printWindow;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impresión de Códigos de Barras</title>
          <style>
            @page {
              size: 8.5in 11in;
              margin: 0;
            }
            body {
              margin: 0;
              padding: ${settings.marginY}mm ${settings.marginX}mm;
            }
            .print-container {
              display: grid;
              grid-template-columns: repeat(${settings.columns}, 1fr);
              grid-template-rows: repeat(${settings.rows}, auto);
              gap: ${settings.gapY}mm ${settings.gapX}mm;
              width: 100%;
              height: 100%;
            }
            .label {
              width: ${settings.width}mm;
              height: ${settings.height}mm;
              display: flex;
              justify-content: center;
              align-items: center;
              border: 1px solid #ccc;
              padding: 2mm;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${labelsToPrint.map(product => `
              <div class="label">
                <div style="width: ${settings.width}mm; height: ${settings.height}mm; font-size: ${settings.fontSize}px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <div style="text-align: center;">
                    <svg id="barcode-${product.id}" width="${settings.barcodeWidth * 3.78}" height="${settings.barcodeHeight * 3.78}"></svg>
                  </div>
                  <div style="text-align: center; margin-top: 0mm;">
                    ${product.name} - ${product.barcode || `PRD${String(product.id).padStart(8, '0')}`}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            ${labelsToPrint.map(product => `
              JsBarcode("#barcode-${product.id}", "${product.barcode || `PRD${String(product.id).padStart(8, '0')}`}", {
                format: "CODE128",
                width: 1,
                height: ${settings.barcodeHeight * 3.78},
                displayValue: false
              });
            `).join('')}
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectProduct = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleRegenerateCode = async (productId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No estás autenticado');
        return;
      }

      await axios.post(`${API_URL}/products/${productId}/regenerate-barcode`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      await fetchProducts();
      toast.success('Código de barras regenerado exitosamente');
    } catch (err) {
      console.error('Error al regenerar código:', err);
      toast.error('Error al regenerar el código de barras');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !products.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Códigos de Barras
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <TextField
                label="Buscar productos"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearch}
                sx={{ width: '300px' }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                disabled={loading}
              >
                Imprimir Seleccionados
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Seleccionar</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Código de Barras</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedProducts.some(p => p.id === product.id)}
                          onChange={() => handleSelectProduct(product)}
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.barcode || 'Sin código'}</TableCell>
                      <TableCell>{product.category_name}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleRegenerateCode(product.id)}
                          color="primary"
                          disabled={loading}
                        >
                          <RefreshIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Configuración de Impresión
            </Typography>
            <PrintSettings {...settings} onChange={setSettings} />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default BarcodeManager; 