/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const BASE_PATH = process.env.VITE_BASE_PATH || "/";

  return {
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
        scope: BASE_PATH,
        manifest: {
          lang: 'ru',
          theme_color: '#007bff',
          background_color: '#FFFFFF',
          display: 'standalone',
          icons: [
            {
              purpose: 'maskable any',
              sizes: '512x512',
              src: 'manifest/icon512_maskable.png',
              type: 'image/png'
            },
          ],
          screenshots: [
            {
              src: 'manifest/screenshot_PC.png',
              type: 'image/jpg',
              sizes: '2880x1800',
              form_factor: 'wide'
            },
            {
              src: 'manifest/screenshot_iPhone_XR.png',
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
    base: BASE_PATH,
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
  }
})
