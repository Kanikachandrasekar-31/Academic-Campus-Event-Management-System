import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Explicit host avoids a common Windows issue where "localhost" resolves
    // to the IPv6 loopback (::1) first, but Vite/Node only bind IPv4 by
    // default — causing ERR_CONNECTION_REFUSED even though the server is
    // genuinely running. true = 0.0.0.0 (all interfaces, IPv4 + IPv6).
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
    },
  },
});
