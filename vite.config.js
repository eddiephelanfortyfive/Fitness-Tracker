import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Uncomment the base line below if deploying to a project page (not user/organization page)
  // base: '/Fitness-Tracker/',
})

