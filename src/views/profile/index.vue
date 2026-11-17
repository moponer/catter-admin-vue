<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ $t('menu.profile') }}</h2>
    </div>

    <el-row :gutter="24">
      <!-- 个人信息卡片 -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="profile-card">
          <div class="profile-header">
            <el-avatar :size="80" style="background:var(--admin-primary);font-size:28px;">
              {{ userStore.nickname?.charAt(0)?.toUpperCase() || 'A' }}
            </el-avatar>
            <h3>{{ userStore.nickname || $t('profile.notSet') }}</h3>
            <p>{{ userStore.username }}</p>
            <el-tag type="primary" size="small">{{ $t('profile.admin') }}</el-tag>
          </div>

          <el-divider />

          <div class="profile-info">
            <div class="info-item">
              <el-icon><User /></el-icon>
              <span>{{ $t('profile.username') }}</span>
              <span class="value">{{ userStore.username }}</span>
            </div>
            <div class="info-item">
              <el-icon><Message /></el-icon>
              <span>{{ $t('profile.email') }}</span>
              <span class="value">{{ userStore.email || $t('profile.notBound') }}</span>
            </div>
            <div class="info-item">
              <el-icon><Phone /></el-icon>
              <span>{{ $t('profile.phone') }}</span>
              <span class="value">{{ userStore.userInfo?.phone || $t('profile.notBound') }}</span>
            </div>
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ $t('profile.registerTime') }}</span>
              <span class="value">2024-01-01</span>
            </div>
          </div>

          <el-button type="primary" style="width:100%;margin-top:24px;" @click="$router.push('/profile/settings')">
            {{ $t('profile.editProfile') }}
          </el-button>
        </el-card>
      </el-col>

      <!-- 活动记录 -->
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover">
          <template #header>{{ $t('profile.recentActivity') }}</template>
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in activities"
              :key="index"
              :timestamp="item.time"
              placement="top"
              :type="item.type === 'login' ? 'primary' : item.type === 'edit' ? '' : item.type === 'create' ? 'success' : 'warning'"
            >
              <div class="activity-content">
                <strong>{{ item.title }}</strong>
                <p>{{ item.description }}</p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 快捷入口 -->
        <el-row :gutter="16" style="margin-top: 16px;">
          <el-col :xs="12" :sm="6" v-for="action in quickActions" :key="action.label">
            <el-card shadow="hover" class="quick-action" @click="handleAction(action.command)">
              <el-icon :size="28" :style="{ color: action.color }"><component :is="action.icon" /></el-icon>
              <span>{{ action.label }}</span>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()
const { t: $t } = useI18n()

const activities = ref([
  { time: '2024-04-23 14:30', title: $t('profile.recentActivity'), description: '', type: 'login' },
])

// command 统一使用路由路径，避免出现「点了没反应」的死按钮
const quickActions = ref([
  { icon: 'EditPen', label: $t('profile.editInfo'), color: 'var(--admin-primary)', command: '/profile/settings' },
  { icon: 'Lock', label: $t('profile.changePassword'), color: 'var(--admin-primary)', command: '/profile/settings#password' },
  { icon: 'Bell', label: $t('profile.notification'), color: 'var(--admin-primary)', command: '/profile/settings#notification' },
  { icon: 'Setting', label: $t('profile.preferences'), color: 'var(--admin-primary)', command: '/profile/settings#preferences' },
])

const handleAction = (command: string) => {
  const [path, hash] = command.split('#')
  router.push({ path: path || '/profile/settings', hash: hash ? `#${hash}` : undefined })
}
</script>

<style scoped>
.profile-card {
  text-align: center;
}
.profile-header {
  padding: 20px 0;
}
.profile-header h3 {
  margin: 12px 0 4px;
  font-size: 18px;
}
.profile-header p {
  font-size: 13px;
  color: var(--admin-text-muted);
}

.profile-info {
  text-align: left;
}
.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid var(--admin-border-light);
  font-size: 14px;
  color: var(--admin-text-secondary);
}
.info-item:last-child {
  border-bottom: none;
}
.info-item .el-icon {
  color: var(--admin-text-muted);
  width: 18px;
  text-align: center;
}
.info-item .value {
  margin-left: auto;
  color: var(--admin-text-primary);
  font-weight: 500;
}

.activity-content strong {
  display: block;
  margin-bottom: 4px;
  color: var(--admin-text-primary);
}
.activity-content p {
  color: var(--admin-text-secondary);
  font-size: 13px;
}

.quick-action {
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 20px !important;
}
.quick-action:hover {
  transform: translateY(-2px);
  box-shadow: var(--admin-shadow-md);
}
.quick-action span {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  color: var(--admin-text-secondary);
}
</style>
