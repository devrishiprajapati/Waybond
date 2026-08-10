import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
<<<<<<< HEAD

=======
>>>>>>> 5eb8ad9613b1759b567404e865e63ada6cb372fc
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
