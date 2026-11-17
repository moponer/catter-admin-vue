import type { Directive, DirectiveBinding } from 'vue'
import { ElMessage } from 'element-plus'
import i18n from '@/locales'

const { t: $t } = i18n.global

/**
 * v-copy — 一键复制到剪贴板
 *
 * 用法：
 *   <span v-copy="'复制的内容'">点击复制</span>
 *   <span v-copy="row.url">复制链接</span>
 */
const listeners = new WeakMap<HTMLElement, EventListener>()

export const copy: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
    el.style.cursor = 'pointer'

    const listener: EventListener = async () => {
      // 每次点击读取最新值，避免元素复用后复制到旧内容
      const text = binding.value
      if (!text) return

      try {
        await navigator.clipboard.writeText(text)
        ElMessage.success($t('common.copySuccess'))
      } catch {
        // 非安全上下文（http）下的兜底方案
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(textarea)
        if (ok) {
          ElMessage.success($t('common.copySuccess'))
        } else {
          ElMessage.error($t('common.copyFailed'))
        }
      }
    }

    listeners.set(el, listener)
    el.addEventListener('click', listener)
  },
  unmounted(el: HTMLElement) {
    const listener = listeners.get(el)
    if (listener) el.removeEventListener('click', listener)
    listeners.delete(el)
  },
}
