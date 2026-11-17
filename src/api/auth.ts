/**
 * 认证相关 API
 */
import { post, get } from '@/utils/request'

export interface LoginData {
  username: string
  password: string
  captcha?: string
}

export interface LoginResult {
  token: string
  expiresIn: number
}

export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
  roles: string[]
  permissions: string[]
}

export function login(data: LoginData) {
  return post<{ code: number; message: string; data: LoginResult }>('/api/auth/login', data)
}

export function getUserInfo() {
  return get<{ code: number; message: string; data: UserInfo }>('/api/auth/user')
}

export function logout() {
  return post('/api/auth/logout')
}
