import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'Game Life Counter',
        short_name: 'Life Counter',
        description:
          'Life counter for board and card games — 2 to 6 players, presets, dice and a match timer.',
        theme_color: '#111014',
        background_color: '#08080c',
        display: 'standalone',
        orientation: 'any',
        start_url: './',
        scope: './',
        icons: [
          {
            src: './icons/heart.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: './icons/heart.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
