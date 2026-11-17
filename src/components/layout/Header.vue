<template>
  <header class="header" :class="{ 'sidebar-collapsed': collapsed }">
    <div class="header-left">
      <!-- 折叠按钮 -->
      <button class="collapse-btn" @click="appStore.toggleSidebar()">
        <el-icon :size="18">
          <Fold v-if="!appStore.sidebarCollapsed" />
          <Expand v-else />
        </el-icon>
      </button>

      <!-- 面包屑导航 -->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item
          v-for="item in breadcrumbs"
          :key="item.path"
          :to="item.path === '/' ? undefined : { path: item.path }"
        >
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-right">
      <!-- 搜索（可选） -->
      <el-tooltip :content="$t('common.search')" placement="bottom">
        <button class="header-action">
          <el-icon :size="18"><Search /></el-icon>
        </button>
      </el-tooltip>

      <!-- 全屏 -->
      <el-tooltip :content="isFullscreen ? $t('common.exitFullscreen') : $t('common.fullscreen')" placement="bottom">
        <button class="header-action" @click="toggleFullscreen">
          <el-icon :size="18"><FullScreen /></el-icon>
        </button>
      </el-tooltip>

      <!-- 语言切换 -->
      <el-dropdown trigger="click" @command="changeLanguage">
        <button class="header-action">
          <el-icon :size="18"><Globe /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh-CN" :disabled="locale === 'zh-CN'">
              简体中文
            </el-dropdown-item>
            <el-dropdown-item command="en-US" :disabled="locale === 'en-US'">
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 主题切换 -->
      <el-dropdown trigger="click" @command="(cmd) => setTheme(cmd)">
        <button class="header-action">
          <el-icon :size="18"><Moon /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="theme in themes"
              :key="theme.id"
              :command="theme.id"
              :disabled="currentThemeId === theme.id"
            >
              <el-icon><Moon v-if="theme.id === 'dark'" /><Sunny v-else /></el-icon>
              {{ theme.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 用户信息 -->
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32" :src="userStore.avatar">
            {{ userStore.nickname?.charAt(0)?.toUpperCase() || 'A' }}
          </el-avatar>
          <span class="username">{{ userStore.nickname }}</span>
          <el-icon class="arrow"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              {{ $t('common.profile') }}
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              {{ $t('common.settings') }}
            </el-dropdown-item>
            <el-dropdown-item command="closeTags">
              <el-icon><Close /></el-icon>
              {{ $t('common.closeTags') }}
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              {{ $t('common.logout') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { useAdminTheme } from '@/composables/useAdminTheme'
import { logout as logoutApi } from '@/api/auth'
import { resetSession } from '@/utils/session'

const { locale, t: $t } = useI18n()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const { currentThemeId, setTheme, themes } = useAdminTheme()

defineProps<{
  collapsed?: boolean
}>()

// 全屏状态
const isFullscreen = ref(false)

// 面包屑
const breadcrumbs = computed(() => {
  return (router.currentRoute.value.meta as any).breadcrumb || [
    { path: '/', title: $t('menu.dashboard') },
  ]
})

// 切换语言
const changeLanguage = (lang: string) => {
  locale.value = lang
  localStorage.setItem('catter-admin-language', lang)
  appStore.setLanguage(lang)
}

// 切换全屏（以浏览器真实状态为准，用户按 Esc 退出时也能同步）
const toggleFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  } catch (error) {
    console.warn('Fullscreen toggle failed:', error)
  } finally {
    isFullscreen.value = !!document.fullscreenElement
  }
}

const syncFullscreenState = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', syncFullscreenState)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', syncFullscreenState)
})

// 用户下拉操作
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile/index')
      break
    case 'settings':
      router.push('/profile/settings')
      break
    case 'closeTags':
      appStore.clearVisitedViews()
      router.push('/')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 登出
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm($t('common.logoutConfirm'), $t('common.tips'), {
      confirmButtonText: $t('common.confirm'),
      cancelButtonText: $t('common.cancel'),
      type: 'warning',
    })
  } catch {
    // 用户取消
    return
  }

  try {
    // 通知服务端注销会话；失败也要继续做本地清理
    await logoutApi()
  } catch (error) {
    console.warn('Logout request failed:', error)
  }

  // 统一清理 token / 用户信息 / 菜单权限 / 动态路由 / 标签页
  resetSession()
  ElMessage.success($t('common.logoutSuccess'))
  await router.replace('/login')
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  right: 0;
  left: var(--admin-sidebar-width);
  height: var(--admin-header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--admin-spacing-lg);
  background-color: var(--admin-header-bg);
  border-bottom: 1px solid var(--admin-header-border);
  z-index: 998;
  transition: left var(--admin-transition-normal);
  will-change: left;
}

.header.sidebar-collapsed {
  left: var(--admin-sidebar-collapsed-width);
}


.header-left {
  display: flex;
  align-items: center;
  gap: var(--admin-spacing-md);
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--admin-radius-sm);
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--admin-text-secondary);
  transition: all var(--admin-transition-fast);
}

.collapse-btn:hover {
  background-color: var(--admin-bg-hover);
  color: var(--admin-text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--admin-spacing-xs);
}

.header-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--admin-radius-sm);
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--admin-text-secondary);
  transition: all var(--admin-transition-fast);
}

.header-action:hover {
  background-color: var(--admin-bg-hover);
  color: var(--admin-text-primary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--admin-spacing-sm);
  padding: var(--admin-spacing-xs) var(--admin-spacing-sm);
  border-radius: var(--admin-radius-sm);
  cursor: pointer;
  transition: background-color var(--admin-transition-fast);
  margin-left: var(--admin-spacing-sm);
}

.user-info:hover {
  background-color: var(--admin-bg-hover);
}

.username {
  font-size: var(--admin-font-size-base);
  font-weight: 500;
  color: var(--admin-text-primary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow {
  color: var(--admin-text-muted);
  font-size: 12px;
}
</style>
