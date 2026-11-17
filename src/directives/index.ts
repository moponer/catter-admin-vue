import type { App } from 'vue'
import { permission } from './permission'
import { debounce } from './debounce'
import { throttle } from './throttle'
import { copy } from './copy'
import { longpress } from './longpress'

/**
 * 全局注册自定义指令
 */
export function setupDirectives(app: App) {
  app.directive('permission', permission)
  app.directive('debounce', debounce)
  app.directive('throttle', throttle)
  app.directive('copy', copy)
  app.directive('longpress', longpress)
}
