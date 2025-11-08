import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Base path для GitHub Pages (назва репозиторію)
const repositoryName = 'KNUTE-master-s-degree-lab1-TPIS'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? `/${repositoryName}/` : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

