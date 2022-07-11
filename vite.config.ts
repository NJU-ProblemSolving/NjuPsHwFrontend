import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import importToCDN from 'vite-plugin-cdn-import'

import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
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
        target: 'http://h2.lihan.fun:30006/',
        changeOrigin: true,
      }
    }
  }
})
