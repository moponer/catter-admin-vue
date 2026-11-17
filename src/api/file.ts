/**
 * 文件管理 API
 */
import { get, del } from '@/utils/request'

export interface FileItem {
  id: number
  name: string
  url: string
  size: number
  type: string
  mimeType: string
  storageType: string
  createTime: string
}

export interface FileQuery {
  page?: number
  pageSize?: number
  keyword?: string
  type?: string
  storageType?: string
  startTime?: string
  endTime?: string
}

export function getFiles(params: FileQuery) {
  return get<{ code: number; message: string; data: { list: FileItem[]; total: number } }>('/api/files', params)
}

export function deleteFile(id: number) {
  return del(`/api/files/${id}`)
}

export function batchDeleteFiles(ids: number[]) {
  return del('/api/files/batch', { ids })
}
