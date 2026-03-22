import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/api/gold': {
        target: 'https://api.jisuapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gold/, '')
      }
    }
  }
})
