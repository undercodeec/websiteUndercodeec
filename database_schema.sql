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

-- Nota: Actualmente esta es la única tabla utilizada para la persistencia de datos 
-- en el flujo de pagos y pedidos del proyecto. Los formularios de contacto 
-- y solicitudes de software se gestionan principalmente vía email.
