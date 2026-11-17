import { MockMethod } from 'vite-plugin-mock'

// 完整菜单数据（用于侧边栏 /api/menus 和菜单管理 /api/menu/list）
const menuData = [
  {
    id: 1, name: 'Dashboard', title: '首页', path: '/dashboard', component: 'dashboard/index', icon: 'Odometer', sort: 1, hidden: false, parentId: 0, children: [],
  },
  {
    id: 2, name: 'System', title: '系统管理', path: '/system', component: '', icon: 'Setting', sort: 2, hidden: false, parentId: 0,
    children: [
      { id: 21, name: 'User', title: '用户管理', path: '/system/user', component: 'system/user/index', icon: 'User', sort: 1, hidden: false, parentId: 2 },
      { id: 22, name: 'Role', title: '角色管理', path: '/system/role', component: 'system/role/index', icon: 'UserFilled', sort: 2, hidden: false, parentId: 2 },
      { id: 23, name: 'Menu', title: '菜单管理', path: '/system/menu', component: 'system/menu/index', icon: 'Menu', sort: 3, hidden: false, parentId: 2 },
      { id: 24, name: 'Dept', title: '部门管理', path: '/system/dept', component: 'system/dept/index', icon: 'OfficeBuilding', sort: 4, hidden: false, parentId: 2 },
      { id: 25, name: 'Dict', title: '字典管理', path: '/system/dict', component: 'system/dict/index', icon: 'Collection', sort: 5, hidden: false, parentId: 2 },
      { id: 26, name: 'Permission', title: '权限管理', path: '/system/permission', component: 'system/permission/index', icon: 'Lock', sort: 6, hidden: false, parentId: 2 },
      { id: 27, name: 'File', title: '文件管理', path: '/system/file', component: 'system/file/index', icon: 'FolderOpened', sort: 7, hidden: false, parentId: 2 },
    ],
  },
  {
    id: 5, name: 'Monitor', title: '系统监控', path: '/monitor', component: '', icon: 'Monitor', sort: 3, hidden: false, parentId: 0,
    children: [
      { id: 51, name: 'LoginLog', title: '登录日志', path: '/monitor/login-log', component: 'monitor/login-log/index', icon: 'Document', sort: 1, hidden: false, parentId: 5 },
      { id: 52, name: 'OperateLog', title: '操作日志', path: '/monitor/operate-log', component: 'monitor/operate-log/index', icon: 'Tickets', sort: 2, hidden: false, parentId: 5 },
    ],
  },
  {
    id: 3, name: 'Components', title: '组件示例', path: '/components', component: '', icon: 'Grid', sort: 4, hidden: false, parentId: 0,
    children: [
      { id: 31, name: 'Table', title: '表格示例', path: '/components/table', component: 'components/table/index', icon: 'Grid', sort: 1, hidden: false, parentId: 3 },
      { id: 32, name: 'Form', title: '表单示例', path: '/components/form', component: 'components/form/index', icon: 'Document', sort: 2, hidden: false, parentId: 3 },
      { id: 33, name: 'Charts', title: '图表示例', path: '/components/charts', component: 'components/charts/index', icon: 'TrendCharts', sort: 3, hidden: false, parentId: 3 },
    ],
  },
  {
    id: 4, name: 'Profile', title: '个人中心', path: '/profile', component: '', icon: 'User', sort: 5, hidden: false, parentId: 0,
    children: [
      { id: 41, name: 'ProfileIndex', title: '我的资料', path: '/profile/index', component: 'profile/index', icon: 'User', sort: 1, hidden: false, parentId: 4 },
      { id: 42, name: 'Settings', title: '账号设置', path: '/profile/settings', component: 'profile/settings', icon: 'Setting', sort: 2, hidden: false, parentId: 4 },
    ],
  },
]

const menuMock: MockMethod[] = [
  {
    url: '/api/menus',
    method: 'get',
    response: () => ({ code: 0, message: 'success', data: menuData }),
  },
  {
    url: '/api/menu/list',
    method: 'get',
    response: () => ({ code: 0, message: 'success', data: menuData }),
  },
  {
    url: '/api/menu/:id',
    method: 'get',
    response: () => ({ code: 0, message: 'success', data: menuData[0] }),
  },
  {
    url: '/api/menu',
    method: 'post',
    response: () => ({ code: 0, message: 'success' }),
  },
  {
    url: '/api/menu/:id',
    method: 'put',
    response: () => ({ code: 0, message: 'success' }),
  },
  {
    url: '/api/menu/:id',
    method: 'delete',
    response: () => ({ code: 0, message: 'success' }),
  },
]

export default menuMock
