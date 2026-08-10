import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({

    plugins: [react()],
    server: {
        host: "0.0.0.0",
        allowedHosts: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3002',
                changeOrigin: true,
                proxyTimeout: 300_000, // 5 minutes — needed for large PDF uploads
                timeout: 300_000,
            }
        },
        hmr: {
            clientPort: 443,
        },
    },
})
