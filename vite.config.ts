/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import {VitePWA} from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'serviceWorker.ts',
      // injectManifest:{
      //     swSrc: './src/sw.ts',
      // },
      manifest: {
        theme_color: '#007bff',
        background_color: '#FFFFFF',
        display: 'standalone',
        icons: [
          {
            src: '/manifest/64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: '/manifest/192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/manifest/256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: '/manifest/512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: '/manifest/screenshot_PC.png',
            type: 'image/jpg',
            sizes: '2880x1800',
            form_factor: 'wide'
          },
          {
            src: '/manifest/screenshot_iPhone_XR.png',
            type: 'image/jpg',
            sizes: '828x1792'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
