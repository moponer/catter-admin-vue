import { MockMethod, Recordable } from 'vite-plugin-mock'

const roleMock: MockMethod[] = [
  {
    url: '/api/role/list',
    method: 'get',
    response: (opt: { query: Recordable }) => {
      const { page = 1, pageSize = 10, keyword = '' } = opt.query as Record<string, string>
      const allData = [
        { id: 1, name: '超级管理员', code: 'admin', description: '拥有系统所有权限', status: 1, createTime: '2024-01-01 00:00:00' },
        { id: 2, name: '编辑', code: 'editor', description: '可以编辑内容和管理媒体', status: 1, createTime: '2024-01-02 10:00:00' },
        { id: 3, name: '访客', code: 'viewer', description: '只读访问权限', status: 0, createTime: '2024-03-15 10:30:00' },
      ]
      const filtered = keyword
        ? allData.filter((r) => r.name.includes(keyword) || r.code.includes(keyword))
        : allData
      const start = (Number(page) - 1) * Number(pageSize)
      const list = filtered.slice(start, start + Number(pageSize))
      return {
        code: 0,
        message: 'success',
        data: { list, total: filtered.length },
      }
    },
  },
  {
    url: '/api/role/:id',
    method: 'get',
    response: (opt: { query: Recordable }) => ({
      code: 0,
      message: 'success',
      data: { id: opt.query.id, name: '编辑', code: 'editor', description: '可以编辑内容和管理媒体', status: 1, createTime: '2024-01-02 10:00:00' },
    }),
  },
  {
    url: '/api/role',
    method: 'post',
    response: () => ({
      code: 0,
      message: 'success',
    }),
  },
  {
    url: '/api/role/:id',
    method: 'put',
    response: () => ({
      code: 0,
      message: 'success',
    }),
  },
  {
    url: '/api/role/:id',
    method: 'delete',
    response: () => ({
      code: 0,
      message: 'success',
    }),
  },
]

export default roleMock
