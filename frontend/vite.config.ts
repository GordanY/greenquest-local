import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: { key: fs.readFileSync('self-signed-ssh-cert/key.pem'), cert: fs.readFileSync('self-signed-ssh-cert/cert.pem') },
    host: '0.0.0.0', 
    port: 3000,
    proxy: {
        '/v1': {
          target: 'http://localhost:3000',   // spacetimedb host on your server
          ws: true,
          secure: false,
          changeOrigin: true,
          rewrite: (path) => path,           // keep the path exactly
        },
      },
  },
})
