<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ $t('menu.charts') }}</h2>
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>{{ $t('chartDemo.barChart') }}</template>
          <div class="chart-area">
            <div class="bar-chart-demo">
              <div
                v-for="(item, index) in barData"
                :key="index"
                class="bar-bar"
                :style="{ height: item.value + '%' }"
              >
                <span class="bar-label">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>{{ $t('chartDemo.progressRing') }}</template>
          <div class="progress-ring-container">
            <div v-for="(ring, index) in progressData" :key="index" class="progress-ring-item">
              <el-progress type="circle" :percentage="ring.value" :color="ring.color" :width="100" />
              <p>{{ ring.label }}</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card shadow="hover">
          <template #header>{{ $t('chartDemo.dataOverview') }}</template>
          <div class="stat-list">
            <div v-for="(stat, index) in statItems" :key="index" class="stat-item">
              <div class="stat-dot" :style="{ backgroundColor: stat.color }"></div>
              <div class="stat-info">
                <span class="stat-label">{{ stat.label }}</span>
                <span class="stat-value">{{ stat.value }}</span>
              </div>
              <el-progress :percentage="stat.percent" :color="stat.color" :show-text="false" :stroke-width="6" style="flex:1;margin-left:12px;" />
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card shadow="hover">
          <template #header>{{ $t('chartDemo.trendChart') }}</template>
          <div class="line-chart-placeholder">
            <svg viewBox="0 0 300 150" preserveAspectRatio="none" style="width:100%;height:auto;">
              <polyline
                points="0,120 42,95 84,110 126,70 168,85 210,40 252,55 300,20"
                fill="none"
                stroke="var(--admin-primary)"
                stroke-width="2"
              />
              <polygon
                points="0,120 42,95 84,110 126,70 168,85 210,40 252,55 300,20 300,150 0,150"
                fill="var(--admin-primary)"
                opacity="0.12"
              />
            </svg>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card shadow="hover">
          <template #header>{{ $t('chartDemo.pieChart') }}</template>
          <div class="pie-list">
            <div v-for="(item, index) in pieData" :key="index" class="pie-item">
              <span class="pie-label">
                <i :style="{ backgroundColor: item.color }"></i>
                {{ item.label }}
              </span>
              <span class="pie-value">{{ item.value }} ({{ item.percent }}%)</span>
              <div class="pie-bar-bg">
                <div class="pie-bar-fill" :style="{ width: item.percent + '%', backgroundColor: item.color }"></div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()

// 柱状图
const barData = ref([
  { label: $t('chartDemo.jan'), value: 65 },
  { label: $t('chartDemo.feb'), value: 78 },
  { label: $t('chartDemo.mar'), value: 52 },
  { label: $t('chartDemo.apr'), value: 88 },
  { label: $t('chartDemo.may'), value: 72 },
  { label: $t('chartDemo.jun'), value: 95 },
])

// 进度环
const progressData = ref([
  { label: $t('chartDemo.cpuUsage'), value: 68, color: 'var(--admin-primary)' },
  { label: $t('chartDemo.memoryUsage'), value: 82, color: '#67C23A' },
  { label: $t('chartDemo.diskSpace'), value: 45, color: '#E6A23C' },
])

// 统计列表
const statItems = ref([
  { label: $t('chartDemo.directVisit'), value: '3,240', percent: 75, color: 'var(--admin-primary)' },
  { label: $t('chartDemo.emailMarketing'), value: '1,850', percent: 43, color: '#67C23A' },
  { label: $t('chartDemo.allianceAds'), value: '1,230', percent: 28, color: '#E6A23C' },
  { label: $t('chartDemo.videoAds'), value: '980', percent: 23, color: '#F56C6C' },
])

// 饼图
const pieData = ref([
  { label: $t('chartDemo.searchEngine'), value: 1048, percent: 48, color: 'var(--admin-primary)' },
  { label: $t('chartDemo.directVisit'), value: 335, percent: 15, color: '#67C23A' },
  { label: $t('chartDemo.emailMarketing'), value: 310, percent: 14, color: '#E6A23C' },
  { label: $t('chartDemo.allianceAds'), value: 234, percent: 11, color: '#F56C6C' },
  { label: $t('chartDemo.videoAds'), value: 270, percent: 12, color: '#909399' },
])
</script>

<style scoped>
.chart-area {
  padding: 24px 0;
}

.bar-chart-demo {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  height: 220px;
  padding-top: 32px;
}

.bar-bar {
  flex: 1;
  background-color: var(--admin-primary);
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 20px;
}
.bar-bar:hover {
  opacity: 0.85;
  transform: translateY(-2px);
}
.bar-label {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

/* 进度环 */
.progress-ring-container {
  display: flex;
  justify-content: space-around;
  padding: 24px 0;
  text-align: center;
}
.progress-ring-item p {
  margin-top: 12px;
  font-size: 13px;
  color: var(--admin-text-secondary);
}

/* 统计列表 */
.stat-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 12px 0;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.stat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.stat-info {
  display: flex;
  flex-direction: column;
  min-width: 80px;
}
.stat-label {
  font-size: 12px;
  color: var(--admin-text-secondary);
}
.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--admin-text-primary);
}

/* 饼图 */
.line-chart-placeholder {
  padding: 16px 0;
}
.pie-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
}
.pie-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pie-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--admin-text-primary);
}
.pie-label i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
}
.pie-value {
  font-size: 12px;
  color: var(--admin-text-secondary);
  padding-left: 16px;
}
.pie-bar-bg {
  height: 6px;
  background: var(--admin-border-light);
  border-radius: 3px;
  overflow: hidden;
}
.pie-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
</style>
