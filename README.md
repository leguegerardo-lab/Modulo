# Taller — Sistema operativo del taller

## Ya sincroniza entre dispositivos

La app se conecta a una base de datos real en Supabase. Todo lo que
cargues desde el celular o la PC queda en el mismo lugar — abrís el
link desde cualquier dispositivo y ves los mismos datos.

## Paso obligatorio antes de usarla: correr el SQL en Supabase

1. Entrá a tu proyecto en [supabase.com](https://supabase.com).
2. Andá a **SQL Editor** → "New query".
3. Abrí el archivo `database/migracion-v1.1.sql` de esta carpeta,
   copiá todo su contenido, pegalo ahí, y tocá **"Run"**.
   - Es seguro correrlo aunque ya hayas ejecutado el `schema.sql`
     viejo antes: primero borra esas tablas y crea las nuevas
     (más simples, que son las que la app usa de verdad ahora).

Con eso ya está: la app en `src/App.jsx` viene configurada con las
credenciales de tu proyecto (`src/supabaseClient.js`).

## Publicarla (si todavía no lo hiciste)

Ver los pasos de siempre: subir a GitHub → conectar con Vercel →
"Deploy". Cada vez que actualices `src/App.jsx` en GitHub, Vercel
republica solo.

## Estructura del proyecto

```
taller-app/
  src/
    App.jsx                 → toda la app (pantallas, componentes)
    supabaseClient.js        → conexión a tu base de datos
    useSupabaseTable.js      → hook genérico: leer/crear/editar/borrar
    main.jsx                 → punto de entrada
  database/
    migracion-v1.1.sql        → el esquema que hay que correr en Supabase (usar este)
    schema-completo.sql       → versión más detallada/normalizada, para más adelante
  index.html, package.json, vite.config.js
```

## Notas importantes

- **Sin login.** La app no tiene pantalla de usuario/contraseña —
  cualquiera con el link de Vercel puede usarla. Para un solo
  usuario (vos) alcanza, pero no lo compartas como si fuera un link
  cualquiera. Si más adelante querés agregar una clave de acceso,
  se puede sumar.
- **La meta de reserva** (el % que configurás en Ajustes) todavía se
  guarda por dispositivo, no sincroniza — es una preferencia menor,
  se puede pasar a la base más adelante si hace falta.
