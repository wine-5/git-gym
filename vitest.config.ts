import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@components': path.resolve(__dirname, 'src/renderer/components'),
      '@models': path.resolve(__dirname, 'src/renderer/models'),
      '@data': path.resolve(__dirname, 'src/renderer/data'),
      '@i18n': path.resolve(__dirname, 'src/renderer/i18n'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // 本物の git を何度も動かすテストがあるので長めにする
    testTimeout: 60_000,
    // 後片付けで大量の練習用リポジトリを消すので、Windows の CI では時間がかかる
    hookTimeout: 180_000,
  },
});
