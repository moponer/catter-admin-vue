import { MockMethod, Recordable } from 'vite-plugin-mock'
import Mock from 'mockjs'

const userMock: MockMethod[] = [
  // 获取用户列表
  {
    url: '/api/users',
    method: 'get',
    response: (opt: { query: Recordable }) => {
      const { page = 1, pageSize = 10 } = opt.query as Record<string, string>

      const data = Mock.mock({
        [`list|${pageSize}`]: [
          {
            'id|+1': (Number(page) - 1) * Number(pageSize) + 1,
            username: '@word(5,10)',
            nickname: '@cname',
            'email': '@email',
            'phone': /^1[3-9]\d{9}$/,
            'status|1': [0, 1],
            avatar: '',
            'roles|1': [['admin'], ['editor'], ['viewer']],
            createTime: '@datetime',
          },
        ],
      })

      return {
        code: 0,
        message: 'success',
        data: {
          list: data.list,
          total: 100,
        },
      }
    },
  },
  // 获取单个用户
  {
    url: '/api/users/:id',
    method: 'get',
    response: (opt: { query: Recordable }) => {
      const { id } = opt.query as { id: string }
      return {
        code: 0,
        message: 'success',
        data: {
          id: parseInt(id),
          username: 'user' + id,
          nickname: '用户' + id,
          email: 'user' + id + '@example.com',
          phone: '13800138000',
          status: 1,
          avatar: '',
          roles: ['editor'],
          createTime: '2024-01-01 00:00:00',
        },
      }
    },
  },
  // 创建用户
  {
    url: '/api/users',
    method: 'post',
    response: () => {
      return {
        code: 0,
        message: '创建成功',
        data: null,
      }
    },
  },
  // 更新用户
  {
    url: '/api/users/:id',
    method: 'put',
    response: () => {
      return {
        code: 0,
        message: '更新成功',
        data: null,
      }
    },
  },
  // 批量删除（静态路由必须写在 :id 之前，否则会被 id = 'batch' 匹配）
  {
    url: '/api/users/batch',
    method: 'delete',
    response: () => {
      return {
        code: 0,
        message: '批量删除成功',
        data: null,
      }
    },
  },
  // 删除用户
  {
    url: '/api/users/:id',
    method: 'delete',
    response: () => {
      return {
        code: 0,
        message: '删除成功',
        data: null,
      }
    },
  },
]

export default userMock
