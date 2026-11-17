<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-cards">
      <el-col v-for="(stat, index) in stats" :key="index" :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">{{ $t(stat.label) }}</div>
              <div class="stat-value">{{ stat.value.toLocaleString() }}</div>
              <div class="stat-growth" :class="stat.growth >= 0 ? 'up' : 'down'">
                <el-icon v-if="stat.growth >= 0"><Top /></el-icon>
                <el-icon v-else><Bottom /></el-icon>
                <span>{{ Math.abs(stat.growth) }}%</span>
                <span>{{ $t('dashboard.compareLastWeek') }}</span>
              </div>
            </div>
            <div class="stat-icon" :style="{ backgroundColor: stat.color + '18' }">
              <el-icon :size="28" :style="{ color: stat.color }">
                <component :is="stat.icon" />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 内容区：项目信息 + 最近活动 -->
    <el-row :gutter="16" class="content-row">
      <!-- 项目信息卡片 -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="badge-card">
          <div class="project-header">
            <div class="project-title">
              <el-icon class="project-icon"><Grid /></el-icon>
              <span>Catter Admin Vue</span>
            </div>
            <p class="project-desc">{{ $t('dashboard.projectDesc') }}</p>
            <!-- CSS 徽章（shields.io 被墙，改用纯 CSS） -->
            <div class="badge-row">
              <span class="css-badge" style="background:#42b883;color:#fff">Vue 3.4</span>
              <span class="css-badge" style="background:#3178c6;color:#fff">TypeScript 5.3</span>
              <span class="css-badge" style="background:#646cff;color:#fff">Vite 5</span>
            </div>
            <div class="badge-row">
              <span class="css-badge" style="background:#409eff;color:#fff">Element Plus 2.4</span>
              <span class="css-badge" style="background:#2c2c2c;color:#fff">Pinia 2</span>
              <span class="css-badge" style="background:#10b981;color:#fff">MIT</span>
            </div>
          </div>
          <el-divider />
          <div class="feature-list">
            <div class="feature-item" v-for="f in features" :key="f.key">
              <span class="feature-icon">{{ f.emoji }}</span>
              <span class="feature-text">{{ $t('dashboard.feature.' + f.key) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 最近活动 -->
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" class="activity-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('dashboard.recentActivity') }}</span>
              <el-button link type="primary" size="small" @click="loadActivities">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="activity-list">
            <div
              v-for="activity in activities"
              :key="activity.id"
              class="activity-item"
            >
              <el-tag
                :type="(activityTagType(activity.type) as any)"
                size="small"
                effect="light"
                class="activity-tag"
              >
                {{ $t('dashboard.activityType.' + (activity as any).type) }}
              </el-tag>
              <span class="activity-content">{{ activity.content }}</span>
              <span class="activity-time">{{ formatTime(activity.time) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 开发日志时间线 -->
    <el-row :gutter="16">
      <el-col :span="24">
        <el-card shadow="hover" class="timeline-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('dashboard.devLog') }}</span>
            </div>
          </template>
          <div class="timeline">
            <div
              v-for="(item, index) in devLogs"
              :key="index"
              class="timeline-item"
            >
              <div class="timeline-dot" :class="item.type"></div>
              <div class="timeline-connector" v-if="index < devLogs.length - 1"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <el-tag size="small" effect="dark" :type="timelineTagType(item.type)">
                    {{ $t('dashboard.devLogTag.' + item.tag) }}
                  </el-tag>
                  <span class="timeline-date">{{ item.date }}</span>
                </div>
                <div class="timeline-title">{{ item.title }}</div>
                <div class="timeline-desc" v-if="item.desc">{{ item.desc }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getDashboardStats, getRecentActivities } from '@/api/dashboard'

const { t: $t } = useI18n()

// 统计数据
const stats = ref([
  { label: 'dashboard.totalUsers', value: 0, growth: 0, icon: 'User', color: 'var(--admin-primary)' },
  { label: 'dashboard.totalOrders', value: 0, growth: 0, icon: 'ShoppingCart', color: '#10b981' },
  { label: 'dashboard.totalSales', value: 0, growth: 0, icon: 'Wallet', color: '#f59e0b' },
  { label: 'dashboard.totalVisits', value: 0, growth: 0, icon: 'View', color: '#8b5cf6' },
])

// 活动数据
const activities = ref<any[]>([])

// 项目特性列表（来自 README）
const features = [
  { emoji: '🎯', key: 'composition' },
  { emoji: '📦', key: 'typescript' },
  { emoji: '🎭', key: 'theme' },
  { emoji: '🌍', key: 'i18n' },
  { emoji: '🔐', key: 'permission' },
  { emoji: '🧪', key: 'mock' },
]

// 开发日志时间线数据（来自 git log）
const devLogs = [
  {
    type: 'primary',
    tag: 'feature',
    title: '仪表盘全新改版',
    desc: '移除 ECharts 图表，新增项目信息卡片与开发日志时间线，布局更加清晰',
    date: '2026-04-27',
  },
  {
    type: 'success',
    tag: 'fix',
    title: '主题系统全面优化',
    desc: 'Dark Pro / Light Minimal 双主题切换，Terminal Elegant / Glassmorphism / Creamy 三套后台主题',
    date: '2026-04-15',
  },
  {
    type: 'info',
    tag: 'refactor',
    title: '主题管理页面重构',
    desc: '新增主题上传、激活、配置、预览、删除完整功能，ImageUploadField 组件',
    date: '2026-04-10',
  },
  {
    type: 'warning',
    tag: 'feature',
    title: '后台多主题切换上线',
    desc: 'Terminal Elegant / Glassmorphism Pro / Creamy Minimal 三套后台主题随心切换',
    date: '2026-03-31',
  },
  {
    type: 'danger',
    tag: 'fix',
    title: 'API 参数查询修复',
    desc: '修复 Buffalo 框架 API 参数获取错误，8 个文件 27 处参数修复，构建验证通过',
    date: '2026-03-30',
  },
]

// ============ 方法 ============

function activityTagType(type: string) {
  const map: Record<string, string> = {
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'info',
  }
  return map[type] || 'info'
}

function timelineTagType(type: string) {
  const map: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = {
    primary: 'primary',
    success: 'success',
    info: 'info',
    warning: 'warning',
    danger: 'danger',
  }
  return map[type] || 'info'
}

function formatTime(time: string) {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return $t('relativeTime.justNow')
  if (diff < 3600) return $t('relativeTime.minutesAgo', { n: Math.floor(diff / 60) })
  if (diff < 86400) return $t('relativeTime.hoursAgo', { n: Math.floor(diff / 3600) })
  if (diff < 2592000) return $t('relativeTime.daysAgo', { n: Math.floor(diff / 86400) })
  return date.toLocaleDateString()
}

async function loadStats() {
  try {
    const res = await getDashboardStats()
    const data = res.data
    stats.value[0].value = data.users
    stats.value[0].growth = data.userGrowth
    stats.value[1].value = data.orders
    stats.value[1].growth = data.orderGrowth
    stats.value[2].value = data.sales
    stats.value[2].growth = data.salesGrowth
    stats.value[3].value = data.visits
    stats.value[3].growth = data.visitGrowth
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

async function loadActivities() {
  try {
    const res = await getRecentActivities()
    activities.value = res.data
  } catch (error) {
    console.error('Failed to load activities:', error)
  }
}

onMounted(async () => {
  await Promise.all([loadStats(), loadActivities()])
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--admin-spacing-lg);
  padding-top: 4px;
}

/* 统计卡片 */
.stat-card {
  border: none;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: var(--admin-font-size-base);
  color: var(--admin-text-secondary);
  margin-bottom: var(--admin-spacing-xs);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--admin-text-primary);
  line-height: 1.2;
  margin-bottom: var(--admin-spacing-xs);
}

.stat-growth {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--admin-font-size-sm);
  font-weight: 500;
}

.stat-growth.up {
  color: var(--admin-success);
}

.stat-growth.down {
  color: var(--admin-danger);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--admin-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 项目信息卡片 */
.badge-card {
  border: none;
  height: 100%;
}

.project-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.project-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--admin-text-primary);
}

.project-icon {
  font-size: 20px;
  color: var(--admin-primary);
}

.project-desc {
  font-size: 13px;
  color: var(--admin-text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* CSS 徽章（shields.io 被墙，改为纯 CSS 实现） */
.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.css-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'SF Mono', 'Menlo', monospace;
  letter-spacing: 0.3px;
  line-height: 18px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.feature-icon {
  font-size: 15px;
  flex-shrink: 0;
}

.feature-text {
  color: var(--admin-text-secondary);
  line-height: 1.4;
}

/* 活动列表 */
.activity-card {
  border: none;
  display: flex;
  flex-direction: column;
}

.activity-card :deep(.el-card__body) {
  flex: 1;
}

.activity-list {
  max-height: 320px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: var(--admin-spacing-sm);
  padding: var(--admin-spacing-sm) 0;
  border-bottom: 1px solid var(--admin-border-light);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-tag {
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  font-size: var(--admin-font-size-sm);
  color: var(--admin-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-time {
  font-size: var(--admin-font-size-xs);
  color: var(--admin-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

/* 开发日志时间线 */
.timeline-card {
  border: none;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: flex;
  gap: 16px;
  position: relative;
  padding-bottom: 24px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
  position: relative;
  z-index: 1;
}

.timeline-dot.primary {
  background: var(--admin-primary);
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
}

.timeline-dot.success {
  background: var(--admin-success);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.timeline-dot.info {
  background: var(--admin-info);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.timeline-dot.warning {
  background: var(--admin-warning);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
}

.timeline-dot.danger {
  background: var(--admin-danger);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.timeline-connector {
  position: absolute;
  left: 4px;
  top: 14px;
  bottom: 0;
  width: 2px;
  background: var(--admin-border);
}

.timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.timeline-date {
  font-size: var(--admin-font-size-xs);
  color: var(--admin-text-muted);
}

.timeline-title {
  font-size: var(--admin-font-size-sm);
  font-weight: 600;
  color: var(--admin-text-primary);
}

.timeline-desc {
  font-size: var(--admin-font-size-xs);
  color: var(--admin-text-secondary);
  line-height: 1.5;
}
</style>
