import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // required for electron, makes paths relative to the root of the project
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../src-shared"),
      "@electron": path.resolve(__dirname, "../src-electron")
    }
  }
})
