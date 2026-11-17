/**
 * Mock 数据入口
 */
import { MockMethod } from 'vite-plugin-mock'
import authMock from './auth'
import menuMock from './menu'
import userMock from './user'
import dashboardMock from './dashboard'
import deptMock from './dept'
import dictMock from './dict'
import logMock from './log'
import fileMock from './file'
import permissionMock from './permission'
import roleMock from './role'

const mocks: MockMethod[] = [
  ...authMock,
  ...menuMock,
  ...userMock,
  ...dashboardMock,
  ...deptMock,
  ...dictMock,
  ...logMock,
  ...fileMock,
  ...permissionMock,
  ...roleMock,
]

export default mocks
