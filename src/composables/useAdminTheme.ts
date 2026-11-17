/**
 * Admin Theme Composable
 * 管理后台双主题切换：Dark Pro / Light Minimal
 */

import { ref, watch, onMounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import i18n from '@/locales'

const { t: $t } = i18n.global

export interface AdminTheme {
  id: string
  name: string
  description: string
  icon: string
}

// 双主题定义
export const ADMIN_THEMES: AdminTheme[] = [
  {
    id: 'dark',
    name: 'Dark Pro',
    description: $t('theme.dark'),
    icon: 'Moon',
  },
  {
    id: 'light',
    name: 'Light Minimal',
    description: $t('theme.light'),
    icon: 'Sunny',
  },
]

// 默认主题
const defaultTheme = 'dark'

// 持久化
const currentThemeId = useLocalStorage('catter-admin-theme', defaultTheme)

// 过渡状态
const isTransitioning = ref(false)

// 应用主题到 DOM
const applyTheme = (themeId: string) => {
  isTransitioning.value = true
  const html = document.documentElement

  html.classList.add('theme-transitioning')
  html.removeAttribute('data-admin-theme')

  if (themeId !== defaultTheme) {
    html.setAttribute('data-admin-theme', themeId)
  }

  window.dispatchEvent(new CustomEvent('theme-change', { detail: { themeId } }))

  setTimeout(() => {
    html.classList.remove('theme-transitioning')
    isTransitioning.value = false
  }, 300)
}

// 主题切换 Hook
export const useAdminTheme = () => {
  const currentTheme = ref<AdminTheme>(ADMIN_THEMES[0])

  onMounted(() => {
    const savedTheme = ADMIN_THEMES.find((t) => t.id === currentThemeId.value)
    if (savedTheme) {
      currentTheme.value = savedTheme
      applyTheme(savedTheme.id)
    }
  })

  watch(currentThemeId, (newThemeId) => {
    const theme = ADMIN_THEMES.find((t) => t.id === newThemeId)
    if (theme) {
      currentTheme.value = theme
      applyTheme(theme.id)
    }
  })

  const setTheme = (themeId: string) => {
    if (ADMIN_THEMES.some((t) => t.id === themeId)) {
      currentThemeId.value = themeId
    }
  }

  return {
    currentThemeId,
    currentTheme,
    isTransitioning,
    setTheme,
    themes: ADMIN_THEMES,
  }
}
