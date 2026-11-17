import { createApp } from 'vue'
import App from './App.vue'

// 全局样式
import './style.css'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

// Element Plus 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 路由
import router from './router'

// 状态管理
import pinia from './store'

// 国际化
import i18n from './locales'

// 自定义指令
import { setupDirectives } from './directives'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(ElementPlus, { size: 'default' })

// 注册所有图标全局可用
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册自定义指令
setupDirectives(app)

// 全局错误处理
app.config.errorHandler = (err: unknown, _instance, info) => {
  console.error('[Vue Error]', info, err)
}

// 全局 $t（供指令和工具函数使用）— 直接使用 i18n.global.t，避免 useI18n() 必须在 setup 内调用的限制
;(window as any).$t = i18n.global.t

app.mount('#app')
