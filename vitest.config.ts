import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/game/engine/**/*.ts'],
      exclude: ['src/game/engine/__tests__/**']
    },
    include: ['src/**/__tests__/*.test.ts', 'src/**/*.test.ts']
  },
});
