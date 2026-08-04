import React, { useState } from "react";
import { usePersistentState } from "./usePersistentState";
import { useSupabaseTable } from "./useSupabaseTable";
import {
  LayoutDashboard,
  Users,
  Hammer,
  Wallet,
  Settings,
  Plus,
  ArrowLeft,
  Calendar,
  Banknote,
  AlertTriangle,
  Pencil,
  Trash2,
  Phone,
  MapPin,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
} from "lucide-react";

/* ============================================================
   TALLER — App completa (versión funcional, sin pulido visual)
   Módulo 1: estructura, navegación, layout
   Módulo 2: Trabajos (lista + tarjeta + detalle)
   Módulo 3: formulario de Trabajo (crear / editar)
   Módulo 4: Clientes (lista + detalle + formulario)
   Módulo 5: Dashboard (resumen general)
   Módulo 6: Finanzas (cuentas negocio/personal/reserva + movimientos)
   ------------------------------------------------------------
   Todo el estado (trabajos, clientes, movimientos) vive en el
   componente raíz TallerApp y baja por props — mock data por
   ahora, mismo lugar donde después se conecta la API/DB.
   ============================================================ */

/* ---------------- Theme tokens ---------------- */
const THEME = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');

  .taller-app {
    --bg: #1c1815;
    --surface: #241f19;
    --surface-alt: #2f2820;
    --border: #3a3229;
    --text: #f0eae0;
    --text-muted: #a6998a;
    --accent: #c97d3f;
    --accent-soft: rgba(201, 125, 63, 0.16);
    --info: #6e93a8;
    --info-soft: rgba(110, 147, 168, 0.16);
    --success: #7a9b76;
    --success-soft: rgba(122, 155, 118, 0.16);
    --danger: #b5544a;
    --danger-soft: rgba(181, 84, 74, 0.14);

    --font-display: 'Space Grotesk', sans-serif;
    --font-body: 'Inter', sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;

    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
  }
  .taller-app * { box-sizing: border-box; }

  .taller-shell {
    width: 100%; max-width: 480px; min-height: 100vh;
    display: flex; flex-direction: column;
    background: var(--bg); position: relative;
  }

  .taller-topbar {
    padding: 20px 20px 14px 20px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 12px;
  }
  .back-btn {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid var(--border); background: var(--surface); color: var(--text);
    display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;
  }
  .topbar-text { min-width: 0; }
  .taller-eyebrow {
    font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.14em;
    color: var(--accent); text-transform: uppercase;
    display: flex; align-items: center; gap: 8px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .taller-title {
    font-family: var(--font-display); font-weight: 600; font-size: 22px; margin-top: 4px;
    letter-spacing: -0.01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .tick-divider { display: flex; align-items: center; gap: 6px; margin: 0 20px; height: 14px; }
  .tick-divider .tick { width: 1px; background: var(--border); }
  .tick-divider .tick.major { height: 10px; background: var(--text-muted); }
  .tick-divider .tick.minor { height: 5px; }
  .tick-divider .tick-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); letter-spacing: 0.08em; white-space: nowrap; margin-right: 4px; }

  .taller-content { flex: 1; padding: 18px 20px 110px 20px; }

  .empty-state {
    margin-top: 18px; border: 1px solid var(--border); border-radius: 14px;
    padding: 32px 22px; background: var(--surface);
  }
  .empty-state .idx { font-family: var(--font-mono); font-size: 11px; color: var(--accent); letter-spacing: 0.1em; }
  .empty-state .icon-wrap {
    width: 44px; height: 44px; border-radius: 10px; background: var(--accent-soft);
    display: flex; align-items: center; justify-content: center; margin: 14px 0 16px 0;
  }
  .empty-state h3 { font-family: var(--font-display); font-size: 17px; font-weight: 600; margin: 0 0 8px 0; }
  .empty-state p { font-size: 13.5px; line-height: 1.55; color: var(--text-muted); margin: 0; }

  .section-title { font-family: var(--font-display); font-weight: 600; font-size: 14px; margin: 22px 0 10px 0; }
  .section-title:first-child { margin-top: 0; }

  .list-summary { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px; }
  .list-summary .count { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }
  .list-summary .count b { color: var(--text); }

  /* ---- Tarjeta genérica ---- */
  .simple-card {
    background: var(--surface); border: 1px solid var(--border);
    border-left: 3px solid var(--card-accent, var(--border));
    border-radius: 12px; padding: 14px 14px 12px 13px; margin-bottom: 10px;
    cursor: pointer; transition: transform 0.1s ease;
  }
  .simple-card:active { transform: scale(0.99); }
  .card-top-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
  .card-title { font-family: var(--font-display); font-weight: 600; font-size: 15.5px; line-height: 1.3; }
  .card-subtitle { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .status-badge { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.04em; padding: 4px 8px; border-radius: 20px; white-space: nowrap; flex-shrink: 0; }

  .card-meta-row { display: flex; align-items: center; gap: 14px; margin-top: 12px; padding-top: 10px; border-top: 1px dashed var(--border); flex-wrap: wrap; }
  .meta-item { display: flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 11.5px; color: var(--text-muted); }
  .meta-item.monto { margin-left: auto; color: var(--text); font-weight: 600; }
  .meta-item.positivo { color: var(--success); }
  .meta-item.negativo { color: var(--danger); }

  .atrasado-tag {
    display: flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 10.5px;
    color: var(--danger); background: var(--danger-soft); padding: 3px 8px; border-radius: 20px;
    margin-top: 10px; width: fit-content;
  }

  .fab {
    position: absolute; right: 18px; bottom: 86px; width: 52px; height: 52px; border-radius: 16px;
    background: var(--accent); color: #1c1815; border: none;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 20px rgba(201, 125, 63, 0.35); cursor: pointer; z-index: 5;
  }

  .detail-status-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .detail-warning {
    display: flex; align-items: center; gap: 8px; background: var(--danger-soft); color: var(--danger);
    border-radius: 10px; padding: 10px 12px; font-size: 12.5px; margin-top: 14px;
  }
  .spec-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 13px 0; border-bottom: 1px solid var(--border); }
  .spec-row:last-child { border-bottom: none; }
  .spec-label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; padding-top: 2px; }
  .spec-value { font-size: 14px; text-align: right; max-width: 62%; }
  .spec-value.mono { font-family: var(--font-mono); }

  .edit-btn {
    width: 100%; margin-top: 18px; padding: 13px; border-radius: 12px; border: 1px dashed var(--border);
    background: none; color: var(--text-muted); font-weight: 600; font-size: 13.5px;
    display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;
  }
  .edit-btn.danger { border-color: var(--danger); color: var(--danger); margin-top: 10px; }

  /* ---- Form ---- */
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 12.5px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
  .form-label .required { color: var(--danger); }
  .form-input, .form-select, .form-textarea {
    width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
    padding: 11px 12px; color: var(--text); font-family: var(--font-body); font-size: 14px;
  }
  .form-textarea { resize: vertical; min-height: 64px; }
  .form-input.invalid, .form-select.invalid, .form-textarea.invalid { border-color: var(--danger); }
  .form-error { font-size: 11.5px; color: var(--danger); margin-top: 5px; }
  .form-row-2 { display: flex; gap: 12px; }
  .form-row-2 .form-group { flex: 1; }
  .form-actions { display: flex; gap: 10px; margin-top: 22px; }
  .save-btn { flex: 1; padding: 13px; border-radius: 8px; border: none; background: var(--accent); color: #1c1815; font-weight: 600; font-size: 14px; cursor: pointer; }
  .cancel-btn { padding: 13px 18px; border-radius: 8px; border: 1px solid var(--border); background: none; color: var(--text-muted); font-size: 14px; cursor: pointer; }

  /* ---- Dashboard ---- */
  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 6px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px; }
  .stat-value { font-family: var(--font-mono); font-size: 22px; font-weight: 600; }
  .stat-value.danger { color: var(--danger); }
  .stat-label { font-size: 11px; color: var(--text-muted); margin-top: 4px; }

  /* ---- Finanzas ---- */
  .accounts-row { display: flex; gap: 10px; margin-bottom: 6px; }
  .account-card { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px; }
  .account-card .label { font-size: 10.5px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  .account-card .value { font-family: var(--font-mono); font-size: 15px; font-weight: 600; margin-top: 4px; }

  /* ---- Bottom nav ---- */
  .taller-bottomnav {
    position: absolute; bottom: 0; left: 0; right: 0; max-width: 480px; margin: 0 auto;
    display: flex; border-top: 1px solid var(--border); background: rgba(28, 24, 21, 0.96);
    backdrop-filter: blur(6px); padding: 8px 6px calc(10px + env(safe-area-inset-bottom, 0px)) 6px; z-index: 4;
  }
  .nav-item {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 6px 2px;
    background: none; border: none; cursor: pointer; color: var(--text-muted);
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.03em; position: relative;
  }
  .nav-item .tick-mark { position: absolute; top: -9px; width: 14px; height: 2px; border-radius: 2px; background: var(--accent); opacity: 0; transition: opacity 0.15s ease; }
  .nav-item.active { color: var(--text); }
  .nav-item.active .tick-mark { opacity: 1; }
  .nav-item.active .nav-icon-wrap { background: var(--accent-soft); color: var(--accent); }
  .nav-icon-wrap { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: background 0.15s ease, color 0.15s ease; }
`;

/* ---------------- Nav config ---------------- */
const NAV_ITEMS = [
  { key: "dashboard", label: "Inicio", icon: LayoutDashboard },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "trabajos", label: "Trabajos", icon: Hammer },
  { key: "finanzas", label: "Finanzas", icon: Wallet },
  { key: "configuracion", label: "Ajustes", icon: Settings },
];

/* ---------------- Catálogo de estados ---------------- */
const ESTADOS = [
  { id: "nuevo_contacto", label: "Nuevo contacto", grupo: "comercial" },
  { id: "presupuesto", label: "Presupuesto", grupo: "comercial" },
  { id: "esperando_respuesta", label: "Esperando respuesta", grupo: "comercial" },
  { id: "aprobado", label: "Aprobado", grupo: "comercial" },
  { id: "diseno_y_materiales", label: "Diseño y materiales", grupo: "comercial" },
  { id: "esperando_materiales", label: "Esperando materiales", grupo: "comercial" },
  { id: "en_cola_fabricacion", label: "En cola de fabricación", grupo: "produccion" },
  { id: "fabricando", label: "Fabricando", grupo: "produccion" },
  { id: "instalacion", label: "Instalación", grupo: "produccion" },
  { id: "cobro", label: "Cobro", grupo: "produccion" },
  { id: "finalizado", label: "Finalizado", grupo: "finalizado" },
];
const ESTADO_BY_ID = Object.fromEntries(ESTADOS.map((e) => [e.id, e]));
function estadoStyle(estadoId) {
  const estado = ESTADO_BY_ID[estadoId];
  if (estado.grupo === "finalizado") return { bg: "var(--success-soft)", fg: "var(--success)" };
  if (estado.grupo === "produccion") return { bg: "var(--accent-soft)", fg: "var(--accent)" };
  return { bg: "var(--info-soft)", fg: "var(--info)" };
}

/* ---------------- Mock data ---------------- */
const MOCK_CLIENTES = [
  { id: 1, nombre: "Marcela Ibáñez", telefono: "11-4455-2210", direccion: "Av. Rivadavia 4820, CABA", origen: "Instagram", observaciones: "" },
  { id: 2, nombre: "Diego Ferrari", telefono: "11-3322-8890", direccion: "San Martín 145, Vicente López", origen: "Recomendación", observaciones: "" },
  { id: 3, nombre: "Lucía Nardone", telefono: "11-6677-1234", direccion: "Cabildo 2310, CABA", origen: "Página web", observaciones: "" },
  { id: 4, nombre: "Javier Soto", telefono: "11-5544-9821", direccion: "Belgrano 780, San Isidro", origen: "Instagram", observaciones: "" },
  { id: 5, nombre: "Familia Coria", telefono: "11-2233-4567", direccion: "Mitre 210, Tigre", origen: "Recomendación", observaciones: "" },
  { id: 6, nombre: "Romina Aquino", telefono: "11-7788-3345", direccion: "Corrientes 5560, CABA", origen: "Feria de diseño", observaciones: "" },
  { id: 7, nombre: "Nicolás Beltrán", telefono: "11-9988-1122", direccion: "Alvear 90, Olivos", origen: "Instagram", observaciones: "" },
  { id: 8, nombre: "Estudio Praga", telefono: "11-4433-7766", direccion: "Libertador 3400, CABA", origen: "Recomendación", observaciones: "Cliente corporativo" },
];

const MOCK_TRABAJOS = [
  { id: 1, cliente_id: 1, descripcion: "Mesa de comedor roble 220x100", estado: "fabricando", fecha_seña: "2026-06-18", fecha_estimada_entrega: "2026-08-02", precio_mano_obra: 420000, observaciones: "" },
  { id: 2, cliente_id: 2, descripcion: "Placard 3 puertas melamina nogal", estado: "instalacion", fecha_seña: "2026-06-02", fecha_estimada_entrega: "2026-07-28", precio_mano_obra: 610000, observaciones: "" },
  { id: 3, cliente_id: 3, descripcion: "Rack TV flotante con luz LED", estado: "esperando_materiales", fecha_seña: "2026-07-10", fecha_estimada_entrega: "2026-08-20", precio_mano_obra: 175000, observaciones: "" },
  { id: 4, cliente_id: 4, descripcion: "Escritorio en L para oficina", estado: "en_cola_fabricacion", fecha_seña: "2026-07-05", fecha_estimada_entrega: "2026-08-10", precio_mano_obra: 260000, observaciones: "" },
  { id: 5, cliente_id: 5, descripcion: "Biblioteca a medida living", estado: "presupuesto", fecha_seña: null, fecha_estimada_entrega: null, precio_mano_obra: 350000, observaciones: "" },
  { id: 6, cliente_id: 6, descripcion: "Cama con cajones + respaldo tapizado", estado: "cobro", fecha_seña: "2026-05-20", fecha_estimada_entrega: "2026-07-22", precio_mano_obra: 480000, observaciones: "" },
  { id: 7, cliente_id: 7, descripcion: "Mueble bajo mesada cocina", estado: "aprobado", fecha_seña: "2026-07-20", fecha_estimada_entrega: "2026-09-01", precio_mano_obra: 390000, observaciones: "" },
  { id: 8, cliente_id: 8, descripcion: "Recepción a medida + cartelería", estado: "finalizado", fecha_seña: "2026-04-14", fecha_estimada_entrega: "2026-06-10", precio_mano_obra: 890000, observaciones: "" },
];

const MOCK_MOVIMIENTOS = [
  { id: 1, tipo: "ingreso", cuenta: "negocio", monto: 480000, categoria: "Mano de obra", fecha: "2026-07-22", descripcion: "Cobro cama Romina Aquino" },
  { id: 2, tipo: "gasto", cuenta: "negocio", monto: 35000, categoria: "Combustible", fecha: "2026-07-18", descripcion: "Nafta camioneta" },
  { id: 3, tipo: "gasto", cuenta: "negocio", monto: 52000, categoria: "Herramientas", fecha: "2026-07-12", descripcion: "Fresas nuevas" },
  { id: 4, tipo: "retiro_sueldo", cuenta: "negocio", monto: 250000, fecha: "2026-07-15", descripcion: "Sueldo julio" },
  { id: 5, tipo: "transferencia_reserva", cuenta: "negocio", monto: 80000, fecha: "2026-07-25", descripcion: "Aporte a reserva" },
  { id: 6, tipo: "ingreso", cuenta: "negocio", monto: 610000, categoria: "Mano de obra", fecha: "2026-07-01", descripcion: "Seña placard Diego Ferrari" },
  { id: 7, tipo: "gasto", cuenta: "personal", monto: 60000, categoria: "Gastos personales", fecha: "2026-07-20", descripcion: "Supermercado" },
];

const MOCK_CATEGORIAS = [
  { id: 1, nombre: "Mano de obra", tipo: "ingreso" },
  { id: 2, nombre: "Seña", tipo: "ingreso" },
  { id: 3, nombre: "Combustible", tipo: "gasto" },
  { id: 4, nombre: "Herramientas", tipo: "gasto" },
  { id: 5, nombre: "Gastos personales", tipo: "gasto" },
  { id: 6, nombre: "Materiales de taller", tipo: "gasto" },
];

/* ---------------- Helpers ---------------- */
function formatMonto(n) {
  return n == null || n === "" ? "—" : `$${Number(n).toLocaleString("es-AR")}`;
}
function formatFecha(iso) {
  if (!iso) return "Sin definir";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
const HOY = new Date();
function estaAtrasado(trabajo) {
  if (!trabajo.fecha_estimada_entrega) return false;
  if (trabajo.estado === "finalizado") return false;
  return new Date(trabajo.fecha_estimada_entrega) < HOY;
}
function getClienteNombre(clientes, id) {
  return clientes.find((c) => c.id === id)?.nombre || "Cliente sin definir";
}
function cobradoDeTrabajo(trabajo, movimientos) {
  return movimientos.filter((m) => m.trabajo_id === trabajo.id && m.tipo === "ingreso").reduce((acc, m) => acc + m.monto, 0);
}
function saldoPendienteDeTrabajo(trabajo, movimientos) {
  return Math.max(0, trabajo.precio_mano_obra - cobradoDeTrabajo(trabajo, movimientos));
}
function fechaSeñaDeTrabajo(trabajo, movimientos) {
  const señas = movimientos.filter((m) => m.trabajo_id === trabajo.id && m.tipo === "ingreso" && m.categoria === "Seña");
  if (señas.length === 0) return null;
  return señas.reduce((min, m) => (m.fecha < min ? m.fecha : min), señas[0].fecha);
}
function computeBalances(movimientos) {
  const b = { negocio: 0, personal: 0, reserva: 0 };
  for (const m of movimientos) {
    if (m.tipo === "ingreso") b.negocio += m.monto;
    else if (m.tipo === "gasto") b[m.cuenta] -= m.monto;
    else if (m.tipo === "retiro_sueldo") { b.negocio -= m.monto; b.personal += m.monto; }
    else if (m.tipo === "transferencia_reserva") { b.negocio -= m.monto; b.reserva += m.monto; }
  }
  return b;
}

const NOMBRES_MES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
function claveMes(fecha) { return fecha.slice(0, 7); } // "2026-07"
function formatMes(clave) {
  const [y, m] = clave.split("-");
  return `${NOMBRES_MES[Number(m) - 1]} ${y}`;
}
function agruparPorMes(movimientos) {
  const grupos = {};
  for (const m of movimientos) {
    const clave = claveMes(m.fecha);
    if (!grupos[clave]) grupos[clave] = { ingresos: 0, gastos: 0, movimientos: [] };
    grupos[clave].movimientos.push(m);
    if (m.tipo === "ingreso") grupos[clave].ingresos += m.monto;
    if (m.tipo === "gasto") grupos[clave].gastos += m.monto;
  }
  return Object.entries(grupos)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([clave, datos]) => ({
      clave,
      ...datos,
      movimientos: datos.movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
    }));
}
function topCategoriasGasto(movimientos, limite = 5) {
  const totales = {};
  for (const m of movimientos) {
    if (m.tipo !== "gasto") continue;
    const cat = m.categoria || "Sin categoría";
    totales[cat] = (totales[cat] || 0) + m.monto;
  }
  return Object.entries(totales).sort((a, b) => b[1] - a[1]).slice(0, limite);
}

/* ---------------- Componentes compartidos ---------------- */
function TickDivider({ label }) {
  const ticks = Array.from({ length: 18 });
  return (
    <div className="tick-divider">
      {label && <span className="tick-label">{label}</span>}
      {ticks.map((_, i) => <span key={i} className={`tick ${i % 4 === 0 ? "major" : "minor"}`} />)}
    </div>
  );
}
function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="empty-state">
      <div className="icon-wrap"><Icon size={20} color="var(--accent)" /></div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
function TopBar({ eyebrow, title, onBack }) {
  return (
    <div className="taller-topbar">
      {onBack && <button className="back-btn" onClick={onBack} aria-label="Volver"><ArrowLeft size={16} /></button>}
      <div className="topbar-text">
        <div className="taller-eyebrow">{!onBack && <Hammer size={12} />}{eyebrow}</div>
        <div className="taller-title">{title}</div>
      </div>
    </div>
  );
}
function StatusBadge({ estadoId }) {
  const estado = ESTADO_BY_ID[estadoId];
  const style = estadoStyle(estadoId);
  return <span className="status-badge" style={{ background: style.bg, color: style.fg }}>{estado.label.toUpperCase()}</span>;
}
function BottomNav({ active, onChange }) {
  return (
    <nav className="taller-bottomnav">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item.key === active;
        return (
          <button key={item.key} className={`nav-item ${isActive ? "active" : ""}`} onClick={() => onChange(item.key)}>
            <span className="tick-mark" />
            <span className="nav-icon-wrap"><Icon size={18} /></span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
function FormField({ label, required, error, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label} {required && <span className="required">*</span>}</label>
      {children}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

/* ============================================================
   MÓDULO TRABAJOS
   ============================================================ */
function validarTrabajo(data) {
  const errores = {};
  if (!data.cliente_id) errores.cliente_id = "Elegí un cliente.";
  if (!data.descripcion.trim()) errores.descripcion = "La descripción es obligatoria.";
  if (!data.estado) errores.estado = "Elegí un estado.";
  if (!data.precio_mano_obra || Number(data.precio_mano_obra) <= 0) errores.precio_mano_obra = "Ingresá un monto mayor a 0.";
  return errores;
}

function TrabajoCard({ trabajo, clientes, movimientos, onOpen }) {
  const style = estadoStyle(trabajo.estado);
  const atrasado = estaAtrasado(trabajo);
  const fechaSeña = fechaSeñaDeTrabajo(trabajo, movimientos);
  return (
    <div className="simple-card" style={{ "--card-accent": atrasado ? "var(--danger)" : style.fg }} onClick={() => onOpen(trabajo.id)}>
      <div className="card-top-row">
        <div>
          <div className="card-title">{getClienteNombre(clientes, trabajo.cliente_id)}</div>
          <div className="card-subtitle">{trabajo.descripcion}</div>
        </div>
        <StatusBadge estadoId={trabajo.estado} />
      </div>
      <div className="card-meta-row">
        <div className="meta-item"><Banknote size={12} /> Señado: {fechaSeña ? formatFecha(fechaSeña) : "sin señar"}</div>
        <div className="meta-item"><Hammer size={12} /> {formatFecha(trabajo.fecha_estimada_entrega)}</div>
        <div className="meta-item monto">{formatMonto(trabajo.precio_mano_obra)}</div>
      </div>
      {atrasado && <div className="atrasado-tag"><AlertTriangle size={11} /> Fuera de fecha</div>}
    </div>
  );
}

function TrabajosList({ trabajos, clientes, movimientos, onOpen, onNew }) {
  const activos = trabajos.filter((t) => t.estado !== "finalizado");
  const finalizados = trabajos.filter((t) => t.estado === "finalizado");
  const atrasados = activos.filter(estaAtrasado).length;
  return (
    <>
      <TopBar eyebrow="Cola comercial · Cola de producción" title="Trabajos" />
      <div className="taller-content">
        <div className="list-summary">
          <span className="count"><b>{activos.length}</b> trabajos activos</span>
          {atrasados > 0 && <span className="count" style={{ color: "var(--danger)" }}>{atrasados} fuera de fecha</span>}
        </div>
        {activos.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No tenés trabajos activos.</p>}
        {activos.map((t) => <TrabajoCard key={t.id} trabajo={t} clientes={clientes} movimientos={movimientos} onOpen={onOpen} />)}

        {finalizados.length > 0 && (
          <>
            <div className="section-title">Finalizados ({finalizados.length})</div>
            {finalizados.map((t) => <TrabajoCard key={t.id} trabajo={t} clientes={clientes} movimientos={movimientos} onOpen={onOpen} />)}
          </>
        )}
      </div>
      <button className="fab" onClick={onNew} aria-label="Nuevo trabajo"><Plus size={24} /></button>
    </>
  );
}

function TrabajoDetail({ trabajo, clientes, movimientos, onBack, onEdit, onDelete, onRegistrarSeña, onFinalizarPago }) {
  const atrasado = estaAtrasado(trabajo);
  const cobrado = cobradoDeTrabajo(trabajo, movimientos);
  const saldoPendiente = saldoPendienteDeTrabajo(trabajo, movimientos);
  const yaFinalizado = trabajo.estado === "finalizado";

  function handleDelete() {
    const confirmado = window.confirm(
      `¿Seguro que querés eliminar el trabajo de ${getClienteNombre(clientes, trabajo.cliente_id)}? Esta acción no se puede deshacer.`
    );
    if (confirmado) onDelete(trabajo.id);
  }
  function handleSeña() {
    const input = window.prompt(`¿Cuánto pagó de seña ${getClienteNombre(clientes, trabajo.cliente_id)}?`, "");
    if (input === null) return;
    const monto = Number(input);
    if (!monto || monto <= 0) { window.alert("Ingresá un monto válido."); return; }
    onRegistrarSeña(trabajo, monto);
  }
  function handleFinalizar() {
    const mensaje = saldoPendiente > 0
      ? `Se va a registrar el pago final de ${formatMonto(saldoPendiente)} en Finanzas y el trabajo va a pasar a "Finalizado". ¿Confirmás?`
      : `El trabajo va a pasar a "Finalizado". ¿Confirmás?`;
    if (window.confirm(mensaje)) onFinalizarPago(trabajo, saldoPendiente);
  }

  return (
    <>
      <TopBar eyebrow="Detalle del trabajo" title={getClienteNombre(clientes, trabajo.cliente_id)} onBack={onBack} />
      <div className="taller-content">
        <div className="detail-status-row"><StatusBadge estadoId={trabajo.estado} /></div>
        {atrasado && <div className="detail-warning"><AlertTriangle size={15} /> La fecha prometida de instalación ya pasó.</div>}
        <div style={{ marginTop: 18 }}>
          <div className="spec-row"><span className="spec-label">Descripción</span><span className="spec-value">{trabajo.descripcion}</span></div>
          <div className="spec-row"><span className="spec-label">Instalación prometida</span><span className="spec-value mono">{formatFecha(trabajo.fecha_estimada_entrega)}</span></div>
          {trabajo.observaciones && <div className="spec-row"><span className="spec-label">Observaciones</span><span className="spec-value">{trabajo.observaciones}</span></div>}
        </div>

        <div className="section-title">Pagos</div>
        <div className="simple-card" style={{ cursor: "default" }}>
          <div className="spec-row"><span className="spec-label">Fecha de seña</span><span className="spec-value mono">{fechaSeñaDeTrabajo(trabajo, movimientos) ? formatFecha(fechaSeñaDeTrabajo(trabajo, movimientos)) : "Sin señar"}</span></div>
          <div className="spec-row"><span className="spec-label">Precio total</span><span className="spec-value mono">{formatMonto(trabajo.precio_mano_obra)}</span></div>
          <div className="spec-row"><span className="spec-label">Cobrado</span><span className="spec-value mono" style={{ color: "var(--success)" }}>{formatMonto(cobrado)}</span></div>
          <div className="spec-row"><span className="spec-label">Pendiente</span><span className="spec-value mono" style={{ color: saldoPendiente > 0 ? "var(--danger)" : "var(--success)" }}>{formatMonto(saldoPendiente)}</span></div>
        </div>

        {!yaFinalizado && (
          <>
            {saldoPendiente > 0 && (
              <button className="edit-btn" onClick={handleSeña}><Banknote size={14} /> Registrar seña</button>
            )}
            <button
              className="save-btn"
              style={{ width: "100%", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              onClick={handleFinalizar}
            >
              <Banknote size={14} /> Pago finalizado
            </button>
          </>
        )}

        <button className="edit-btn" onClick={onEdit}><Pencil size={14} /> Editar trabajo</button>
        <button className="edit-btn danger" onClick={handleDelete}><Trash2 size={14} /> Eliminar trabajo</button>
      </div>
    </>
  );
}

function TrabajoForm({ initialData, clientes, onSave, onCancel }) {
  const isEdit = Boolean(initialData);
  const [data, setData] = useState(initialData || {
    cliente_id: "", descripcion: "", estado: "nuevo_contacto",
    fecha_estimada_entrega: "", precio_mano_obra: "", observaciones: "",
  });
  const [errores, setErrores] = useState({});
  function set(campo, valor) { setData((prev) => ({ ...prev, [campo]: valor })); }
  function handleSubmit(e) {
    e.preventDefault();
    const nuevosErrores = validarTrabajo(data);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;
    onSave({ ...data, cliente_id: Number(data.cliente_id), precio_mano_obra: Number(data.precio_mano_obra) });
  }
  return (
    <>
      <TopBar eyebrow={isEdit ? "Editar" : "Carga rápida"} title={isEdit ? "Editar trabajo" : "Nuevo trabajo"} onBack={onCancel} />
      <div className="taller-content">
        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Cliente" required error={errores.cliente_id}>
            <select className={`form-select ${errores.cliente_id ? "invalid" : ""}`} value={data.cliente_id} onChange={(e) => set("cliente_id", e.target.value)}>
              <option value="">Elegir cliente...</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </FormField>
          <FormField label="Descripción" required error={errores.descripcion}>
            <textarea className={`form-textarea ${errores.descripcion ? "invalid" : ""}`} value={data.descripcion} onChange={(e) => set("descripcion", e.target.value)} placeholder="Qué se va a fabricar" />
          </FormField>
          <FormField label="Estado" required error={errores.estado}>
            <select className={`form-select ${errores.estado ? "invalid" : ""}`} value={data.estado} onChange={(e) => set("estado", e.target.value)}>
              {ESTADOS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
            </select>
          </FormField>
          <FormField label="Fecha prometida">
            <input type="date" className="form-input" value={data.fecha_estimada_entrega} onChange={(e) => set("fecha_estimada_entrega", e.target.value)} />
          </FormField>
          <FormField label="Precio mano de obra" required error={errores.precio_mano_obra}>
            <input type="number" min="0" className={`form-input ${errores.precio_mano_obra ? "invalid" : ""}`} value={data.precio_mano_obra} onChange={(e) => set("precio_mano_obra", e.target.value)} placeholder="0" />
          </FormField>
          <FormField label="Observaciones">
            <textarea className="form-textarea" value={data.observaciones} onChange={(e) => set("observaciones", e.target.value)} placeholder="Opcional" />
          </FormField>
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="save-btn">{isEdit ? "Guardar cambios" : "Crear trabajo"}</button>
          </div>
        </form>
      </div>
    </>
  );
}

function TrabajosScreen({ trabajos, crearTrabajo, actualizarTrabajo, eliminarTrabajo, clientes, movimientos, crearMovimiento }) {
  const [vista, setVista] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const seleccionado = trabajos.find((t) => t.id === selectedId) || null;

  async function handleSave(data) {
    if (selectedId != null && vista === "form" && seleccionado) {
      await actualizarTrabajo(selectedId, data);
      setVista("detail");
    } else {
      await crearTrabajo(data);
      setVista("list");
      setSelectedId(null);
    }
  }

  async function handleDelete(id) {
    await eliminarTrabajo(id);
    setVista("list");
    setSelectedId(null);
  }

  function agregarMovimiento(monto, categoria, descripcion, trabajoId) {
    crearMovimiento({ tipo: "ingreso", cuenta: "negocio", monto, categoria, fecha: new Date().toISOString().slice(0, 10), descripcion, trabajo_id: trabajoId });
  }

  function handleRegistrarSeña(trabajo, monto) {
    agregarMovimiento(monto, "Seña", `Seña: ${trabajo.descripcion} (${getClienteNombre(clientes, trabajo.cliente_id)})`, trabajo.id);
  }

  async function handleFinalizarPago(trabajo, saldoPendiente) {
    if (saldoPendiente > 0) {
      agregarMovimiento(saldoPendiente, "Mano de obra", `Pago final: ${trabajo.descripcion} (${getClienteNombre(clientes, trabajo.cliente_id)})`, trabajo.id);
    }
    await actualizarTrabajo(trabajo.id, { estado: "finalizado" });
  }

  if (vista === "detail" && seleccionado) {
    return (
      <TrabajoDetail
        trabajo={seleccionado}
        clientes={clientes}
        movimientos={movimientos}
        onBack={() => setVista("list")}
        onEdit={() => setVista("form")}
        onDelete={handleDelete}
        onRegistrarSeña={handleRegistrarSeña}
        onFinalizarPago={handleFinalizarPago}
      />
    );
  }
  if (vista === "form") {
    return <TrabajoForm initialData={seleccionado} clientes={clientes} onSave={handleSave} onCancel={() => setVista(seleccionado ? "detail" : "list")} />;
  }
  return (
    <TrabajosList
      trabajos={trabajos}
      clientes={clientes}
      movimientos={movimientos}
      onOpen={(id) => { setSelectedId(id); setVista("detail"); }}
      onNew={() => { setSelectedId(null); setVista("form"); }}
    />
  );
}

/* ============================================================
   MÓDULO CLIENTES
   ============================================================ */
function validarCliente(data) {
  const errores = {};
  if (!data.nombre.trim()) errores.nombre = "El nombre es obligatorio.";
  return errores;
}

function ClienteCard({ cliente, cantidadTrabajos, onOpen }) {
  return (
    <div className="simple-card" onClick={() => onOpen(cliente.id)}>
      <div className="card-top-row">
        <div>
          <div className="card-title">{cliente.nombre}</div>
          <div className="card-subtitle">{cliente.telefono || "Sin teléfono"}</div>
        </div>
      </div>
      <div className="card-meta-row">
        <div className="meta-item"><Hammer size={12} /> {cantidadTrabajos} trabajo{cantidadTrabajos !== 1 ? "s" : ""}</div>
      </div>
    </div>
  );
}

function ClientesList({ clientes, trabajos, onOpen, onNew }) {
  return (
    <>
      <TopBar eyebrow="Base de contactos" title="Clientes" />
      <div className="taller-content">
        <div className="list-summary"><span className="count"><b>{clientes.length}</b> clientes</span></div>
        {clientes.map((c) => (
          <ClienteCard key={c.id} cliente={c} cantidadTrabajos={trabajos.filter((t) => t.cliente_id === c.id).length} onOpen={onOpen} />
        ))}
      </div>
      <button className="fab" onClick={onNew} aria-label="Nuevo cliente"><Plus size={24} /></button>
    </>
  );
}

function ClienteDetail({ cliente, trabajosDelCliente, onBack, onEdit, onDelete }) {
  function handleDelete() {
    if (trabajosDelCliente.length > 0) {
      window.alert(
        `No se puede eliminar a ${cliente.nombre} porque tiene ${trabajosDelCliente.length} trabajo(s) cargado(s). Eliminá o reasigná esos trabajos primero.`
      );
      return;
    }
    const confirmado = window.confirm(`¿Seguro que querés eliminar a ${cliente.nombre}? Esta acción no se puede deshacer.`);
    if (confirmado) onDelete(cliente.id);
  }
  return (
    <>
      <TopBar eyebrow="Detalle del cliente" title={cliente.nombre} onBack={onBack} />
      <div className="taller-content">
        <div className="spec-row"><span className="spec-label"><Phone size={12} /> Teléfono</span><span className="spec-value">{cliente.telefono || "—"}</span></div>
        <div className="spec-row"><span className="spec-label"><MapPin size={12} /> Dirección</span><span className="spec-value">{cliente.direccion || "—"}</span></div>
        <div className="spec-row"><span className="spec-label">Origen</span><span className="spec-value">{cliente.origen || "—"}</span></div>
        {cliente.observaciones && <div className="spec-row"><span className="spec-label">Observaciones</span><span className="spec-value">{cliente.observaciones}</span></div>}

        <button className="edit-btn" onClick={onEdit}><Pencil size={14} /> Editar cliente</button>
        <button className="edit-btn danger" onClick={handleDelete}><Trash2 size={14} /> Eliminar cliente</button>

        <div className="section-title">Trabajos ({trabajosDelCliente.length})</div>
        {trabajosDelCliente.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Todavía no tiene trabajos cargados.</p>}
        {trabajosDelCliente.map((t) => (
          <div key={t.id} className="simple-card" style={{ cursor: "default" }}>
            <div className="card-top-row">
              <div className="card-title" style={{ fontSize: 14 }}>{t.descripcion}</div>
              <StatusBadge estadoId={t.estado} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ClienteForm({ initialData, onSave, onCancel }) {
  const isEdit = Boolean(initialData);
  const [data, setData] = useState(initialData || { nombre: "", telefono: "", direccion: "", origen: "", observaciones: "" });
  const [errores, setErrores] = useState({});
  function set(campo, valor) { setData((prev) => ({ ...prev, [campo]: valor })); }
  function handleSubmit(e) {
    e.preventDefault();
    const nuevosErrores = validarCliente(data);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;
    onSave(data);
  }
  return (
    <>
      <TopBar eyebrow={isEdit ? "Editar" : "Alta rápida"} title={isEdit ? "Editar cliente" : "Nuevo cliente"} onBack={onCancel} />
      <div className="taller-content">
        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Nombre" required error={errores.nombre}>
            <input className={`form-input ${errores.nombre ? "invalid" : ""}`} value={data.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Nombre y apellido" />
          </FormField>
          <FormField label="Teléfono">
            <input className="form-input" value={data.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="11-1234-5678" />
          </FormField>
          <FormField label="Dirección">
            <input className="form-input" value={data.direccion} onChange={(e) => set("direccion", e.target.value)} />
          </FormField>
          <FormField label="Origen">
            <input className="form-input" value={data.origen} onChange={(e) => set("origen", e.target.value)} placeholder="Instagram, recomendación..." />
          </FormField>
          <FormField label="Observaciones">
            <textarea className="form-textarea" value={data.observaciones} onChange={(e) => set("observaciones", e.target.value)} placeholder="Opcional" />
          </FormField>
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="save-btn">{isEdit ? "Guardar cambios" : "Crear cliente"}</button>
          </div>
        </form>
      </div>
    </>
  );
}

function ClientesScreen({ clientes, crearCliente, actualizarCliente, eliminarCliente, trabajos }) {
  const [vista, setVista] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const seleccionado = clientes.find((c) => c.id === selectedId) || null;

  async function handleSave(data) {
    if (selectedId != null && vista === "form" && seleccionado) {
      await actualizarCliente(selectedId, data);
      setVista("detail");
    } else {
      await crearCliente(data);
      setVista("list");
      setSelectedId(null);
    }
  }

  async function handleDelete(id) {
    await eliminarCliente(id);
    setVista("list");
    setSelectedId(null);
  }

  if (vista === "detail" && seleccionado) {
    return (
      <ClienteDetail
        cliente={seleccionado}
        trabajosDelCliente={trabajos.filter((t) => t.cliente_id === seleccionado.id)}
        onBack={() => setVista("list")}
        onEdit={() => setVista("form")}
        onDelete={handleDelete}
      />
    );
  }
  if (vista === "form") {
    return <ClienteForm initialData={seleccionado} onSave={handleSave} onCancel={() => setVista(seleccionado ? "detail" : "list")} />;
  }
  return (
    <ClientesList
      clientes={clientes}
      trabajos={trabajos}
      onOpen={(id) => { setSelectedId(id); setVista("detail"); }}
      onNew={() => { setSelectedId(null); setVista("form"); }}
    />
  );
}

/* ============================================================
   MÓDULO DASHBOARD
   ============================================================ */
function DashboardScreen({ trabajos, clientes, movimientos }) {
  const activos = trabajos.filter((t) => t.estado !== "finalizado");
  const atrasados = trabajos.filter(estaAtrasado);
  const enProduccion = trabajos.filter((t) => ESTADO_BY_ID[t.estado].grupo === "produccion");
  const totalCobrosPendientes = trabajos
    .filter((t) => t.estado !== "finalizado")
    .reduce((acc, t) => acc + saldoPendienteDeTrabajo(t, movimientos), 0);
  const proximasInstalaciones = trabajos
    .filter((t) => t.fecha_estimada_entrega && t.estado !== "finalizado")
    .sort((a, b) => new Date(a.fecha_estimada_entrega) - new Date(b.fecha_estimada_entrega))
    .slice(0, 4);
  const balances = computeBalances(movimientos);

  return (
    <>
      <TopBar eyebrow="Panel general" title="Inicio" />
      <div className="taller-content">
        <div className="stat-grid">
          <div className="stat-card"><div className="stat-value">{activos.length}</div><div className="stat-label">Trabajos activos</div></div>
          <div className="stat-card"><div className={`stat-value ${atrasados.length > 0 ? "danger" : ""}`}>{atrasados.length}</div><div className="stat-label">Fuera de fecha</div></div>
          <div className="stat-card"><div className="stat-value">{enProduccion.length}</div><div className="stat-label">En producción</div></div>
          <div className="stat-card"><div className="stat-value">{formatMonto(totalCobrosPendientes)}</div><div className="stat-label">Por cobrar</div></div>
        </div>

        <div className="section-title">Próximas instalaciones</div>
        {proximasInstalaciones.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No hay instalaciones programadas.</p>}
        {proximasInstalaciones.map((t) => (
          <div key={t.id} className="simple-card" style={{ cursor: "default", "--card-accent": estaAtrasado(t) ? "var(--danger)" : "var(--border)" }}>
            <div className="card-top-row">
              <div>
                <div className="card-title" style={{ fontSize: 14 }}>{getClienteNombre(clientes, t.cliente_id)}</div>
                <div className="card-subtitle">{t.descripcion}</div>
              </div>
              <span className="meta-item mono">{formatFecha(t.fecha_estimada_entrega)}</span>
            </div>
          </div>
        ))}

        <div className="section-title">Resumen financiero</div>
        <div className="accounts-row">
          <div className="account-card"><div className="label">Negocio</div><div className="value">{formatMonto(balances.negocio)}</div></div>
          <div className="account-card"><div className="label">Personal</div><div className="value">{formatMonto(balances.personal)}</div></div>
          <div className="account-card"><div className="label">Reserva</div><div className="value">{formatMonto(balances.reserva)}</div></div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   MÓDULO FINANZAS
   ============================================================ */
const TIPO_MOVIMIENTO_META = {
  ingreso: { label: "Ingreso", icon: ArrowUpRight, color: "var(--success)" },
  gasto: { label: "Gasto", icon: ArrowDownRight, color: "var(--danger)" },
  retiro_sueldo: { label: "Retiro de sueldo", icon: Banknote, color: "var(--info)" },
  transferencia_reserva: { label: "Aporte a reserva", icon: Repeat, color: "var(--accent)" },
};

function validarMovimiento(data) {
  const errores = {};
  if (!data.tipo) errores.tipo = "Elegí un tipo de movimiento.";
  if (!data.monto || Number(data.monto) <= 0) errores.monto = "Ingresá un monto mayor a 0.";
  if (!data.fecha) errores.fecha = "Ingresá una fecha.";
  if (data.tipo === "gasto" && !data.cuenta) errores.cuenta = "Elegí de qué cuenta sale el gasto.";
  return errores;
}

function cuentaAfectada(data) {
  if (data.tipo === "gasto") return data.cuenta;
  if (data.tipo === "retiro_sueldo" || data.tipo === "transferencia_reserva") return "negocio";
  return null; // un ingreso nunca deja una cuenta en negativo
}
const NOMBRE_CUENTA = { negocio: "Negocio", personal: "Personal", reserva: "Reserva" };

function MovimientoForm({ categorias, balances, onSave, onCancel }) {
  const [data, setData] = useState({ tipo: "ingreso", cuenta: "negocio", monto: "", categoria: "", fecha: "", descripcion: "" });
  const [errores, setErrores] = useState({});
  function set(campo, valor) { setData((prev) => ({ ...prev, [campo]: valor })); }
  function handleSubmit(e) {
    e.preventDefault();
    const nuevosErrores = validarMovimiento(data);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;
    onSave({ ...data, monto: Number(data.monto) });
  }

  const cuentaImpactada = cuentaAfectada(data);
  const montoNum = Number(data.monto) || 0;
  const saldoProyectado = cuentaImpactada ? balances[cuentaImpactada] - montoNum : null;
  const quedaEnNegativo = cuentaImpactada && montoNum > 0 && saldoProyectado < 0;

  return (
    <>
      <TopBar eyebrow="Finanzas" title="Nuevo movimiento" onBack={onCancel} />
      <div className="taller-content">
        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Tipo" required error={errores.tipo}>
            <select className="form-select" value={data.tipo} onChange={(e) => set("tipo", e.target.value)}>
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
              <option value="retiro_sueldo">Retiro de sueldo (negocio → personal)</option>
              <option value="transferencia_reserva">Aporte a reserva (negocio → reserva)</option>
            </select>
          </FormField>
          {data.tipo === "gasto" && (
            <FormField label="Cuenta de origen" required error={errores.cuenta}>
              <select className={`form-select ${errores.cuenta ? "invalid" : ""}`} value={data.cuenta} onChange={(e) => set("cuenta", e.target.value)}>
                <option value="negocio">Negocio</option>
                <option value="personal">Personal</option>
              </select>
            </FormField>
          )}
          <FormField label="Monto" required error={errores.monto}>
            <input type="number" min="0" className={`form-input ${errores.monto ? "invalid" : ""}`} value={data.monto} onChange={(e) => set("monto", e.target.value)} placeholder="0" />
          </FormField>
          {quedaEnNegativo && (
            <div className="detail-warning" style={{ marginTop: -6, marginBottom: 16 }}>
              <AlertTriangle size={15} /> Ojo: esto va a dejar la cuenta {NOMBRE_CUENTA[cuentaImpactada]} en {formatMonto(saldoProyectado)}. Igual podés registrarlo si querés.
            </div>
          )}
          <FormField label="Fecha" required error={errores.fecha}>
            <input type="date" className={`form-input ${errores.fecha ? "invalid" : ""}`} value={data.fecha} onChange={(e) => set("fecha", e.target.value)} />
          </FormField>
          <FormField label="Categoría">
            <select className="form-select" value={data.categoria} onChange={(e) => set("categoria", e.target.value)}>
              <option value="">Sin categoría</option>
              {categorias.filter((c) => c.tipo === data.tipo).map((c) => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Descripción">
            <input className="form-input" value={data.descripcion} onChange={(e) => set("descripcion", e.target.value)} placeholder="Opcional" />
          </FormField>
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="save-btn">Registrar</button>
          </div>
        </form>
      </div>
    </>
  );
}

function GraficoMensual({ grupos }) {
  const ultimos = [...grupos].slice(0, 6).reverse();
  if (ultimos.length === 0) return null;
  const maxValor = Math.max(1, ...ultimos.flatMap((g) => [g.ingresos, g.gastos]));
  return (
    <div className="simple-card" style={{ cursor: "default" }}>
      <div style={{ display: "flex", gap: 14, marginBottom: 12, fontSize: 11, color: "var(--text-muted)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--success)", display: "inline-block" }} /> Ingresos</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--danger)", display: "inline-block" }} /> Gastos</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        {ultimos.map((g) => (
          <div key={g.clave} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 90 }}>
              <div style={{ width: 10, borderRadius: "3px 3px 0 0", background: "var(--success)", height: `${Math.max(2, (g.ingresos / maxValor) * 90)}px` }} />
              <div style={{ width: 10, borderRadius: "3px 3px 0 0", background: "var(--danger)", height: `${Math.max(2, (g.gastos / maxValor) * 90)}px` }} />
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--text-muted)" }}>{formatMes(g.clave).slice(0, 3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopCategoriasGasto({ movimientos }) {
  const top = topCategoriasGasto(movimientos, 5);
  if (top.length === 0) return null;
  const maxValor = top[0][1];
  return (
    <div className="simple-card" style={{ cursor: "default" }}>
      {top.map(([nombre, monto]) => (
        <div key={nombre} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
            <span>{nombre}</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>{formatMonto(monto)}</span>
          </div>
          <div style={{ height: 6, background: "var(--border)", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(monto / maxValor) * 100}%`, background: "var(--danger)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MovimientoRow({ movimiento, onDelete }) {
  const meta = TIPO_MOVIMIENTO_META[movimiento.tipo];
  const Icon = meta.icon;
  const esNegativoParaNegocio = movimiento.tipo !== "ingreso";
  function handleDelete() {
    const confirmado = window.confirm("¿Eliminar este movimiento? Esto va a recalcular los saldos de las cuentas.");
    if (confirmado) onDelete(movimiento.id);
  }
  return (
    <div className="simple-card" style={{ cursor: "default", "--card-accent": meta.color }}>
      <div className="card-top-row">
        <div>
          <div className="card-title" style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon size={14} color={meta.color} /> {meta.label}
          </div>
          <div className="card-subtitle">{movimiento.descripcion || movimiento.categoria || "—"}</div>
        </div>
        <span className={`meta-item monto ${esNegativoParaNegocio ? "negativo" : "positivo"}`}>
          {esNegativoParaNegocio ? "-" : "+"}{formatMonto(movimiento.monto)}
        </span>
      </div>
      <div className="card-meta-row">
        <div className="meta-item"><Calendar size={12} /> {formatFecha(movimiento.fecha)}</div>
        <button
          onClick={handleDelete}
          aria-label="Eliminar movimiento"
          style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--danger)", cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function FinanzasScreen({ movimientos, crearMovimiento, eliminarMovimiento, vaciarMovimientos, categorias, metaReserva }) {
  const [mostrandoForm, setMostrandoForm] = useState(false);
  const balances = computeBalances(movimientos);
  const gruposPorMes = agruparPorMes(movimientos);
  const mesActual = gruposPorMes[0]; // el más reciente, si existe

  const totalIngresos = movimientos.filter((m) => m.tipo === "ingreso").reduce((acc, m) => acc + m.monto, 0);
  const metaAcumulada = totalIngresos * (metaReserva / 100);
  const faltanteReserva = Math.max(0, Math.round(metaAcumulada - balances.reserva));
  const progresoReserva = metaAcumulada > 0 ? Math.min(100, Math.round((balances.reserva / metaAcumulada) * 100)) : 100;

  if (mostrandoForm) {
    return (
      <MovimientoForm
        categorias={categorias}
        balances={balances}
        onCancel={() => setMostrandoForm(false)}
        onSave={async (data) => {
          await crearMovimiento(data);
          setMostrandoForm(false);
        }}
      />
    );
  }

  async function handleDeleteMovimiento(id) {
    await eliminarMovimiento(id);
  }

  async function handleReiniciar() {
    const confirmado = window.confirm(
      "¿Vaciar TODOS los movimientos financieros y empezar de cero? Los saldos de negocio, personal y reserva van a volver a $0. Esta acción no se puede deshacer."
    );
    if (confirmado) await vaciarMovimientos();
  }

  async function handleAportarSugerido() {
    const confirmado = window.confirm(`Se va a transferir ${formatMonto(faltanteReserva)} de Negocio a Reserva. ¿Confirmás?`);
    if (!confirmado) return;
    await crearMovimiento({ tipo: "transferencia_reserva", cuenta: "negocio", monto: faltanteReserva, fecha: new Date().toISOString().slice(0, 10), descripcion: "Aporte sugerido a la reserva" });
  }

  return (
    <>
      <TopBar eyebrow="Negocio · Personal · Reserva" title="Finanzas" />
      <div className="taller-content">
        <div className="accounts-row">
          <div className="account-card"><div className="label"><PiggyBank size={11} /> Negocio</div><div className="value">{formatMonto(balances.negocio)}</div></div>
          <div className="account-card"><div className="label">Personal</div><div className="value">{formatMonto(balances.personal)}</div></div>
          <div className="account-card"><div className="label">Reserva</div><div className="value">{formatMonto(balances.reserva)}</div></div>
        </div>

        <div className="section-title">Meta de reserva ({metaReserva}% de los ingresos)</div>
        <div className="simple-card" style={{ cursor: "default" }}>
          <div className="card-top-row">
            <span style={{ fontSize: 13 }}>{formatMonto(balances.reserva)} de {formatMonto(metaAcumulada)}</span>
            <span className="meta-item">{progresoReserva}%</span>
          </div>
          <div style={{ height: 6, background: "var(--border)", borderRadius: 6, marginTop: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progresoReserva}%`, background: "var(--accent)" }} />
          </div>
          {faltanteReserva > 0 && (
            <button className="edit-btn" style={{ marginTop: 14 }} onClick={handleAportarSugerido}>
              <PiggyBank size={14} /> Aportar {formatMonto(faltanteReserva)} sugeridos
            </button>
          )}
        </div>

        {mesActual && (
          <>
            <div className="section-title">{formatMes(mesActual.clave)} (mes más reciente)</div>
            <div className="accounts-row">
              <div className="account-card"><div className="label">Ingresos</div><div className="value" style={{ color: "var(--success)" }}>{formatMonto(mesActual.ingresos)}</div></div>
              <div className="account-card"><div className="label">Gastos</div><div className="value" style={{ color: "var(--danger)" }}>{formatMonto(mesActual.gastos)}</div></div>
              <div className="account-card"><div className="label">Balance</div><div className="value">{formatMonto(mesActual.ingresos - mesActual.gastos)}</div></div>
            </div>
          </>
        )}

        <div className="section-title">Ingresos vs. gastos (últimos meses)</div>
        <GraficoMensual grupos={gruposPorMes} />

        <div className="section-title">En qué gastás más</div>
        {topCategoriasGasto(movimientos).length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Todavía no hay gastos registrados.</p>
        ) : (
          <TopCategoriasGasto movimientos={movimientos} />
        )}

        <div className="section-title">Movimientos</div>
        {gruposPorMes.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Todavía no hay movimientos registrados.</p>}
        {gruposPorMes.map((grupo) => (
          <div key={grupo.clave} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "14px 0 8px 0" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13 }}>{formatMes(grupo.clave)}</span>
              <span className="meta-item mono">
                <span style={{ color: "var(--success)" }}>+{formatMonto(grupo.ingresos)}</span>
                {" · "}
                <span style={{ color: "var(--danger)" }}>-{formatMonto(grupo.gastos)}</span>
              </span>
            </div>
            {grupo.movimientos.map((m) => <MovimientoRow key={m.id} movimiento={m} onDelete={handleDeleteMovimiento} />)}
          </div>
        ))}
        {movimientos.length > 0 && (
          <button className="edit-btn danger" onClick={handleReiniciar}><Trash2 size={14} /> Vaciar todos los movimientos</button>
        )}
      </div>
      <button className="fab" onClick={() => setMostrandoForm(true)} aria-label="Nuevo movimiento"><Plus size={24} /></button>
    </>
  );
}

/* ============================================================
   MÓDULO CONFIGURACIÓN
   ============================================================ */
function validarCategoria(data) {
  const errores = {};
  if (!data.nombre.trim()) errores.nombre = "El nombre es obligatorio.";
  return errores;
}

function CategoriaForm({ onSave, onCancel }) {
  const [data, setData] = useState({ nombre: "", tipo: "gasto" });
  const [errores, setErrores] = useState({});
  function set(campo, valor) { setData((prev) => ({ ...prev, [campo]: valor })); }
  function handleSubmit(e) {
    e.preventDefault();
    const nuevosErrores = validarCategoria(data);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;
    onSave(data);
  }
  return (
    <>
      <TopBar eyebrow="Ajustes" title="Nueva categoría" onBack={onCancel} />
      <div className="taller-content">
        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Nombre" required error={errores.nombre}>
            <input className={`form-input ${errores.nombre ? "invalid" : ""}`} value={data.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej: Barniz y pinturas" />
          </FormField>
          <FormField label="Tipo" required>
            <select className="form-select" value={data.tipo} onChange={(e) => set("tipo", e.target.value)}>
              <option value="gasto">Gasto</option>
              <option value="ingreso">Ingreso</option>
            </select>
          </FormField>
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="save-btn">Crear categoría</button>
          </div>
        </form>
      </div>
    </>
  );
}

function ConfiguracionScreen({ categorias, crearCategoria, metaReserva, setMetaReserva }) {
  const [mostrandoForm, setMostrandoForm] = useState(false);

  if (mostrandoForm) {
    return (
      <CategoriaForm
        onCancel={() => setMostrandoForm(false)}
        onSave={async (data) => {
          await crearCategoria(data);
          setMostrandoForm(false);
        }}
      />
    );
  }

  return (
    <>
      <TopBar eyebrow="Preferencias del sistema" title="Ajustes" />
      <div className="taller-content">
        <div className="section-title">Meta de reserva</div>
        <div className="simple-card" style={{ cursor: "default" }}>
          <FormField label="Porcentaje de cada ingreso sugerido para la reserva">
            <input
              type="number"
              min="0"
              max="100"
              className="form-input"
              value={metaReserva}
              onChange={(e) => setMetaReserva(Number(e.target.value))}
            />
          </FormField>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: 0 }}>
            En Finanzas vas a ver cuánto deberías tener acumulado en la reserva según este porcentaje sobre el total histórico de ingresos, y un botón para aportar la diferencia.
          </p>
        </div>

        <div className="section-title">Categorías de movimientos</div>
        <div className="list-summary"><span className="count"><b>{categorias.length}</b> categorías</span></div>
        {categorias.map((c) => (
          <div key={c.id} className="simple-card" style={{ cursor: "default" }}>
            <div className="card-top-row">
              <div className="card-title" style={{ fontSize: 14 }}>{c.nombre}</div>
              <span className="meta-item">{c.tipo === "ingreso" ? "Ingreso" : "Gasto"}</span>
            </div>
          </div>
        ))}
        <button className="edit-btn" onClick={() => setMostrandoForm(true)}><Plus size={14} /> Agregar categoría</button>

        <div className="section-title">Otros ajustes</div>
        <EmptyState
          icon={Settings}
          title="Próximamente"
          description="Datos del taller, gestión de estados y otras preferencias se van a agregar más adelante."
        />
      </div>
    </>
  );
}

/* ---------------- App raíz ---------------- */
export default function TallerApp() {
  const [screen, setScreen] = useState("dashboard");

  const clientesTabla = useSupabaseTable("clientes");
  const trabajosTabla = useSupabaseTable("trabajos");
  const movimientosTabla = useSupabaseTable("movimientos", "fecha");
  const categoriasTabla = useSupabaseTable("categorias", "id", true);

  // La meta de reserva es una preferencia liviana, se puede dejar por dispositivo
  const [metaReserva, setMetaReserva] = usePersistentState("taller:metaReserva", 10);

  const cargando = clientesTabla.cargando || trabajosTabla.cargando || movimientosTabla.cargando || categoriasTabla.cargando;
  const errorConexion = clientesTabla.error || trabajosTabla.error || movimientosTabla.error || categoriasTabla.error;

  let content;
  if (cargando) {
    content = (
      <div className="taller-content" style={{ paddingTop: 60, textAlign: "center", color: "var(--text-muted)" }}>
        Cargando datos del taller...
      </div>
    );
  } else if (errorConexion) {
    content = (
      <div className="taller-content" style={{ paddingTop: 40 }}>
        <div className="detail-warning">
          <AlertTriangle size={15} /> No se pudo conectar con la base de datos: {errorConexion}
        </div>
      </div>
    );
  } else if (screen === "trabajos") {
    content = (
      <TrabajosScreen
        trabajos={trabajosTabla.data}
        crearTrabajo={trabajosTabla.crear}
        actualizarTrabajo={trabajosTabla.actualizar}
        eliminarTrabajo={trabajosTabla.eliminar}
        clientes={clientesTabla.data}
        movimientos={movimientosTabla.data}
        crearMovimiento={movimientosTabla.crear}
      />
    );
  } else if (screen === "clientes") {
    content = (
      <ClientesScreen
        clientes={clientesTabla.data}
        crearCliente={clientesTabla.crear}
        actualizarCliente={clientesTabla.actualizar}
        eliminarCliente={clientesTabla.eliminar}
        trabajos={trabajosTabla.data}
      />
    );
  } else if (screen === "finanzas") {
    content = (
      <FinanzasScreen
        movimientos={movimientosTabla.data}
        crearMovimiento={movimientosTabla.crear}
        eliminarMovimiento={movimientosTabla.eliminar}
        vaciarMovimientos={movimientosTabla.vaciar}
        categorias={categoriasTabla.data}
        metaReserva={metaReserva}
      />
    );
  } else if (screen === "configuracion") {
    content = (
      <ConfiguracionScreen
        categorias={categoriasTabla.data}
        crearCategoria={categoriasTabla.crear}
        metaReserva={metaReserva}
        setMetaReserva={setMetaReserva}
      />
    );
  } else {
    content = <DashboardScreen trabajos={trabajosTabla.data} clientes={clientesTabla.data} movimientos={movimientosTabla.data} />;
  }

  return (
    <div className="taller-app">
      <style>{THEME}</style>
      <div className="taller-shell">
        {content}
        <BottomNav active={screen} onChange={setScreen} />
      </div>
    </div>
  );
}
