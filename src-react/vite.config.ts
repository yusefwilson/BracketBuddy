import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // required for electron, makes paths relative to the root of the project
  build: {
    outDir: "../build-react",   // ⬅️ where the built app will go
    emptyOutDir: true,         // clear it before each build
  }
})
