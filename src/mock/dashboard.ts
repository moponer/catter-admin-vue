import { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

const dashboardMock: MockMethod[] = [
  // 获取统计数据
  {
    url: '/api/dashboard/stats',
    method: 'get',
    response: () => {
      return {
        code: 0,
        message: 'success',
        data: {
          users: Mock.Random.integer(1000, 9999),
          orders: Mock.Random.integer(500, 5000),
          sales: Mock.Random.integer(10000, 99999),
          visits: Mock.Random.integer(10000, 99999),
          userGrowth: Mock.Random.integer(-20, 50),
          orderGrowth: Mock.Random.integer(-20, 50),
          salesGrowth: Mock.Random.integer(-20, 50),
          visitGrowth: Mock.Random.integer(-20, 50),
        },
      }
    },
  },
  // 获取图表数据
  {
    url: '/api/dashboard/chart',
    method: 'get',
    response: () => {
      const dates: string[] = []
      const values: number[] = []
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        dates.push(date.toISOString().split('T')[0])
        values.push(Mock.Random.integer(100, 1000))
      }

      return {
        code: 0,
        message: 'success',
        data: { dates, values },
      }
    },
  },
  // 获取最近活动
  {
    url: '/api/dashboard/activities',
    method: 'get',
    response: () => {
      const activities = [
        { content: '用户 admin 登录系统', type: 'info' },
        { content: '新订单 #12345 已创建', type: 'success' },
        { content: '用户 user123 修改了密码', type: 'warning' },
        { content: '系统检测到异常登录', type: 'danger' },
        { content: '数据库备份完成', type: 'success' },
        { content: '新用户注册: user456', type: 'info' },
      ]

      return {
        code: 0,
        message: 'success',
        data: activities.map((item, index) => ({
          id: index + 1,
          ...item,
          time: Mock.Random.datetime(),
        })),
      }
    },
  },
]

export default dashboardMock
