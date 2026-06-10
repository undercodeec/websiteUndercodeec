-- Script de creación de base de datos para Undercodeec
-- Motor: PostgreSQL

-- 1. Crear tabla de pedidos (orders)
-- Esta es la tabla principal donde se guardan los datos de ventas y transferencias.

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    plan_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    client_info JSONB NOT NULL, -- Guarda toda la metadata del cliente y el pedido
    payment_status VARCHAR(50) DEFAULT 'pending', -- approved, pending, rejected
    payment_method VARCHAR(50) NOT NULL, -- tarjeta, transferencia
    voucher_url TEXT, -- URL local al comprobante subido
    transaction_id VARCHAR(255), -- ID de transacción de PayPhone (si aplica)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Índices recomendados para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 3. Tabla de leads (formularios: software, webapp, mobileapp, moodle, contacto, marketing)
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    form_type VARCHAR(100),
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    data JSONB, -- req.body completo del formulario
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de usuarios administradores
-- La contraseña se guarda SIEMPRE como hash bcrypt (nunca en texto plano ni en .env).
-- El backend la crea automáticamente y migra el admin inicial desde ADMIN_EMAIL/ADMIN_PASSWORD
-- del .env la primera vez; después ADMIN_PASSWORD debe eliminarse del .env.
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de facturas electrónicas SRI (ver SRI_FACTURACION_WORKFLOW.md)
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    order_id INT NULL,                 -- referencia lógica a orders (NULL = factura manual)
    ambiente SMALLINT NOT NULL,        -- 1 pruebas, 2 producción
    estab VARCHAR(3) NOT NULL,
    pto_emi VARCHAR(3) NOT NULL,
    secuencial INT NOT NULL,
    clave_acceso VARCHAR(49) UNIQUE,
    estado VARCHAR(30) NOT NULL DEFAULT 'generada', -- generada|firmada|recibida|devuelta|autorizada|no_autorizada|error
    tipo_identificacion VARCHAR(2) NOT NULL,  -- 04 RUC, 05 cédula, 06 pasaporte, 07 consumidor final
    identificacion VARCHAR(20) NOT NULL,
    razon_social VARCHAR(300) NOT NULL,
    direccion VARCHAR(300),
    email VARCHAR(255),
    telefono VARCHAR(50),
    items JSONB NOT NULL,              -- [{descripcion, cantidad, precioUnitario, descuento, codigoPorcentajeIva}]
    forma_pago VARCHAR(2) NOT NULL,    -- 19 tarjeta, 20 transferencia, 01 efectivo
    subtotal DECIMAL(12,2) NOT NULL,
    iva DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    numero_autorizacion VARCHAR(49),
    fecha_autorizacion TIMESTAMP NULL,
    mensajes_sri JSONB,
    xml_firmado TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (ambiente, estab, pto_emi, secuencial)
);

-- Nota: en producción el backend usa MySQL/MariaDB (backend/db.js) con un shim
-- compatible con sintaxis PostgreSQL; db.js crea estas mismas tablas en MySQL.
