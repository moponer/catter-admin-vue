/**
 * Axios 请求封装
 * 统一处理请求拦截、响应拦截、错误处理
 */
/// <reference types="vite/client" />
import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/store/modules/user'
import { resetSession } from '@/utils/session'
import i18n from '@/locales'

const { t: $t } = i18n.global

/** 后端统一响应结构 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 是否正在处理登出，防止重复跳转
let isHandlingAuthError = false

// 处理认证错误：清理会话并跳转登录页（保留原始地址，登录后回跳）
const handleAuthError = (message?: string) => {
  if (isHandlingAuthError) return
  isHandlingAuthError = true

  resetSession()
  ElMessage.error(message || $t('request.authExpired'))

  const current = router.currentRoute.value.fullPath
  const query = current && !current.startsWith('/login') ? { redirect: current } : undefined

  router
    .replace({ path: '/login', query })
    .catch(() => undefined)
    .finally(() => {
      isHandlingAuthError = false
    })
}

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    const token = userStore.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.warn('Request config error:', error.message || error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const contentType = String(response.headers['content-type'] || '')
    if (contentType.includes('application/json')) {
      const res = response.data as ApiResponse

      // 检查业务状态码（0 / 200 视为成功）
      if (res && typeof res === 'object' && res.code !== undefined && res.code !== 0 && res.code !== 200) {
        const message = res.message || $t('request.failed')

        if (res.code === 401) {
          handleAuthError(message)
          return Promise.reject(new Error(message))
        }

        // 403 是「无权限」，不是「登录失效」，不能清空登录态
        ElMessage.error(message)
        return Promise.reject(new Error(message))
      }

      return res
    }

    if (response.status >= 200 && response.status < 300) {
      return response.data
    }

    throw new Error('Invalid response type')
  },
  (error: AxiosError<ApiResponse>) => {
    const { response } = error

    if (response) {
      const status = response.status
      const contentType = String(response.headers['content-type'] || '')

      if (contentType.includes('application/json')) {
        const data = response.data || ({ message: '' } as ApiResponse)

        switch (status) {
          case 401:
            handleAuthError(data.message || $t('request.authExpired'))
            break
          case 403:
            ElMessage.error(data.message || $t('request.forbidden'))
            break
          case 404:
            ElMessage.error(data.message || $t('request.notFound'))
            break
          case 500:
            ElMessage.error(data.message || $t('request.serverError'))
            break
          default:
            ElMessage.error(data.message || $t('request.failed'))
        }
      } else {
        switch (status) {
          case 401:
            handleAuthError()
            break
          case 403:
            ElMessage.error($t('request.forbidden'))
            break
          case 404:
            ElMessage.error($t('request.notFound'))
            break
          case 500:
            ElMessage.error($t('request.serverError'))
            break
          default:
            ElMessage.error($t('request.failed'))
        }
      }
    } else if (error.request) {
      if (error.code === 'ECONNABORTED') {
        ElMessage.error($t('request.timeout'))
      } else {
        ElMessage.error($t('request.networkError'))
      }
    } else {
      ElMessage.error(error.message || $t('request.configError'))
    }

    return Promise.reject(error)
  }
)

// 请求方法封装
// 说明：响应拦截器已经把响应体解包为 ApiResponse，因此返回类型直接是业务结构
export function get<T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
  return request({ method: 'GET', url, params, ...config }) as unknown as Promise<T>
}

export function post<T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
  return request({ method: 'POST', url, data, ...config }) as unknown as Promise<T>
}

export function put<T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
  return request({ method: 'PUT', url, data, ...config }) as unknown as Promise<T>
}

export function del<T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
  return request({ method: 'DELETE', url, params, ...config }) as unknown as Promise<T>
}

export function upload<T = any>(url: string, file: File, onProgress?: (percent: number) => void): Promise<T> {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent)
      }
    },
  }) as unknown as Promise<T>
}

export default request
