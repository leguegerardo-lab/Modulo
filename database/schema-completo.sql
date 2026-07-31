-- ============================================================
-- TALLER — Esquema de base de datos (Postgres / Supabase)
-- Versión 1 aprobada. Ejecutar de una sola vez en una base nueva.
-- ============================================================

CREATE TYPE estado_trabajo AS ENUM (
  'nuevo_contacto','presupuesto','esperando_respuesta','aprobado',
  'diseno_y_materiales','esperando_materiales','en_cola_fabricacion',
  'fabricando','instalacion','cobro','finalizado'
);
CREATE TYPE estado_cobro AS ENUM ('pendiente','parcial','cobrado');
CREATE TYPE estado_presupuesto AS ENUM ('pendiente','aprobado','rechazado');
CREATE TYPE estado_material AS ENUM ('pendiente','comprado','recibido');
CREATE TYPE tipo_cuenta AS ENUM ('negocio','personal','reserva');
CREATE TYPE tipo_categoria AS ENUM ('ingreso','gasto');
CREATE TYPE tipo_movimiento AS ENUM ('ingreso','gasto','retiro_sueldo','transferencia_reserva');

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
  estado estado_trabajo NOT NULL DEFAULT 'nuevo_contacto',
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_estimada_entrega DATE,
  fecha_real_entrega DATE,
  precio_mano_obra NUMERIC(12,2) NOT NULL,
  monto_sena NUMERIC(12,2),
  fecha_sena DATE,
  estado_cobro estado_cobro NOT NULL DEFAULT 'pendiente',
  fecha_estimada_cobro DATE,
  orden_produccion INTEGER,
  fecha_ultimo_cambio_estado TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE historial_estados (
  id SERIAL PRIMARY KEY,
  trabajo_id INTEGER NOT NULL REFERENCES trabajos(id) ON DELETE CASCADE,
  estado_anterior estado_trabajo,
  estado_nuevo estado_trabajo NOT NULL,
  fecha_cambio TIMESTAMPTZ NOT NULL DEFAULT now(),
  nota TEXT
);

CREATE TABLE notas_trabajo (
  id SERIAL PRIMARY KEY,
  trabajo_id INTEGER NOT NULL REFERENCES trabajos(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fotos_trabajo (
  id SERIAL PRIMARY KEY,
  trabajo_id INTEGER NOT NULL REFERENCES trabajos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE presupuestos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  trabajo_id INTEGER REFERENCES trabajos(id) ON DELETE SET NULL,
  descripcion TEXT,
  monto NUMERIC(12,2) NOT NULL,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado estado_presupuesto NOT NULL DEFAULT 'pendiente',
  fecha_respuesta DATE
);

CREATE TABLE materiales_trabajo (
  id SERIAL PRIMARY KEY,
  trabajo_id INTEGER NOT NULL REFERENCES trabajos(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  cantidad NUMERIC,
  estado estado_material NOT NULL DEFAULT 'pendiente',
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cuentas (
  id SERIAL PRIMARY KEY,
  tipo tipo_cuenta NOT NULL UNIQUE
);
INSERT INTO cuentas (tipo) VALUES ('negocio'), ('personal'), ('reserva');

CREATE TABLE categorias_movimiento (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo tipo_categoria NOT NULL
);
INSERT INTO categorias_movimiento (nombre, tipo) VALUES
  ('Mano de obra', 'ingreso'),
  ('Combustible', 'gasto'),
  ('Herramientas', 'gasto'),
  ('Gastos personales', 'gasto'),
  ('Materiales de taller', 'gasto');

CREATE TABLE movimientos_financieros (
  id SERIAL PRIMARY KEY,
  cuenta_id INTEGER NOT NULL REFERENCES cuentas(id),
  tipo_movimiento tipo_movimiento NOT NULL,
  monto NUMERIC(12,2) NOT NULL,
  categoria_id INTEGER REFERENCES categorias_movimiento(id),
  trabajo_id INTEGER REFERENCES trabajos(id) ON DELETE SET NULL,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  descripcion TEXT,
  cuenta_destino_id INTEGER REFERENCES cuentas(id)
);

CREATE TABLE cobros (
  id SERIAL PRIMARY KEY,
  trabajo_id INTEGER NOT NULL REFERENCES trabajos(id) ON DELETE CASCADE,
  monto NUMERIC(12,2) NOT NULL,
  fecha DATE NOT NULL,
  metodo_pago TEXT,
  movimiento_financiero_id INTEGER REFERENCES movimientos_financieros(id)
);

CREATE INDEX idx_trabajos_estado ON trabajos(estado);
CREATE INDEX idx_trabajos_orden_produccion ON trabajos(orden_produccion);
CREATE INDEX idx_movimientos_cuenta_fecha ON movimientos_financieros(cuenta_id, fecha);
CREATE INDEX idx_historial_trabajo_fecha ON historial_estados(trabajo_id, fecha_cambio);
