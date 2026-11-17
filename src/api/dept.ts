/**
 * 部门管理 API
 */
import { get, post, put, del } from '@/utils/request'

export interface Dept {
  id: number
  name: string
  parentId: number
  sort: number
  leader?: string
  phone?: string
  email?: string
  status: number
  createTime: string
  children?: Dept[]
}

export interface DeptForm {
  id?: number
  name: string
  parentId: number
  sort: number
  leader?: string
  phone?: string
  email?: string
  status: number
}

export function getDeptTree() {
  return get<{ code: number; message: string; data: Dept[] }>('/api/depts/tree')
}

export function getDept(id: number) {
  return get<{ code: number; message: string; data: Dept }>(`/api/depts/${id}`)
}

export function createDept(data: DeptForm) {
  return post('/api/depts', data)
}

export function updateDept(id: number, data: DeptForm) {
  return put(`/api/depts/${id}`, data)
}

export function deleteDept(id: number) {
  return del(`/api/depts/${id}`)
}
