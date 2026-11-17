import { computed } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'

/**
 * 权限判断 composable
 *
 * 用法：
 *   const { hasPermission, hasRole } = usePermission()
 *   const canDelete = hasPermission('system:user:delete')
 *   <el-button v-if="canDelete">删除</el-button>
 *
 * 约定：权限码为 '*' 表示超级权限（后端返回通配符），此时所有权限判定通过。
 */
export function usePermission() {
  const permissionStore = usePermissionStore()

  /** 判断是否拥有指定权限码 */
  function hasPermission(code: string): boolean {
    const permissions = permissionStore.permissions
    return permissions.includes('*') || permissions.includes(code)
  }

  /** 判断是否拥有任意一个权限码 */
  function hasAnyPermission(codes: string[]): boolean {
    if (!codes.length) return false
    const permissions = permissionStore.permissions
    if (permissions.includes('*')) return true
    return codes.some((code) => permissions.includes(code))
  }

  /** 判断是否拥有所有权限码 */
  function hasAllPermissions(codes: string[]): boolean {
    const permissions = permissionStore.permissions
    if (permissions.includes('*')) return true
    return codes.every((code) => permissions.includes(code))
  }

  /** 判断是否拥有指定角色 */
  function hasRole(roleKey: string): boolean {
    return permissionStore.roles.includes(roleKey)
  }

  /** 是否为管理员（拥有 admin 角色或通配权限） */
  const isAdmin = computed(
    () => permissionStore.roles.includes('admin') || permissionStore.permissions.includes('*')
  )

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAdmin,
  }
}
