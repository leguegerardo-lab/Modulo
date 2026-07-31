-- ============================================================
-- MIGRACIÓN a esquema simplificado v1.1
-- Ejecutar esto en el SQL Editor de Supabase (reemplaza al
-- schema.sql anterior). Es seguro correrlo aunque ya hayas
-- corrido el esquema viejo: primero lo borra, después crea
-- el nuevo.
-- ============================================================

-- Limpieza del esquema anterior (el "completo", que por ahora no usamos)
DROP TABLE IF EXISTS cobros CASCADE;
DROP TABLE IF EXISTS movimientos_financieros CASCADE;
DROP TABLE IF EXISTS categorias_movimiento CASCADE;
DROP TABLE IF EXISTS cuentas CASCADE;
DROP TABLE IF EXISTS materiales_trabajo CASCADE;
DROP TABLE IF EXISTS presupuestos CASCADE;
DROP TABLE IF EXISTS fotos_trabajo CASCADE;
DROP TABLE IF EXISTS notas_trabajo CASCADE;
DROP TABLE IF EXISTS historial_estados CASCADE;
DROP TABLE IF EXISTS trabajos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS movimientos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TYPE IF EXISTS estado_trabajo CASCADE;
DROP TYPE IF EXISTS estado_cobro CASCADE;
DROP TYPE IF EXISTS estado_presupuesto CASCADE;
DROP TYPE IF EXISTS estado_material CASCADE;
DROP TYPE IF EXISTS tipo_cuenta CASCADE;
DROP TYPE IF EXISTS tipo_categoria CASCADE;
DROP TYPE IF EXISTS tipo_movimiento CASCADE;

-- ============================================================
-- Esquema simplificado: 4 tablas, sin tipos enum ni tablas
-- intermedias (cuentas/categorías como texto simple), porque
-- es exactamente como terminó modelando la app en la práctica.
-- Se puede evolucionar a la versión completa (guardada en
-- database/schema-completo.sql) el día que se necesite más
-- integridad o reportes más finos.
-- ============================================================

CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT,
  direccion TEXT,
  origen TEXT,
  observaciones TEXT,
  fecha_alta TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trabajos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  descripcion TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'nuevo_contacto',
  fecha_estimada_entrega DATE,
  precio_mano_obra NUMERIC(12,2) NOT NULL,
  observaciones TEXT,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL -- 'ingreso' | 'gasto'
);

CREATE TABLE movimientos (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL, -- 'ingreso' | 'gasto' | 'retiro_sueldo' | 'transferencia_reserva'
  cuenta TEXT NOT NULL, -- 'negocio' | 'personal' | 'reserva'
  monto NUMERIC(12,2) NOT NULL,
  categoria TEXT,
  fecha DATE NOT NULL,
  descripcion TEXT,
  trabajo_id INTEGER REFERENCES trabajos(id) ON DELETE SET NULL
);

INSERT INTO categorias (nombre, tipo) VALUES
  ('Mano de obra', 'ingreso'),
  ('Seña', 'ingreso'),
  ('Combustible', 'gasto'),
  ('Herramientas', 'gasto'),
  ('Gastos personales', 'gasto'),
  ('Materiales de taller', 'gasto');

CREATE INDEX idx_trabajos_estado ON trabajos(estado);
CREATE INDEX idx_movimientos_fecha ON movimientos(fecha);
CREATE INDEX idx_movimientos_trabajo ON movimientos(trabajo_id);

-- Nota: las tablas quedan con RLS (Row Level Security) desactivado,
-- que es el valor por defecto en Supabase al crear tablas por SQL.
-- Eso es lo que permite que la "anon key" pública pueda leer y
-- escribir directamente sin necesidad de login — correcto para un
-- uso de un solo usuario/taller como este.
