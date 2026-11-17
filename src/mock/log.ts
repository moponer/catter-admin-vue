import { MockMethod, Recordable } from 'vite-plugin-mock'
import Mock from 'mockjs'

const logMock: MockMethod[] = [
  {
    url: '/api/logs/login',
    method: 'get',
    response: (opt: { query: Recordable }) => {
      const { page = 1, pageSize = 10 } = opt.query as Record<string, string>
      const data = Mock.mock({
        [`list|${pageSize}`]: [{
          'id|+1': (Number(page) - 1) * Number(pageSize) + 1,
          username: '@word(4,8)',
          ip: '@ip',
          location: '@city(true)',
          browser: '@pick(["Chrome 120", "Firefox 121", "Safari 17", "Edge 120"])',
          os: '@pick(["Windows 11", "macOS 14", "Ubuntu 22", "iOS 17"])',
          'status|1': [0, 1],
          message: '@pick(["登录成功", "密码错误", "账号锁定"])',
          loginTime: '@datetime',
        }],
      })
      return { code: 0, message: 'success', data: { ...data, total: 200 } }
    },
  },
  {
    url: '/api/logs/operate',
    method: 'get',
    response: (opt: { query: Recordable }) => {
      const { page = 1, pageSize = 10 } = opt.query as Record<string, string>
      const data = Mock.mock({
        [`list|${pageSize}`]: [{
          'id|+1': (Number(page) - 1) * Number(pageSize) + 1,
          username: '@word(4,8)',
          module: '@pick(["用户管理", "角色管理", "部门管理", "字典管理", "文件管理"])',
          action: '@pick(["新增", "修改", "删除", "导出", "导入"])',
          method: '@pick(["POST", "PUT", "DELETE"])',
          params: '{}',
          ip: '@ip',
          location: '@city(true)',
          'status|1': [0, 1],
          errorMsg: '',
          'duration|1-500': 1,
          operateTime: '@datetime',
        }],
      })
      return { code: 0, message: 'success', data: { ...data, total: 350 } }
    },
  },
  {
    url: '/api/logs/operate/:id',
    method: 'get',
    response: () => ({
      code: 0, message: 'success',
      data: {
        id: 1, username: 'admin', module: '用户管理', action: '新增',
        method: 'POST', params: '{"username":"test"}', ip: '127.0.0.1',
        location: '本地', status: 1, duration: 45, operateTime: '2025-01-15 10:30:00',
      },
    }),
  },
  // 注意顺序：静态路由必须写在 :id 之前，否则 /clean 会被当成 id = 'clean'
  {
    url: '/api/logs/login/clean',
    method: 'delete',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
  {
    url: '/api/logs/login/:id',
    method: 'delete',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
  {
    url: '/api/logs/operate/clean',
    method: 'delete',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
  {
    url: '/api/logs/operate/:id',
    method: 'delete',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
]

export default logMock
