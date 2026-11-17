/**
 * localStorage 类型安全封装
 *
 * 用法：
 *   import { storage } from '@/utils/storage'
 *   storage.set('key', { name: 'test' })
 *   const data = storage.get<{ name: string }>('key')
 *   storage.remove('key')
 */

/** 记录通过本模块写入过的 key，clear() 只清这些 key */
const writtenKeys = new Set<string>()

export const storage = {
  /** 读取（自动 JSON 解析） */
  get<T = any>(key: string, defaultValue?: T): T | undefined {
    try {
      const value = localStorage.getItem(key)
      if (value === null) return defaultValue
      return JSON.parse(value) as T
    } catch {
      return defaultValue
    }
  },

  /** 写入（自动 JSON 序列化） */
  set(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      writtenKeys.add(key)
    } catch (e) {
      console.warn(`[storage] Failed to set key "${key}":`, e)
    }
  },

  /** 删除 */
  remove(key: string): void {
    localStorage.removeItem(key)
  },

  /** 清空本应用写入的键（不触碰同源下的其它应用数据） */
  clear(): void {
    const appKeys = new Set<string>(writtenKeys)
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('catter-') || appKeys.has(key)) {
        localStorage.removeItem(key)
      }
    })
    writtenKeys.clear()
  },

  /** 判断 key 是否存在 */
  has(key: string): boolean {
    return localStorage.getItem(key) !== null
  },

  /** 获取所有 key */
  keys(): string[] {
    return Object.keys(localStorage)
  },
}

/** session storage 同理 */
export const sessionStore = {
  get<T = any>(key: string, defaultValue?: T): T | undefined {
    try {
      const value = sessionStorage.getItem(key)
      if (value === null) return defaultValue
      return JSON.parse(value) as T
    } catch {
      return defaultValue
    }
  },

  set(key: string, value: any): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.warn(`[sessionStore] Failed to set key "${key}":`, e)
    }
  },

  remove(key: string): void {
    sessionStorage.removeItem(key)
  },

  clear(): void {
    sessionStorage.clear()
  },
}
