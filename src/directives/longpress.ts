import type { Directive, DirectiveBinding } from 'vue'

/**
 * v-longpress — 长按事件
 *
 * 用法：
 *   <el-button v-longpress:800="handleLongPress">长按触发</el-button>
 *   默认 500ms
 */
interface LongpressState {
  timer: ReturnType<typeof setTimeout> | null
  start: EventListener
  cancel: EventListener
  events: string[]
}

const states = new WeakMap<HTMLElement, LongpressState>()

export const longpress: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const duration = Number(binding.arg) || 500
    const events = ['mousedown', 'mouseup', 'mouseleave', 'touchstart', 'touchend', 'touchcancel']

    const state: LongpressState = {
      timer: null,
      start: () => {
        state.timer = setTimeout(() => {
          const handler = binding.value
          if (typeof handler === 'function') handler()
        }, duration)
      },
      cancel: () => {
        if (state.timer) {
          clearTimeout(state.timer)
          state.timer = null
        }
      },
      events,
    }

    el.addEventListener('mousedown', state.start)
    el.addEventListener('touchstart', state.start)
    el.addEventListener('mouseup', state.cancel)
    el.addEventListener('mouseleave', state.cancel)
    el.addEventListener('touchend', state.cancel)
    el.addEventListener('touchcancel', state.cancel)

    states.set(el, state)
  },
  unmounted(el: HTMLElement) {
    const state = states.get(el)
    if (!state) return

    el.removeEventListener('mousedown', state.start)
    el.removeEventListener('touchstart', state.start)
    el.removeEventListener('mouseup', state.cancel)
    el.removeEventListener('mouseleave', state.cancel)
    el.removeEventListener('touchend', state.cancel)
    el.removeEventListener('touchcancel', state.cancel)
    if (state.timer) clearTimeout(state.timer)

    states.delete(el)
  },
}
