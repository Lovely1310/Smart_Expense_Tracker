import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Ye line Codespace ke liye zaroori hai
    port: 5173,
    strictPort: true,
  }
})