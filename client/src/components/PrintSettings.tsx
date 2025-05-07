import React from 'react';
import {
  Box,
  Typography,
  Slider,
  TextField,
  Grid,
  Paper,
  Divider,
} from '@mui/material';

interface PrintSettingsProps {
  onChange: (settings: any) => void;
  width: number;
  height: number;
  fontSize: number;
  columns: number;
  rows: number;
  marginX: number;
  marginY: number;
  gapX: number;
  gapY: number;
  barcodeWidth: number;
  barcodeHeight: number;
}

const PrintSettings: React.FC<PrintSettingsProps> = ({ onChange, ...settings }) => {
  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onChange({
      ...settings,
      [field]: typeof value === 'number' ? value : parseFloat(value),
    });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Configuración de Etiquetas
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Ancho de etiqueta (mm)</Typography>
          <TextField
            type="number"
            value={settings.width}
            onChange={handleChange('width')}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Alto de etiqueta (mm)</Typography>
          <TextField
            type="number"
            value={settings.height}
            onChange={handleChange('height')}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Tamaño de fuente</Typography>
          <TextField
            type="number"
            value={settings.fontSize}
            onChange={handleChange('fontSize')}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Ancho del código de barras (mm)</Typography>
          <TextField
            type="number"
            value={settings.barcodeWidth}
            onChange={handleChange('barcodeWidth')}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Alto del código de barras (mm)</Typography>
          <TextField
            type="number"
            value={settings.barcodeHeight}
            onChange={handleChange('barcodeHeight')}
            fullWidth
            size="small"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        Configuración de Página
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Columnas por página</Typography>
          <Slider
            value={settings.columns}
            onChange={handleChange('columns')}
            min={1}
            max={10}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Filas por página</Typography>
          <Slider
            value={settings.rows}
            onChange={handleChange('rows')}
            min={1}
            max={12}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Márgenes horizontales (mm)</Typography>
          <TextField
            type="number"
            value={settings.marginX}
            onChange={handleChange('marginX')}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Márgenes verticales (mm)</Typography>
          <TextField
            type="number"
            value={settings.marginY}
            onChange={handleChange('marginY')}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Espaciado horizontal (mm)</Typography>
          <TextField
            type="number"
            value={settings.gapX}
            onChange={handleChange('gapX')}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Espaciado vertical (mm)</Typography>
          <TextField
            type="number"
            value={settings.gapY}
            onChange={handleChange('gapY')}
            fullWidth
            size="small"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PrintSettings; 