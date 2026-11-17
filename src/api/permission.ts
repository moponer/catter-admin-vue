/**
 * 权限管理 API
 */
import { get, post, put, del } from '@/utils/request'

export interface Permission {
  id: number
  name: string
  code: string
  type: 'menu' | 'button' | 'api'
  parentId: number
  path?: string
  icon?: string
  sort: number
  status: number
  children?: Permission[]
  createTime: string
}

export interface PermissionForm {
  id?: number
  name: string
  code: string
  type: 'menu' | 'button' | 'api'
  parentId: number
  path?: string
  icon?: string
  sort: number
  status: number
}

export function getPermissionTree() {
  return get<{ code: number; message: string; data: Permission[] }>('/api/permissions/tree')
}

export function getPermission(id: number) {
  return get<{ code: number; message: string; data: Permission }>(`/api/permissions/${id}`)
}

export function createPermission(data: PermissionForm) {
  return post('/api/permissions', data)
}

export function updatePermission(id: number, data: PermissionForm) {
  return put(`/api/permissions/${id}`, data)
}

export function deletePermission(id: number) {
  return del(`/api/permissions/${id}`)
}
