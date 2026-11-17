import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import i18n from '@/locales'

const { t: $t } = i18n.global

// 配置 NProgress
NProgress.configure({ showSpinner: false })

// 静态路由（不需要权限）
const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: $t('login.submit'),
      hidden: true,
    },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '404',
      hidden: true,
    },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '403',
      hidden: true,
    },
  },
  {
    path: '/500',
    name: 'ServerError',
    component: () => import('@/views/error/500.vue'),
    meta: {
      title: '500',
      hidden: true,
    },
  },
]

// 创建 router 实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
})

// 白名单（无需登录即可访问）
const whiteList = ['/login', '/404', '/403', '/500']

/** 兜底 404 路由名（重复添加会导致路由表膨胀） */
const NOT_FOUND_ROUTE_NAME = 'NotFoundCatchAll'

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  // 开始进度条
  NProgress.start()

  const userStore = (await import('@/store/modules/user')).useUserStore()
  const permissionStore = (await import('@/store/modules/permission')).usePermissionStore()

  const token = userStore.token

  if (!token) {
    // 未登录
    if (whiteList.includes(to.path)) {
      next()
    } else {
      NProgress.done()
      next({ path: '/login', query: { redirect: to.fullPath } })
    }
    return
  }

  // 已登录时不允许再停留在登录页
  if (to.path === '/login') {
    NProgress.done()
    next({ path: '/' })
    return
  }

  // 已初始化过动态路由，直接放行
  if (permissionStore.isLoaded) {
    next()
    return
  }

  try {
    // 1. 拉取用户信息（角色 / 权限码）。刷新页面后 store 已丢失，必须重新获取
    if (!userStore.userInfo) {
      await userStore.getUserInfoAction()
    }

    // 2. 拉取菜单，生成动态路由
    await permissionStore.generateMenus()

    // 3. 以用户信息中的角色 / 权限为准（菜单里的 permission 只是补充）
    permissionStore.setRoles(userStore.roles)
    if (userStore.permissions.length) {
      permissionStore.setPermissions(userStore.permissions)
    }

    generateDynamicRoutes(permissionStore.menus).forEach((route) => {
      router.addRoute(route)
    })

    // 兜底 404（只添加一次）
    if (!router.hasRoute(NOT_FOUND_ROUTE_NAME)) {
      router.addRoute({
        path: '/:pathMatch(.*)*',
        name: NOT_FOUND_ROUTE_NAME,
        redirect: '/404',
      })
    }

    // 确保路由已添加，重新导航
    next({ ...to, replace: true })
  } catch (error) {
    console.error('Failed to bootstrap session:', error)
    NProgress.done()

    // token 已被认证失败逻辑清理 → 回登录页；否则（例如菜单接口 500 / 网络异常）
    // 保留登录态，落到错误页，用户可以刷新重试，而不是被迫重新登录。
    if (!userStore.token) {
      next({ path: '/login', query: { redirect: to.fullPath } })
    } else {
      next('/500')
    }
  }
})

router.afterEach((to) => {
  // 设置页面标题
  const title = to.meta.title as string
  document.title = title ? `${title} - Catter Admin` : 'Catter Admin'

  NProgress.done()
})

/**
 * 布局组件（所有需要侧边栏+顶部的页面共用）
 */
const Layout = () => import('@/components/layout/AppLayout.vue')

/**
 * 根据菜单配置生成动态路由
 *
 * 策略：
 * - 所有菜单都作为 Layout 的 children 添加到同一个 / 路由下
 * - 这样 Sidebar 和 Header 在任何页面都显示
 * - 无子菜单的一级菜单（如 Dashboard）也放在 Layout 的 children 中
 */
