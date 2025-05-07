-- Crear tabla de roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de categorías
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de proveedores
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modificar tabla de productos existente
ALTER TABLE products
ADD COLUMN supplier_id INTEGER REFERENCES suppliers(id),
ADD COLUMN category_id INTEGER REFERENCES categories(id),
ADD COLUMN minimum_stock INTEGER DEFAULT 0,
ADD COLUMN maximum_stock INTEGER,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Crear tabla de movimientos de inventario
CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('ENTRY', 'EXIT', 'ADJUSTMENT')),
    quantity INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles básicos
INSERT INTO roles (name, description) VALUES 
('admin', 'Administrador del sistema con acceso total'),
('manager', 'Gerente con acceso a gestión de inventario'),
('user', 'Usuario básico con acceso limitado'); 