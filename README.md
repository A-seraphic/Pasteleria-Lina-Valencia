# Pastelería Lina Valencia — catálogo web

Catálogo web (React + Vite) pensado para el celular, con:

- **Catálogo** por categorías y productos, con sabores, rellenos, coberturas y tamaños por producto.
- **Guía de porciones** con una torta 3D que se corta según el tamaño y el tipo de corte.
- **Cámara / realidad aumentada**: la torta aparece en tamaño real sobre la mesa (Chrome en Android, Safari en iPhone). Si el navegador no tiene AR, se abre la cámara con la torta encima como guía.
- **Mi pedido**: el cliente agrega varios productos personalizados y genera **un solo recibo** con subtotales y total, que se envía por WhatsApp.
- **Buscador** en el catálogo y **enlaces para compartir** cada diseño (`/?c=1&p=102`); el botón Atrás del teléfono cierra la ficha.
- **Preguntas frecuentes**, vista previa al compartir el enlace (imagen y descripción), ícono para la pantalla de inicio y datos para Google.
- **Panel privado** para los dueños en `/panel` (no hay enlaces a él en la página): catálogo, especializaciones con precios, tamaños, recibo (con vista previa), preguntas frecuentes y datos del negocio.

## Correr en local

```bash
npm install
npm run dev
```

Sin configurar nada, la página usa el catálogo incluido en el código y el panel funciona en **modo demostración**: los cambios se guardan solo en ese navegador.

## Conectar el panel (Supabase)

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. En **SQL Editor**, pega y ejecuta `supabase/schema.sql`. Si la base ya existía de antes, ejecuta también `supabase/migrations/002_panel_avanzado.sql`.
3. En **Authentication > Users**, crea el usuario de cada dueño (correo y contraseña). En **Authentication > Sign In / Providers** desactiva "Allow new users to sign up" para que nadie más pueda registrarse.
4. En **SQL Editor**, autoriza esos correos:
   ```sql
   insert into public.admins (email) values ('correo-de-lina@ejemplo.com');
   ```
5. Copia `.env.example` como `.env.local` y llena `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (en **Project Settings > API**). Configura las mismas variables en el hosting donde publiques la página.
6. Entra a `/panel`, inicia sesión y pulsa **Importar catálogo actual** para copiar el catálogo a la base de datos.

Desde ahí, todo lo que los dueños cambien en el panel (productos, fotos, precios, sabores, rellenos, tamaños, qué se muestra y qué no) se publica para todos los clientes.

## Notas

- La realidad aumentada necesita que la página se sirva por **HTTPS** (cualquier hosting moderno lo hace).
- La imagen de vista previa al compartir usa la dirección pública: en Vercel se detecta sola; en otro hosting define `VITE_SITE_URL` (ej: `https://linavalencia.com`).
- Para probar el panel sin tocar la base real: crea `.env.demo.local` con `VITE_SUPABASE_URL=` y `VITE_SUPABASE_ANON_KEY=` vacíos y corre `npx vite --mode demo` (los cambios se guardan solo en ese navegador).
- El número de WhatsApp, Instagram, dirección y horario se editan en el panel → **Negocio** (valores por defecto en `src/data/defaults.js`).
- Las fotos que se suben desde el panel se comprimen automáticamente antes de guardarse.
