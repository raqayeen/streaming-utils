import { defineConfig } from "vite";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: "main.html",
                barberpole: "barberpole.html",
            }
        }
    },
    server: {
        proxy: {
            '/wss': {
                target: 'http://localhost:8080',
                ws: true,
            }
        },
    }
})