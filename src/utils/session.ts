/**
 * 会话清理工具
 *
 * 登出 / 认证失效时统一清理：token、用户信息、菜单与权限、标签页、动态路由。
 * 避免切换账号后仍然保留上一个账号的菜单与路由（越权访问）。
 */
import { resetRouter } from '@/router'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
import { useAppStore } from '@/store/modules/app'

/** 清空当前登录态（不负责跳转） */
export function resetSession(): void {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const appStore = useAppStore()

  userStore.logout()
  // 菜单 / 权限 / 角色缓存必须一并清空，否则重新登录后仍会复用上一位用户的动态路由
  permissionStore.resetPermission()
  appStore.clearVisitedViews()
  resetRouter()
}
