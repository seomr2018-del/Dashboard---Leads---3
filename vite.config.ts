import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// הטוקן של Airtable נקרא כאן, בצד השרת, ומוזרק לבקשה בפרוקסי.
// הדפדפן פונה ל-/api/airtable/... ולעולם לא רואה את הטוקן.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const token = env.AIRTABLE_TOKEN;

  const proxy = {
    '/api/airtable': {
      target: 'https://api.airtable.com/v0',
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api\/airtable/, ''),
      configure: (p: { on: (event: 'proxyReq', cb: (req: { setHeader: (k: string, v: string) => void }) => void) => void }) => {
        p.on('proxyReq', (req) => {
          if (token) req.setHeader('Authorization', `Bearer ${token}`);
        });
      },
    },
  };

  return {
    plugins: [react(), tailwindcss()],
    define: {
      __AIRTABLE_ENABLED__: JSON.stringify(Boolean(token)),
    },
    server: { proxy },
    preview: { proxy },
  };
});
