import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMenus, type Menu } from '@/api/menu'

export const usePermissionStore = defineStore('permission', () => {
  // State
  const menus = ref<Menu[]>([])
  const isLoaded = ref(false)
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])

  // Actions
  const setMenus = (menuList: Menu[]) => {
    menus.value = menuList
  }

  const setPermissions = (perms: string[]) => {
    permissions.value = perms
  }

  const setRoles = (roleList: string[]) => {
    roles.value = roleList
  }

  const generateMenus = async () => {
    if (isLoaded.value) return

    try {
      const res = await getMenus()
      menus.value = res.data
      isLoaded.value = true

      // 从菜单数据中提取权限码（如果后端返回了 permission 字段）
      const perms: string[] = []
      extractPermissions(menus.value, perms)
      if (perms.length) {
        permissions.value = perms
      }
    } catch (error) {
      // 不能吞掉异常：否则路由守卫会以为初始化成功，
      // 结果是「空侧边栏 + 无任何路由」的空白布局。交给守卫决定跳转。
      console.error('Failed to load menus:', error)
      menus.value = []
      isLoaded.value = false
      throw error
    }
  }

  /** 递归提取菜单中的权限码 */
  function extractPermissions(menuList: Menu[], result: string[]) {
    for (const menu of menuList) {
      if (menu.permission) {
        result.push(menu.permission)
      }
      if (menu.children?.length) {
        extractPermissions(menu.children, result)
      }
    }
  }

  const resetPermission = () => {
    menus.value = []
    permissions.value = []
    roles.value = []
    isLoaded.value = false
  }

  return {
    menus,
    isLoaded,
    permissions,
    roles,
    setMenus,
    setPermissions,
    setRoles,
    generateMenus,
    resetPermission,
  }
})
