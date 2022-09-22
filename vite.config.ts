import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import eslintPlugin from 'vite-plugin-eslint'
import importToCDN from 'vite-plugin-cdn-import'

import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    eslintPlugin({ fix: true }),
    importToCDN({
      prodUrl: 'https://cdn.staticfile.org/{name}/{version}/{path}',
      // prodUrl: 'https://cdn.jsdelivr.net/npm/{name}@{version}/dist/{path}',
      modules: [
        {
          name: 'vue',
          var: 'Vue',
          path: 'vue.global.prod.min.js',
        },
        {
          name: 'vue-router',
          var: 'VueRouter',
          path: 'vue-router.global.prod.min.js',
        },
        {
          name: 'ant-design-vue',
          var: 'antd',
          path: 'antd.js',
          css: 'antd.min.css',
        },
      ]
    }),
    importToCDN({
      prodUrl: 'https://cdn.staticfile.org/moment.js/{version}/{path}',
      // prodUrl: 'https://cdn.jsdelivr.net/npm/{name}@{version}/dist/{path}',
      modules: [
        {
          name: 'moment',
          var: 'moment',
          path: 'moment.min.js',
        },
      ]
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        // target: 'https://hw.problemsolving.top/',
        target: 'http://host.lihan.fun/',
        changeOrigin: true,
      }
    }
  }
})
