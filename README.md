# Pastelería Lina Valencia — catálogo web

Catálogo web (React + Vite) pensado para el celular, con:

- **Catálogo** por categorías y productos, con sabores, rellenos, coberturas y tamaños por producto.
- **Guía de porciones** con una torta 3D que se corta según el tamaño y el tipo de corte.
- **Cámara / realidad aumentada**: la torta aparece en tamaño real sobre la mesa (Chrome en Android, Safari en iPhone). Si el navegador no tiene AR, se abre la cámara con la torta encima como guía.
- **Panel privado** para los dueños en `/panel` (no hay enlaces a él en la página).

## Correr en local

```bash
npm install
npm run dev
```

Sin configurar nada, la página usa el catálogo incluido en el código y el panel funciona en **modo demostración**: los cambios se guardan solo en ese navegador.

## Conectar el panel (Supabase)

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. En **SQL Editor**, pega y ejecuta `supabase/schema.sql`.
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
- El número de WhatsApp de los pedidos está en `src/components/OrderForm.jsx` (`WHATSAPP`) y en `src/components/ContactSection.jsx`.
- Las fotos que se suben desde el panel se comprimen automáticamente antes de guardarse.
