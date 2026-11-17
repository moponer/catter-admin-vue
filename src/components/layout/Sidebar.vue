<template>
  <div class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <!-- Logo 区域 -->
    <div class="sidebar-logo">
      <h1 v-if="!appStore.sidebarCollapsed">Catter Admin</h1>
      <h1 v-else>CA</h1>
    </div>

    <!-- 导航菜单 -->
    <el-scrollbar class="sidebar-scrollbar">
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :unique-opened="true"
        router
      >
        <template v-for="menu in permissionStore.menus" :key="menu.id">
          <!-- 有子菜单 -->
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path">
            <template #title>
              <el-icon v-if="menu.icon">
                <component :is="menu.icon" />
              </el-icon>
              <span>{{ menu.title }}</span>
            </template>
            <el-menu-item
              v-for="child in menu.children"
              :key="child.id"
              :index="child.path"
            >
              <el-icon v-if="child.icon">
                <component :is="child.icon" />
              </el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 无子菜单 -->
          <el-menu-item v-else :index="menu.path">
            <el-icon v-if="menu.icon">
              <component :is="menu.icon" />
            </el-icon>
            <span>{{ menu.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const activeMenu = computed(() => route.path)
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--admin-sidebar-width);
  background-color: var(--admin-sidebar-bg);
  border-right: 1px solid var(--admin-sidebar-border);
  z-index: 999;
  transition: width var(--admin-transition-normal);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  will-change: width;
}

.sidebar.collapsed {
  width: var(--admin-sidebar-collapsed-width);
}

/* Logo */
.sidebar-logo {
  height: var(--admin-header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--admin-logo-bg);
  border-bottom: 1px solid var(--admin-sidebar-border);
  padding: 0 var(--admin-spacing-md);
  flex-shrink: 0;
  transition: background-color var(--admin-transition-normal);
}

.sidebar-logo h1 {
  font-size: 16px;
  font-weight: 700;
  color: var(--admin-logo-text);
  white-space: nowrap;
  overflow: hidden;
  transition: opacity var(--admin-transition-fast);
}

/* 滚动区域 */
.sidebar-scrollbar {
  flex: 1;
  overflow: hidden;
}

/* 菜单样式 */
.sidebar :deep(.el-menu) {
  background-color: transparent;
  border-right: none;
  transition: padding var(--admin-transition-normal);
}

.sidebar :deep(.el-menu-item) {
  color: var(--admin-menu-text);
  height: 48px;
  line-height: 48px;
  transition: background-color var(--admin-transition-fast), color var(--admin-transition-fast);
}

.sidebar :deep(.el-menu-item:hover) {
  background-color: var(--admin-menu-bg-hover);
  color: var(--admin-menu-text-active);
}

.sidebar :deep(.el-menu-item.is-active) {
  background-color: var(--admin-menu-bg-active);
  color: var(--admin-menu-text-active);
  position: relative;
}

.sidebar :deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background-color: var(--admin-menu-indicator);
  border-radius: 0 2px 2px 0;
}

.sidebar :deep(.el-sub-menu__title) {
  color: var(--admin-menu-text);
  height: 48px;
  line-height: 48px;
  transition: background-color var(--admin-transition-fast), color var(--admin-transition-fast);
}

.sidebar :deep(.el-sub-menu__title:hover) {
  background-color: var(--admin-menu-bg-hover);
  color: var(--admin-menu-text-active);
}

/* 折叠时只隐藏文字，保留图标 */
.sidebar.collapsed :deep(.el-menu .el-menu-item span),
.sidebar.collapsed :deep(.el-menu .el-sub-menu__title > span:not(.el-sub-menu__icon-arrow)) {
  visibility: hidden;
}

/* 折叠时菜单文字不换行 */
.sidebar :deep(.el-menu--collapse) {
  width: 100%;
}

.sidebar :deep(.el-menu--collapse .el-menu-item),
.sidebar :deep(.el-menu--collapse .el-sub-menu__title) {
  text-overflow: clip;
}
</style>
