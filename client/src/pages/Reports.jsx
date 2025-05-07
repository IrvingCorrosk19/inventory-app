import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Paper,
  Grid,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_URL = 'http://localhost:3000/api/reports/movements';

function Reports() {
  const [movements, setMovements] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    productId: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const res = await fetch(`${API_URL}?${params.toString()}`);
    const data = await res.json();
    setMovements(data);
    setLoading(false);
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchMovements();
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(movements);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Movimientos');
    XLSX.writeFile(wb, 'reporte_movimientos.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Movimientos de Inventario', 10, 10);
    doc.autoTable({
      head: [[
        'Fecha', 'Producto', 'Tipo', 'Cantidad', 'Usuario', 'Notas'
      ]],
      body: movements.map(m => [
        m.created_at, m.product_name, m.movement_type, m.quantity, m.user_name, m.notes
      ]),
    });
    doc.save('reporte_movimientos.pdf');
  };

  const columns = [
    { field: 'created_at', headerName: 'Fecha', width: 150 },
    { field: 'product_name', headerName: 'Producto', width: 200 },
    { field: 'movement_type', headerName: 'Tipo', width: 120 },
    { field: 'quantity', headerName: 'Cantidad', width: 120 },
    { field: 'user_name', headerName: 'Usuario', width: 150 },
    { field: 'notes', headerName: 'Notas', width: 250 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Reportes de Movimientos</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleFilter}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Fecha inicio"
                name="startDate"
                type="date"
                value={filters.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Fecha fin"
                name="endDate"
                type="date"
                value={filters.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                select
                label="Tipo"
                name="type"
                value={filters.type}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Entrada">Entrada</MenuItem>
                <MenuItem value="Salida">Salida</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="ID Producto"
                name="productId"
                value={filters.productId}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button type="submit" variant="contained" fullWidth sx={{ height: '100%' }}>
                Filtrar
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={exportExcel}>Exportar a Excel</Button>
        <Button variant="outlined" onClick={exportPDF}>Exportar a PDF</Button>
      </Box>
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={movements}
          columns={columns}
          getRowId={row => row.id}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>
    </Box>
  );
}

export default Reports; 