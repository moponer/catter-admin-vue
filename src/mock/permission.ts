import { MockMethod, Recordable } from 'vite-plugin-mock'

const permissionMock: MockMethod[] = [
  {
    url: '/api/permissions/tree',
    method: 'get',
    response: () => ({
      code: 0, message: 'success',
      data: [
        {
          id: 1, name: '系统管理', code: 'system', type: 'menu', parentId: 0, path: '/system', icon: 'Setting', sort: 1, status: 1, createTime: '2025-01-01 00:00:00',
          children: [
            { id: 2, name: '用户管理', code: 'system:user', type: 'menu', parentId: 1, path: '/system/user', icon: 'User', sort: 1, status: 1, createTime: '2025-01-01 00:00:00',
              children: [
                { id: 10, name: '用户新增', code: 'system:user:add', type: 'button', parentId: 2, sort: 1, status: 1, createTime: '2025-01-01 00:00:00', children: [] },
                { id: 11, name: '用户编辑', code: 'system:user:edit', type: 'button', parentId: 2, sort: 2, status: 1, createTime: '2025-01-01 00:00:00', children: [] },
                { id: 12, name: '用户删除', code: 'system:user:del', type: 'button', parentId: 2, sort: 3, status: 1, createTime: '2025-01-01 00:00:00', children: [] },
              ],
            },
            { id: 3, name: '角色管理', code: 'system:role', type: 'menu', parentId: 1, path: '/system/role', icon: 'UserFilled', sort: 2, status: 1, createTime: '2025-01-01 00:00:00',
              children: [
                { id: 20, name: '角色新增', code: 'system:role:add', type: 'button', parentId: 3, sort: 1, status: 1, createTime: '2025-01-01 00:00:00', children: [] },
                { id: 21, name: '角色编辑', code: 'system:role:edit', type: 'button', parentId: 3, sort: 2, status: 1, createTime: '2025-01-01 00:00:00', children: [] },
              ],
            },
            { id: 4, name: '部门管理', code: 'system:dept', type: 'menu', parentId: 1, path: '/system/dept', icon: 'OfficeBuilding', sort: 3, status: 1, createTime: '2025-01-01 00:00:00', children: [] },
            { id: 5, name: '字典管理', code: 'system:dict', type: 'menu', parentId: 1, path: '/system/dict', icon: 'Collection', sort: 4, status: 1, createTime: '2025-01-01 00:00:00', children: [] },
          ],
        },
        {
          id: 6, name: '监控管理', code: 'monitor', type: 'menu', parentId: 0, path: '/monitor', icon: 'Monitor', sort: 2, status: 1, createTime: '2025-01-01 00:00:00',
          children: [
            { id: 7, name: '登录日志', code: 'monitor:login-log', type: 'menu', parentId: 6, path: '/monitor/login-log', icon: 'Document', sort: 1, status: 1, createTime: '2025-01-01 00:00:00', children: [] },
            { id: 8, name: '操作日志', code: 'monitor:operate-log', type: 'menu', parentId: 6, path: '/monitor/operate-log', icon: 'Tickets', sort: 2, status: 1, createTime: '2025-01-01 00:00:00', children: [] },
          ],
        },
      ],
    }),
  },
  {
    url: '/api/permissions/:id',
    method: 'get',
    response: (opt: { query: Recordable }) => ({
      code: 0,
      message: 'success',
      data: {
        id: Number(opt.query?.id) || 1,
        name: '系统管理',
        code: 'system',
        type: 'menu',
        parentId: 0,
        path: '/system',
        icon: 'Setting',
        sort: 1,
        status: 1,
        createTime: '2025-01-01 00:00:00',
      },
    }),
  },
  {
    url: '/api/permissions',
    method: 'post',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
  {
    url: '/api/permissions/:id',
    method: 'put',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
  {
    url: '/api/permissions/:id',
    method: 'delete',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
]

export default permissionMock
