import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    reporters:
      process.env.CI === 'true' ? ['default', 'github-actions'] : ['default'],
    globalSetup: './test/setup.ts',
  },
});
