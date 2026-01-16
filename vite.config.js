import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get base path from environment variable or default to '/'
// For GitHub Pages: 
// - If repo is 'username.github.io' (user/org page), set base to '/'
// - If repo is 'username.github.io/repo-name', set base to '/repo-name/'
// You can override this by setting BASE_PATH environment variable:
//   Windows: set BASE_PATH=/repo-name/ && npm run build
//   Linux/Mac: BASE_PATH=/repo-name/ npm run build
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  base: base,
  plugins: [react()],
  server: {
    port: 3000
  }
})
