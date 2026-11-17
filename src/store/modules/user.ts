import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getUserInfo, type LoginData, type UserInfo } from '@/api/auth'

/**
 * token 存储策略：
 * - 勾选「记住我」→ localStorage（关闭浏览器仍有效）
 * - 未勾选 → sessionStorage（关闭标签页即失效，降低共用电脑上的泄露风险）
 */
const TOKEN_KEY = 'catter-admin-token'
const REMEMBER_KEY = 'catter-admin-remember'

function readToken(): string {
  try {
    const remember = localStorage.getItem(REMEMBER_KEY) === '1'
    const value = remember
      ? localStorage.getItem(TOKEN_KEY)
      : sessionStorage.getItem(TOKEN_KEY)
    return value || ''
  } catch {
    return ''
  }
}

function persistToken(value: string, remember: boolean): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    if (!value) {
      localStorage.setItem(REMEMBER_KEY, '0')
      return
    }
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, '1')
      localStorage.setItem(TOKEN_KEY, value)
    } else {
      localStorage.setItem(REMEMBER_KEY, '0')
      sessionStorage.setItem(TOKEN_KEY, value)
    }
  } catch (error) {
    console.warn('[user] Failed to persist token:', error)
  }
}

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string>(readToken())
  const userInfo = ref<UserInfo | null>(null)

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const nickname = computed(() => userInfo.value?.nickname || '')
  const avatar = computed(() => userInfo.value?.avatar || '')
  const email = computed(() => userInfo.value?.email || '')
  const roles = computed(() => userInfo.value?.roles || [])
  const permissions = computed(() => userInfo.value?.permissions || [])

  // Actions
  const setToken = (newToken: string, remember: boolean = true) => {
    token.value = newToken
    persistToken(newToken, remember)
  }

  const setUserInfo = (info: UserInfo | null) => {
    userInfo.value = info
  }

  const loginAction = async (loginData: LoginData, remember: boolean = true) => {
    const res = await login(loginData)
    setToken(res.data.token, remember)
    return res
  }

  const getUserInfoAction = async () => {
    const res = await getUserInfo()
    setUserInfo(res.data)
    return res
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    persistToken('', false)
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    username,
    nickname,
    avatar,
    email,
    roles,
    permissions,
    setToken,
    setUserInfo,
    loginAction,
    getUserInfoAction,
    logout,
  }
})
