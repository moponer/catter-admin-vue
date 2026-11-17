/**
 * 日志管理 API
 */
import { get, del } from '@/utils/request'

// 登录日志
export interface LoginLog {
  id: number
  username: string
  ip: string
  location: string
  browser: string
  os: string
  status: number
  message: string
  loginTime: string
}

// 操作日志
export interface OperateLog {
  id: number
  username: string
  module: string
  action: string
  method: string
  params?: string
  ip: string
  location: string
  status: number
  errorMsg?: string
  duration: number
  operateTime: string
}

export interface LoginLogQuery {
  page?: number
  pageSize?: number
  keyword?: string
  status?: number
  startTime?: string
  endTime?: string
}

export interface OperateLogQuery {
  page?: number
  pageSize?: number
  keyword?: string
  module?: string
  status?: number
  startTime?: string
  endTime?: string
}

export function getLoginLogs(params: LoginLogQuery) {
  return get<{ code: number; message: string; data: { list: LoginLog[]; total: number } }>('/api/logs/login', params)
}

export function deleteLoginLog(id: number) {
  return del(`/api/logs/login/${id}`)
}

export function cleanLoginLogs() {
  return del('/api/logs/login/clean')
}

export function getOperateLogs(params: OperateLogQuery) {
  return get<{ code: number; message: string; data: { list: OperateLog[]; total: number } }>('/api/logs/operate', params)
}

export function getOperateLog(id: number) {
  return get<{ code: number; message: string; data: OperateLog }>(`/api/logs/operate/${id}`)
}

export function deleteOperateLog(id: number) {
  return del(`/api/logs/operate/${id}`)
}

export function cleanOperateLogs() {
  return del('/api/logs/operate/clean')
}
