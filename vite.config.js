import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    // Production JavaScript is already minified by Vite.
    minify: true,

    // Keep production source maps out of the deployment.
    // sourcemap: false,
    sourcemap: true,

    // Keep route-specific CSS associated with async chunks.
    cssCodeSplit: true,

    // Preserve the warning so large chunks remain visible.
    chunkSizeWarningLimit: 750,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router') ||
            id.includes('/@remix-run/router/')
          ) {
            return 'react-vendor'
          }

          if (id.includes('/firebase/auth/') || id.includes('/firebase/auth')) {
            return 'firebase-auth'
          }

          if (id.includes('/firebase/firestore/') || id.includes('/firebase/firestore')) {
            return 'firebase-firestore'
          }

          if (id.includes('/firebase/storage/') || id.includes('/firebase/storage')) {
            return 'firebase-storage'
          }

          if (id.includes('/firebase/messaging/') || id.includes('/firebase/messaging')) {
            return 'firebase-messaging'
          }

          if (id.includes('/firebase/') || id.includes('/@firebase/')) {
            return 'firebase-vendor'
          }

          return 'vendor'
        },
      },
    },
  },

  server: {
    port: 5173,
    open: true,
  },
})