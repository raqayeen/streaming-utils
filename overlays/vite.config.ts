import { defineConfig } from "vite";

export default defineConfig({
    server: {
        proxy: {
            '/wss': {
                target: 'http://localhost:8080',
                ws: true,
            }
        },
    }
})