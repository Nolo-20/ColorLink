-- =========================================================================
-- COLORLINK S.A.S. - ESQUEMA DE BASE DE DATOS LOCAL
-- Compatible con PostgreSQL, SQLite y MySQL
-- =========================================================================

-- 1. TABLA DE USUARIOS Y ROLES (CLIENTE, ASESOR, CALIDAD, ADMINISTRADOR)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(200) NOT NULL,
    document_id VARCHAR(50) NOT NULL, -- NIT o Cédula
    address VARCHAR(255),
    city VARCHAR(100) DEFAULT 'Medellín',
    role VARCHAR(30) DEFAULT 'cliente', -- 'cliente', 'asesor', 'calidad', 'administrador'
    auth_method VARCHAR(30) DEFAULT 'email_code', -- 'email_code', 'credentials', 'google', 'microsoft'
    avatar_url TEXT,
    is_registered BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE CÓDIGOS DE VERIFICACIÓN (OTP)
CREATE TABLE IF NOT EXISTS otp_verification_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE PEDIDOS / ÓRDENES DE RECUBRIMIENTOS
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    client_id VARCHAR(50) REFERENCES users(id),
    client_name VARCHAR(200) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    project_name VARCHAR(200),
    product_category VARCHAR(100), -- 'vinilo', 'esmalte', 'estuco', 'epoxico'
    color_code VARCHAR(50),
    volume_gallons NUMERIC(10, 2),
    total_amount NUMERIC(14, 2),
    status VARCHAR(50) DEFAULT 'En Proceso', -- 'En Proceso', 'En Tintometría', 'Enviado', 'Entregado'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA DE ENSAYOS DE LABORATORIO Y CONTROL DE CALIDAD
CREATE TABLE IF NOT EXISTS quality_tests (
    id VARCHAR(50) PRIMARY KEY,
    batch_number VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    color_delta_e NUMERIC(5, 3), -- Tolerancia ΔE tintométrica
    viscosity_ku INT,           -- Unidades Krebs
    solids_percentage NUMERIC(5, 2),
    drying_time_minutes INT,
    status VARCHAR(30) DEFAULT 'Aprobado',
    technician_name VARCHAR(100),
    test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- DATOS INICIALES SEMILLA (SEED DATA)
-- =========================================================================

INSERT INTO users (id, email, first_name, last_name, full_name, phone, company, document_id, address, city, role, auth_method, is_registered)
VALUES 
('USR-CLI-001', 'proyectos@constructorahorizonte.com.co', 'Carlos', 'Mendoza', 'Carlos Mendoza', '+57 314 789-2045', 'Constructora Horizonte S.A.S.', '901.458.789-3', 'Cra 43A # 1-50', 'Medellín', 'cliente', 'credentials', TRUE),
('USR-ASE-001', 'j.osorio@colorlink.com.co', 'Jorge', 'Osorio', 'Ing. Jorge Osorio', '+57 310 445-9012', 'ColorLink Recubrimientos S.A.S.', '71.234.567', 'Autopista Sur Km 8', 'Itagüí', 'asesor', 'credentials', TRUE),
('USR-LAB-001', 'e.restrepo@colorlink.com.co', 'Elena', 'Restrepo', 'Dra. Elena Restrepo', '+57 301 678-3412', 'ColorLink Laboratorio de Tintometría', '43.567.890', 'Zona Industrial Guayabal', 'Medellín', 'calidad', 'credentials', TRUE),
('USR-ADM-001', 'm.quintero@colorlink.com.co', 'Mauricio', 'Quintero', 'Mauricio Quintero', '+57 318 290-1122', 'ColorLink Operaciones y Despacho', '98.765.432', 'Centro Logístico Sabaneta', 'Sabaneta', 'administrador', 'credentials', TRUE)
ON CONFLICT (id) DO NOTHING;
