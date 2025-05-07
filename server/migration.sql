-- Primero, verificar si las tablas existen y actualizarlas
DO $$ 
BEGIN
    -- Tabla de roles
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'roles') THEN
        CREATE TABLE roles (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Tabla de usuarios
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'users') THEN
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
    END IF;

    -- Tabla de categorías
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'categories') THEN
        CREATE TABLE categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Tabla de proveedores
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'suppliers') THEN
        CREATE TABLE suppliers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            contact_person VARCHAR(100),
            email VARCHAR(100),
            phone VARCHAR(20),
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Tabla de productos
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'products') THEN
        CREATE TABLE products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            supplier_id INTEGER REFERENCES suppliers(id),
            category_id INTEGER REFERENCES categories(id),
            minimum_stock INTEGER DEFAULT 0,
            maximum_stock INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Tabla de movimientos de inventario
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'inventory_movements') THEN
        CREATE TABLE inventory_movements (
            id SERIAL PRIMARY KEY,
            product_id INTEGER REFERENCES products(id),
            movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('ENTRY', 'EXIT', 'ADJUSTMENT')),
            quantity INTEGER NOT NULL,
            user_id INTEGER REFERENCES users(id),
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Tabla de facturas
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'invoices') THEN
        CREATE TABLE invoices (
            id SERIAL PRIMARY KEY,
            number VARCHAR(50) NOT NULL UNIQUE,
            date DATE NOT NULL,
            total DECIMAL(10,2) NOT NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('SALE', 'PURCHASE')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Tabla de ventas
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'sales') THEN
        CREATE TABLE sales (
            id SERIAL PRIMARY KEY,
            product_id INTEGER REFERENCES products(id),
            quantity INTEGER NOT NULL,
            user_id INTEGER REFERENCES users(id),
            invoice_id INTEGER REFERENCES invoices(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Tabla de compras
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'purchases') THEN
        CREATE TABLE purchases (
            id SERIAL PRIMARY KEY,
            product_id INTEGER REFERENCES products(id),
            quantity INTEGER NOT NULL,
            user_id INTEGER REFERENCES users(id),
            invoice_id INTEGER REFERENCES invoices(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Tabla de auditoría
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'audit_logs') THEN
        CREATE TABLE audit_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            action VARCHAR(50) NOT NULL,
            entity VARCHAR(50) NOT NULL,
            entity_id INTEGER,
            details JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Insertar roles básicos si no existen
    IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin') THEN
        INSERT INTO roles (name, description) VALUES 
        ('admin', 'Administrador del sistema con acceso total');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'manager') THEN
        INSERT INTO roles (name, description) VALUES 
        ('manager', 'Gerente con acceso a gestión de inventario');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'user') THEN
        INSERT INTO roles (name, description) VALUES 
        ('user', 'Usuario básico con acceso limitado');
    END IF;
END $$; 