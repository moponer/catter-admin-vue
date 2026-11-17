import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { viteMockServe } from 'vite-plugin-mock'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: '/',
  plugins: [
    vue(),
    // Element Plus 按需自动导入
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
    // Mock 服务：仅开发环境启用。
    // vite-plugin-mock v3 只认 mockPath/enable 等选项（localEnabled/prodEnabled 属于 v2 语义，会被忽略），
    // 配置 enable 才是真正控制开关；生产构建不会打包 mock。
    viteMockServe({
      mockPath: 'src/mock',
      enable: command === 'serve',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    // 默认只监听本机，避免同一局域网内的其他主机访问开发服务器和 mock 接口。
    // 需要手机等设备调试时，用 VITE_HOST=true 或直接改回 '0.0.0.0'。
    host: process.env.VITE_HOST === 'true' ? '0.0.0.0' : '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // echarts 体积较大，单独分包，避免首屏主包过大
          echarts: ['echarts'],
        },
      },
    },
    chunkSizeWarningLimit: 2000,
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      'axios',
      'vue-i18n',
      'echarts',
      'vuedraggable',
      '@vueuse/core',
      '@element-plus/icons-vue',
    ],
  },
}))
