import type { Directive, DirectiveBinding } from 'vue'

/**
 * v-debounce — 防抖点击
 *
 * 用法：
 *   <el-button v-debounce:500="handleSubmit">提交</el-button>
 *   默认 300ms
 *
 * 说明：监听器在 unmounted 时解绑；回调每次触发时从 binding.value 读取，避免闭包持有旧函数。
 */
const handlers = new WeakMap<HTMLElement, EventListener>()
const timers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>()

export const debounce: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const delay = Number(binding.arg) || 300

    const listener: EventListener = () => {
      const current = timers.get(el)
      if (current) clearTimeout(current)

      const timer = setTimeout(() => {
        const handler = binding.value
        if (typeof handler === 'function') handler()
      }, delay)
      timers.set(el, timer)
    }

    handlers.set(el, listener)
    el.addEventListener('click', listener)
  },
  unmounted(el: HTMLElement) {
    const listener = handlers.get(el)
    if (listener) el.removeEventListener('click', listener)
    handlers.delete(el)

    const timer = timers.get(el)
    if (timer) clearTimeout(timer)
    timers.delete(el)
  },
}
