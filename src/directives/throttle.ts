import type { Directive, DirectiveBinding } from 'vue'

/**
 * v-throttle — 节流点击
 *
 * 用法：
 *   <el-button v-throttle:1000="handleSave">保存</el-button>
 *   默认 500ms
 */
interface ThrottleState {
  listener: EventListener
  timer: ReturnType<typeof setTimeout> | null
  canRun: boolean
}

const states = new WeakMap<HTMLElement, ThrottleState>()

export const throttle: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const delay = Number(binding.arg) || 500
    const state: ThrottleState = { listener: () => {}, timer: null, canRun: true }

    state.listener = () => {
      if (!state.canRun) return
      state.canRun = false

      const handler = binding.value
      if (typeof handler === 'function') handler()

      state.timer = setTimeout(() => {
        state.canRun = true
      }, delay)
    }

    states.set(el, state)
    el.addEventListener('click', state.listener)
  },
  unmounted(el: HTMLElement) {
    const state = states.get(el)
    if (state) {
      el.removeEventListener('click', state.listener)
      if (state.timer) clearTimeout(state.timer)
    }
    states.delete(el)
  },
}
