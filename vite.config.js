import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            hotFile: 'storage/framework/vite.hot',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        host: 'localhost',
        hmr: {
            host: 'localhost',
        },
        watch: {
            usePolling: true,
            interval: 150,
        },
    },
    resolve: {
        alias: [
            { find: '@/components', replacement: path.resolve(__dirname, 'resources/js/Components') },
            { find: '@/layouts', replacement: path.resolve(__dirname, 'resources/js/Layouts') },
            { find: '@/pages', replacement: path.resolve(__dirname, 'resources/js/Pages') },
            { find: '@', replacement: path.resolve(__dirname, 'resources/js') },
        ],
    },
});