function generateDynamicRoutes(menus: any[]): RouteRecordRaw[] {
  // 收集所有叶子节点（最终页面）
  const allChildren: any[] = []

  for (const menu of menus) {
    if (menu.children && menu.children.length > 0) {
      // 有子菜单：展开 children
      for (const child of menu.children) {
        allChildren.push({
          ...child,
          _parentPath: menu.path,
          _parentTitle: menu.title,
          _parentIcon: menu.icon,
        })
      }
    } else {
      // 无子菜单：自身就是叶子节点
      allChildren.push({
        ...menu,
        _parentPath: '',
        _parentTitle: '',
        _parentIcon: '',
      })
    }
  }

  // 构建子路由数组
  // 路由名统一加 menu_ 前缀并做去重：
  // 后端菜单数据是外部输入，若与静态路由（Login/NotFound/Layout）重名，
  // router.addRoute 会把静态路由替换掉。
  const usedNames = new Set<string>()

  const routeChildren: RouteRecordRaw[] = allChildren
    .filter((item: any) => typeof item.path === 'string' && item.path.startsWith('/'))
    .map((item: any) => ({
      path: item.path.replace(/^\//, ''),
      name: item.name ? `menu_${item.name}` : undefined,
      component: getComponent(item.component),
      meta: {
        title: item.title,
        icon: item.icon,
        hidden: item.hidden,
        keepAlive: item.keepAlive,
        breadcrumb: [
          { path: '/', title: $t('menu.dashboard') },
          ...(item._parentTitle ? [{ path: item._parentPath, title: item._parentTitle }] : []),
          { path: item.path, title: item.title },
        ],
      },
    }))
    .filter((route: any) => {
      const name = route.name as string | undefined
      if (!name) return true
      if (usedNames.has(name)) {
        console.warn(`[router] Duplicated menu route name "${name}" ignored.`)
        return false
      }
      usedNames.add(name)
      return true
    }) as RouteRecordRaw[]

  // 标签页「刷新」跳转用的中转路由（TagsView 依赖它）
  routeChildren.push({
    path: 'redirect/:path(.*)',
    name: 'Redirect',
    component: () => import('@/views/redirect/index.vue'),
    meta: { hidden: true, title: '' },
  })

  const layoutRoute: RouteRecordRaw = {
    path: '/',
    name: 'Layout',
    component: Layout,
    redirect: '/dashboard',
    meta: {
      hidden: true,
    },
    children: routeChildren,
  }

  return [layoutRoute]
}

// 组件映射（显式声明，避免动态 import 拼路径导致构建产物不可控）
const componentMap: Record<string, () => Promise<any>> = {
  'dashboard/index': () => import('@/views/dashboard/index.vue'),
  'system/user/index': () => import('@/views/system/user/index.vue'),
  'system/role/index': () => import('@/views/system/role/index.vue'),
  'system/menu/index': () => import('@/views/system/menu/index.vue'),
  'system/dept/index': () => import('@/views/system/dept/index.vue'),
  'system/dict/index': () => import('@/views/system/dict/index.vue'),
  'system/file/index': () => import('@/views/system/file/index.vue'),
  'system/permission/index': () => import('@/views/system/permission/index.vue'),
  'monitor/login-log/index': () => import('@/views/monitor/login-log/index.vue'),
  'monitor/operate-log/index': () => import('@/views/monitor/operate-log/index.vue'),
  'components/table/index': () => import('@/views/components/table/index.vue'),
  'components/form/index': () => import('@/views/components/form/index.vue'),
  'components/charts/index': () => import('@/views/components/charts/index.vue'),
  'profile/index': () => import('@/views/profile/index.vue'),
  'profile/settings': () => import('@/views/profile/settings.vue'),
}

function getComponent(component?: string): (() => Promise<any>) | undefined {
  if (!component) return undefined

  const loader = componentMap[component]
  if (loader) return loader

  // 未登记的组件不再拼接动态路径（避免加载任意模块），统一落到 404，便于发现后端菜单配置错误
  console.warn(`[router] Unknown component "${component}", falling back to 404 page.`)
  return () => import('@/views/error/404.vue')
}

export default router

export function resetRouter() {
  if (router.hasRoute('Layout')) {
    router.removeRoute('Layout')
  }
  if (router.hasRoute(NOT_FOUND_ROUTE_NAME)) {
    router.removeRoute(NOT_FOUND_ROUTE_NAME)
  }
}
