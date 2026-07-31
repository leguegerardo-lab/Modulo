import { useState, useEffect } from "react";

/**
 * Igual que useState, pero guarda y recupera el valor de localStorage.
 * Esto es lo que hace que los datos sobrevivan a cerrar la pestaña o
 * apagar el celular: quedan guardados en ese dispositivo para siempre,
 * sin necesidad de cuenta ni conexión a internet.
 *
 * Cuando en el futuro se conecte una base de datos real (ver
 * /database/schema.sql), este hook se reemplaza por llamadas a la API
 * — el resto de los componentes no cambia.
 */
export function usePersistentState(key, valorInicial) {
  const [valor, setValor] = useState(() => {
    try {
      const guardado = localStorage.getItem(key);
      return guardado ? JSON.parse(guardado) : valorInicial;
    } catch {
      return valorInicial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(valor));
    } catch {
      // si el almacenamiento está lleno o no disponible, seguimos
      // funcionando en memoria sin romper la app
    }
  }, [key, valor]);

  return [valor, setValor];
}
