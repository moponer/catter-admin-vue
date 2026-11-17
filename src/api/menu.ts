/**
 * 菜单管理 API
 */
import { get, post, put, del } from '@/utils/request'

export interface Menu {
  id: number
  title: string
  name: string
  path: string
  component?: string
  icon?: string
  sort: number
  hidden: boolean
  keepAlive?: boolean
  parentId: number
  permission?: string
  children?: Menu[]
}

export interface MenuForm {
  id?: number
  title: string
  name: string
  path: string
  component?: string
  icon?: string
  sort: number
  hidden: boolean
  parentId: number
}

/** 菜单列表 */
export function getMenuList() {
  return get<{ code: number; message: string; data: Menu[] }>('/api/menu/list')
}

/** 菜单详情 */
export function getMenuDetail(id: number) {
  return get<{ code: number; message: string; data: Menu }>(`/api/menu/${id}`)
}

/** 新增菜单 */
export function createMenu(data: MenuForm) {
  return post<{ code: number; message: string }>('/api/menu', data)
}

/** 修改菜单 */
export function updateMenu(id: number, data: MenuForm) {
  return put<{ code: number; message: string }>(`/api/menu/${id}`, data)
}

/** 删除菜单 */
export function deleteMenu(id: number) {
  return del<{ code: number; message: string }>(`/api/menu/${id}`)
}

/** 获取菜单列表（alias，permission store 使用） */
export const getMenus = getMenuList

