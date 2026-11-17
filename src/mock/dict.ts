import { MockMethod, Recordable } from 'vite-plugin-mock'
import Mock from 'mockjs'

const dictMock: MockMethod[] = [
  {
    url: '/api/dict/types',
    method: 'get',
    response: (opt: { query: Recordable }) => {
      const { page = 1, pageSize = 10 } = opt.query as Record<string, string>
      const data = Mock.mock({
        [`list|${pageSize}`]: [{
          'id|+1': (Number(page) - 1) * Number(pageSize) + 1,
          name: '@ctitle(2,6)',
          code: '@word(3,8)',
          'status|1': [0, 1],
          remark: '@cparagraph(1)',
          createTime: '@datetime',
        }],
      })
      return { code: 0, message: 'success', data: { ...data, total: 56 } }
    },
  },
  {
    url: '/api/dict/code/sys_status',
    method: 'get',
    response: () => ({
      code: 0, message: 'success',
      data: [
        { id: 1, typeId: 1, label: '启用', value: '1', sort: 1, status: 1 },
        { id: 2, typeId: 1, label: '禁用', value: '0', sort: 2, status: 1 },
      ],
    }),
  },
  {
    url: '/api/dict/types/:typeId/data',
    method: 'get',
    response: () => ({
      code: 0, message: 'success',
      data: Mock.mock({
        'list|5-15': [{
          'id|+1': 1,
          typeId: 1,
          label: '@ctitle(2,4)',
          value: '@word(3,8)',
          'sort|+1': 1,
          'status|1': [0, 1],
          remark: '',
          createTime: '@datetime',
        }],
      }).list,
    }),
  },
  {
    url: '/api/dict/types',
    method: 'post',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
  {
    url: '/api/dict/types/:id',
    method: 'put',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
  {
    url: '/api/dict/types/:id',
    method: 'delete',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
  {
    url: '/api/dict/data',
    method: 'post',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
  {
    url: '/api/dict/data/:id',
    method: 'put',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
  {
    url: '/api/dict/data/:id',
    method: 'delete',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
]

export default dictMock
