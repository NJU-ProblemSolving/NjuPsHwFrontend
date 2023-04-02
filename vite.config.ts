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
      // prodUrl: 'https://cdn.staticfile.org/{name}/{version}/{path}',
      prodUrl: 'https://cdn.jsdelivr.net/npm/{name}@{version}/{path}',
      modules: [
        {
          name: 'vue',
          var: 'Vue',
          path: 'dist/vue.global.prod.min.js',
        },
        {
          name: 'vue-router',
          var: 'VueRouter',
          path: 'dist/vue-router.global.prod.min.js',
        },
        {
          name: 'dayjs',
          var: 'dayjs',
          path: ['dayjs.min.js', 'plugin/customParseFormat.js', 'plugin/weekday.js', 'plugin/localeData.js', 'plugin/weekOfYear.js', 'plugin/weekYear.js', 'plugin/advancedFormat.js'],
        },
        {
          name: 'moment',
          var: 'moment',
          path: 'moment.min.js',
        },
        {
          name: 'ant-design-vue',
          var: 'antd',
          path: 'dist/antd.min.js',
          css: 'dist/antd.min.css',
        },
      ]
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: [
      '@ant-design/icons-vue',
      'lodash-es',
      'dayjs',
      'vue',
      'vue-router',
      'async-validator',
    ],
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
