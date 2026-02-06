import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        // Include all test files in __tests__ folders or ending with .test.ts
        include: ['src/**/__tests__/**/*.ts', 'src/**/*.test.ts'],
        coverage: {
            reporter: ['text', 'json', 'html'],
            include: ['src/game/engine/**/*.ts'],
            exclude: ['src/game/engine/__tests__/**'],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
