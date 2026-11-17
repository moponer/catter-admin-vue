import { MockMethod, Recordable } from 'vite-plugin-mock'
import Mock from 'mockjs'

const fileMock: MockMethod[] = [
  {
    url: '/api/files',
    method: 'get',
    response: (opt: { query: Recordable }) => {
      const { page = 1, pageSize = 10 } = opt.query as Record<string, string>
      const data = Mock.mock({
        [`list|${pageSize}`]: [{
          'id|+1': (Number(page) - 1) * Number(pageSize) + 1,
          name: '@pick(["report.pdf", "avatar.png", "data.xlsx", "logo.svg", "photo.jpg", "doc.docx"])',
          url: '@image("200x200")',
          'size|1024-10485760': 1,
          'type|1': ['image', 'document', 'video', 'audio', 'archive'],
          mimeType: '@pick(["image/png", "application/pdf", "application/vnd.ms-excel"])',
          'storageType|1': ['local', 'oss'],
          createTime: '@datetime',
        }],
      })
      return { code: 0, message: 'success', data: { ...data, total: 120 } }
    },
  },
  // 静态路由必须先于 :id，否则 /api/files/batch 会匹配到 id = 'batch'
  {
    url: '/api/files/batch',
    method: 'delete',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
  {
    url: '/api/files/:id',
    method: 'delete',
    response: () => ({ code: 0, message: 'success', data: null }),
  },
  {
    url: '/api/upload',
    method: 'post',
    response: () => ({
      code: 0, message: 'success',
      data: { url: Mock.Random.image('200x200') },
    }),
  },
]

export default fileMock
