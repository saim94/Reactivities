import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { readFileSync } from 'fs';

const key = readFileSync('localhost-key.pem');
const cert = readFileSync('localhost.pem');

export default defineConfig(() => {
    return {
        build: {
            outDir: '../API/wwwroot'
        },
        server: {
            port: 3000,
            https: {
                key,
                cert
            },
        },
        plugins: [react()]
    }
})
