import { MockMethod, Recordable } from 'vite-plugin-mock'

const deptMock: MockMethod[] = [
  {
    url: '/api/depts/tree',
    method: 'get',
    response: () => ({
      code: 0,
      message: 'success',
      data: [
        {
          id: 1, name: '总公司', parentId: 0, sort: 1, leader: '张三', phone: '13800138000', email: 'zhangsan@company.com', status: 1, createTime: '2025-01-01 00:00:00',
          children: [
            { id: 2, name: '研发部', parentId: 1, sort: 1, leader: '李四', phone: '13800138001', email: 'lisi@company.com', status: 1, createTime: '2025-01-01 00:00:00',
              children: [
                { id: 5, name: '前端组', parentId: 2, sort: 1, leader: '王五', phone: '', email: '', status: 1, createTime: '2025-01-01 00:00:00', children: [] },
                { id: 6, name: '后端组', parentId: 2, sort: 2, leader: '赵六', phone: '', email: '', status: 1, createTime: '2025-01-01 00:00:00', children: [] },
              ],
            },
            { id: 3, name: '市场部', parentId: 1, sort: 2, leader: '钱七', phone: '13800138002', email: 'qianqi@company.com', status: 1, createTime: '2025-01-01 00:00:00', children: [] },
            { id: 4, name: '财务部', parentId: 1, sort: 3, leader: '孙八', phone: '13800138003', email: 'sunba@company.com', status: 0, createTime: '2025-01-01 00:00:00', children: [] },
          ],
        },
      ],
    }),
  },
  {
    url: '/api/depts/:id',
    method: 'get',
    response: (opt: { query: Recordable }) => ({
      code: 0,
      message: 'success',
      data: {
        id: Number(opt.query?.id) || 1,
        name: '研发部',
        parentId: 1,
        sort: 1,
        leader: '李四',
        phone: '13800138001',
        email: 'lisi@company.com',
        status: 1,
        createTime: '2025-01-01 00:00:00',
      },
    }),
  },
  {
    url: '/api/depts',
    method: 'post',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
  {
    url: '/api/depts/:id',
    method: 'put',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
  {
    url: '/api/depts/:id',
    method: 'delete',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
]

export default deptMock
