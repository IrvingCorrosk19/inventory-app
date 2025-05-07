-- Agregar columna barcode a la tabla products
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(50);

-- Actualizar productos existentes con códigos de barras únicos
UPDATE products 
SET barcode = CONCAT('PRD', LPAD(CAST(id AS VARCHAR), 8, '0'))
WHERE barcode IS NULL; 