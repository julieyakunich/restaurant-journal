import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // host: true binds to 0.0.0.0 so other devices on the same Wi-Fi
    // (e.g. your phone) can reach the dev server at http://<this-machine-ip>:5173
    host: true,
    port: 5173,
    strictPort: true,
    open: false,
  },
});
