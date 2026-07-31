import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

/**
 * Reemplaza a usePersistentState (localStorage) por datos reales en
 * Supabase, compartidos entre todos los dispositivos.
 *
 * Devuelve:
 *  - data: el arreglo actual (ya sincronizado)
 *  - cargando: true mientras trae los datos por primera vez
 *  - error: mensaje de error de conexión, si lo hay
 *  - crear(objeto): inserta una fila nueva, devuelve la fila con su id real
 *  - actualizar(id, cambios): actualiza una fila existente
 *  - eliminar(id): borra una fila
 *  - vaciar(): borra TODAS las filas de la tabla
 */
export function useSupabaseTable(tabla, orderBy = "id", ascending = false) {
  const [data, setData] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    const { data: filas, error: err } = await supabase.from(tabla).select("*").order(orderBy, { ascending });
    if (err) setError(err.message);
    else { setData(filas || []); setError(null); }
    setCargando(false);
  }, [tabla, orderBy, ascending]);

  useEffect(() => { recargar(); }, [recargar]);

  async function crear(objeto) {
    const { data: fila, error: err } = await supabase.from(tabla).insert(objeto).select().single();
    if (err) { window.alert(`No se pudo guardar en ${tabla}: ${err.message}`); return null; }
    setData((prev) => [fila, ...prev]);
    return fila;
  }

  async function actualizar(id, cambios) {
    const { data: fila, error: err } = await supabase.from(tabla).update(cambios).eq("id", id).select().single();
    if (err) { window.alert(`No se pudo actualizar en ${tabla}: ${err.message}`); return null; }
    setData((prev) => prev.map((r) => (r.id === id ? fila : r)));
    return fila;
  }

  async function eliminar(id) {
    const { error: err } = await supabase.from(tabla).delete().eq("id", id);
    if (err) { window.alert(`No se pudo eliminar en ${tabla}: ${err.message}`); return false; }
    setData((prev) => prev.filter((r) => r.id !== id));
    return true;
  }

  async function vaciar() {
    const { error: err } = await supabase.from(tabla).delete().gte("id", 0);
    if (err) { window.alert(`No se pudo vaciar ${tabla}: ${err.message}`); return false; }
    setData([]);
    return true;
  }

  return { data, cargando, error, crear, actualizar, eliminar, vaciar, recargar };
}
