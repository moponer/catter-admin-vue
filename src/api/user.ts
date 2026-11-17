/**
 * 用户管理 API
 */
import { get, post, put, del } from '@/utils/request'

export interface User {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  status: number
  avatar: string
  roles: string[]
  createTime: string
}

export interface UserQuery {
  page?: number
  pageSize?: number
  keyword?: string
  status?: number
}

export interface UserForm {
  id?: number
  username: string
  nickname: string
  email: string
  phone: string
  status: number
  roles: string[]
  password?: string
}

export function getUsers(params: UserQuery) {
  return get<{ code: number; message: string; data: { list: User[]; total: number } }>('/api/users', params)
}

export function getUser(id: number) {
  return get<{ code: number; message: string; data: User }>(`/api/users/${id}`)
}

export function createUser(data: UserForm) {
  return post('/api/users', data)
}

export function updateUser(id: number, data: UserForm) {
  return put(`/api/users/${id}`, data)
}

export function deleteUser(id: number) {
  return del(`/api/users/${id}`)
}

export function batchDeleteUsers(ids: number[]) {
  return del('/api/users/batch', { ids })
}
