/**
 * 仪表盘数据 API
 */
import { get } from '@/utils/request'

export interface DashboardStats {
  users: number
  orders: number
  sales: number
  visits: number
  userGrowth: number
  orderGrowth: number
  salesGrowth: number
  visitGrowth: number
}

export interface ChartData {
  dates: string[]
  values: number[]
}

export interface RecentActivity {
  id: number
  content: string
  time: string
  type: 'success' | 'warning' | 'info' | 'danger'
}

export function getDashboardStats() {
  return get<{ code: number; message: string; data: DashboardStats }>('/api/dashboard/stats')
}

export function getChartData(type: string) {
  return get<{ code: number; message: string; data: ChartData }>('/api/dashboard/chart', { type })
}

export function getRecentActivities() {
  return get<{ code: number; message: string; data: RecentActivity[] }>('/api/dashboard/activities')
}
