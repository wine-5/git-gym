import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@components': path.resolve(__dirname, 'src/renderer/components'),
      '@models': path.resolve(__dirname, 'src/renderer/models'),
      '@data': path.resolve(__dirname, 'src/renderer/data'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // 本物の git を何度も動かすテストがあるので長めにする
    testTimeout: 60_000,
  },
});
