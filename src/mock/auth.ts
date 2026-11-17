import { MockMethod, Recordable } from 'vite-plugin-mock'

const authMock: MockMethod[] = [
  // 登录
  {
    url: '/api/auth/login',
    method: 'post',
    response: (opt: { body: Recordable }) => {
      const { username, password } = opt.body as { username: string; password: string }
      if (username === 'admin' && password === '123456') {
        return {
          code: 0,
          message: '登录成功',
          data: {
            token: 'mock_token_' + Date.now(),
            expiresIn: 86400,
          },
        }
      }
      return {
        code: 401,
        message: '用户名或密码错误',
        data: null,
      }
    },
  },
  // 获取用户信息
  {
    url: '/api/auth/user',
    method: 'get',
    response: () => {
      return {
        code: 0,
        message: 'success',
        data: {
          id: 1,
          username: 'admin',
          nickname: '管理员',
          avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          email: 'admin@example.com',
          phone: '13800138000',
          roles: ['admin', 'editor'],
          permissions: ['*'],
        },
      }
    },
  },
  // 登出
  {
    url: '/api/auth/logout',
    method: 'post',
    response: () => {
      return {
        code: 0,
        message: '登出成功',
        data: null,
      }
    },
  },
]

export default authMock
