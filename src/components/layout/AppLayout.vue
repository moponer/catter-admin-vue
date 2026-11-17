<template>
  <div class="app-layout">
    <!-- 侧边栏 -->
    <Sidebar />

    <!-- 主体区域 -->
    <div class="main-container" :class="{ 'sidebar-collapsed': appStore.sidebarCollapsed }">
      <!-- 头部 + 标签页 -->
      <div class="header-wrapper">
        <Header :collapsed="appStore.sidebarCollapsed" />
        <TagsView />
      </div>
      <!-- 内容区 -->
      <div class="main-content" id="mainContent">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive :include="appStore.cachedViews">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/modules/app'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import TagsView from './TagsView.vue'

const appStore = useAppStore()
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-container {
  flex: 1;
  margin-left: var(--admin-sidebar-width);
  display: flex;
  flex-direction: column;
  transition: margin-left var(--admin-transition-normal);
  will-change: margin-left;
}

.main-container.sidebar-collapsed {
  margin-left: var(--admin-sidebar-collapsed-width);
}

/* 头部 + 标签页容器 */
.header-wrapper {
  position: sticky;
  top: 0;
  z-index: 998;
  flex-shrink: 0;
}

/* 内容区 */
.main-content {
  flex: 1;
  padding: var(--admin-spacing-lg);
  background-color: var(--admin-bg-page);
  overflow-y: auto;
  min-height: calc(100vh - var(--admin-header-height) - var(--admin-tags-height));
}

/* 路由过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: opacity var(--admin-transition-normal);
}

.fade-transform-enter-from {
  opacity: 0;
}

.fade-transform-leave-to {
  opacity: 0;
}
</style>
