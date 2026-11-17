import { ElMessage } from 'element-plus'
import i18n from '@/locales'

const { t: $t } = i18n.global

/**
 * 剪贴板操作工具
 *
 * 用法：
 *   import { clipboard } from '@/utils/clipboard'
 *   await clipboard.copy('复制的文本')
 *   const text = await clipboard.read()
 */
export const clipboard = {
  /** 复制文本到剪贴板 */
  async copy(text: string, showMessage: boolean = true): Promise<boolean> {
    if (!text) return false

    try {
      await navigator.clipboard.writeText(text)
      if (showMessage) {
        ElMessage.success($t('common.copySuccess'))
      }
      return true
    } catch {
      // fallback：使用 execCommand
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        if (showMessage) {
          ElMessage.success($t('common.copySuccess'))
        }
        return true
      } catch {
        ElMessage.error($t('common.copyFailed'))
        return false
      }
    }
  },

  /** 读取剪贴板文本 */
  async read(): Promise<string> {
    try {
      return await navigator.clipboard.readText()
    } catch {
      return ''
    }
  },
}

