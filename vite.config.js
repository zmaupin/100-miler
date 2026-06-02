import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vitest config lives under `test`. Pure utils run in the node environment;
// component tests (later) can opt into jsdom per-file.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
