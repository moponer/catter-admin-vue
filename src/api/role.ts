/**
 * 角色管理 API
 */
import { get, post, put, del } from '@/utils/request'

export interface Role {
  id: number
  name: string
  code: string
  description: string
  status: number
  createTime: string
}

export interface RoleForm {
  id?: number
  name: string
  code: string
  description: string
  status: number
}

export interface RoleListParams {
  page: number
  pageSize: number
  keyword?: string
}

/** 角色列表 */
export function getRoleList(params: RoleListParams) {
  return get<{ code: number; message: string; data: { list: Role[]; total: number } }>(
    '/api/role/list',
    params,
  )
}

/** 角色详情 */
export function getRoleDetail(id: number) {
  return get<{ code: number; message: string; data: Role }>(`/api/role/${id}`)
}

/** 新增角色 */
export function createRole(data: RoleForm) {
  return post<{ code: number; message: string }>('/api/role', data)
}

/** 修改角色 */
export function updateRole(id: number, data: RoleForm) {
  return put<{ code: number; message: string }>(`/api/role/${id}`, data)
}

/** 删除角色 */
export function deleteRole(id: number) {
  return del<{ code: number; message: string }>(`/api/role/${id}`)
}

/** 批量删除角色 */
export function deleteRoleBatch(ids: number[]) {
  return del<{ code: number; message: string }>('/api/role/batch', { ids })
}
