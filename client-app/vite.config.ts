import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { readFileSync } from 'fs';

const key = readFileSync('localhost+1-key.pem');
const cert = readFileSync('localhost+1.pem');

export default defineConfig(() => {
    return {
        build: {
            outDir: '../API/wwwroot',
            emptyOutDir: true
        },
        server: {
            host: "127.0.0.1" || "localhost",
            port: 3000,
            https: {
                key,
                cert
            },
        },
        plugins: [react()]
    }
})
