import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Dirección pública de la página para la vista previa al compartir (WhatsApp exige direcciones completas).
// En Vercel se toma sola; en otro hosting se puede definir VITE_SITE_URL.
function siteUrl(env) {
  const url = env.VITE_SITE_URL || process.env.VITE_SITE_URL
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    || (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`)
    || '';
  return url.replace(/\/$/, '');
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const url = siteUrl(env);
  return {
    logLevel: 'error', // Suppress warnings, only show errors
    plugins: [
      react(),
      {
        name: 'lv-site-url',
        transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', url),
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  };
});
