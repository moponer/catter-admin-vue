/**
 * 字典管理 API
 */
import { get, post, put, del } from '@/utils/request'

// 字典大类
export interface DictType {
  id: number
  name: string
  code: string
  status: number
  remark?: string
  createTime: string
}

export interface DictTypeForm {
  id?: number
  name: string
  code: string
  status: number
  remark?: string
}

// 字典小类
export interface DictData {
  id: number
  typeId: number
  label: string
  value: string
  sort: number
  status: number
  remark?: string
  createTime: string
}

export interface DictDataForm {
  id?: number
  typeId: number
  label: string
  value: string
  sort: number
  status: number
  remark?: string
}

export interface DictTypeQuery {
  page?: number
  pageSize?: number
  keyword?: string
  status?: number
}

// 字典大类 CRUD
export function getDictTypes(params: DictTypeQuery) {
  return get<{ code: number; message: string; data: { list: DictType[]; total: number } }>('/api/dict/types', params)
}

export function getDictType(id: number) {
  return get<{ code: number; message: string; data: DictType }>(`/api/dict/types/${id}`)
}

export function createDictType(data: DictTypeForm) {
  return post('/api/dict/types', data)
}

export function updateDictType(id: number, data: DictTypeForm) {
  return put(`/api/dict/types/${id}`, data)
}

export function deleteDictType(id: number) {
  return del(`/api/dict/types/${id}`)
}

// 字典小类 CRUD
export function getDictDataList(typeId: number) {
  return get<{ code: number; message: string; data: DictData[] }>(`/api/dict/types/${typeId}/data`)
}

export function createDictData(data: DictDataForm) {
  return post('/api/dict/data', data)
}

export function updateDictData(id: number, data: DictDataForm) {
  return put(`/api/dict/data/${id}`, data)
}

export function deleteDictData(id: number) {
  return del(`/api/dict/data/${id}`)
}

// 根据 code 获取字典数据（用于 DictSelect 组件）
export function getDictDataByCode(code: string) {
  return get<{ code: number; message: string; data: DictData[] }>(`/api/dict/code/${code}`)
}
