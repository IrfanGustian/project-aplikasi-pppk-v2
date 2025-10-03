import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Ensures the server is accessible outside the container
    watch: {
      usePolling: true,
      interval: 1000, // Check for file changes every 1 second
    },
  },
  build: {
    outDir: 'dist', // Ensure this is 'dist' or match your Dockerfile
  },
})
