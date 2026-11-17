<template>
  <div class="tags-view">
    <el-scrollbar class="tags-scroll">
      <div class="tags-wrapper">
        <router-link
          v-for="tag in visitedViews"
          :key="tag.path"
          :to="tag.path"
          class="tag-item"
          :class="{ active: isActive(tag) }"
          @contextmenu.prevent="openContextMenu($event, tag)"
        >
          <span class="tag-title">{{ tag.title }}</span>
          <el-icon
            v-if="!isAffix(tag)"
            class="tag-close"
            @click.prevent.stop="closeTag(tag)"
          >
            <Close />
          </el-icon>
        </router-link>
      </div>
    </el-scrollbar>

    <!-- 右键菜单 -->
    <ul
      v-show="contextMenuVisible"
      class="context-menu"
      :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
    >
      <li @click="refreshSelectedTag">
        <el-icon><Refresh /></el-icon>{{ $t('tagsView.refresh') }}
      </li>
      <li v-if="!isAffix(selectedTag)" @click="closeTag(selectedTag)">
        <el-icon><Close /></el-icon>{{ $t('tagsView.close') }}
      </li>
      <li @click="closeOtherTags">
        <el-icon><SemiSelect /></el-icon>{{ $t('tagsView.closeOther') }}
      </li>
      <li @click="closeAllTags">
        <el-icon><CircleClose /></el-icon>{{ $t('tagsView.closeAll') }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/modules/app'

const { t: $t } = useI18n()
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

interface TagView {
  path: string
  name?: string
  title: string
  affix?: boolean
}

const visitedViews = computed(() => appStore.visitedViews)

// 判断是否当前页
function isActive(tag: TagView) {
  return tag.path === route.path
}

// 是否固定标签（不可关闭）
function isAffix(tag: TagView) {
  return tag?.affix
}

// 添加标签
function addTag() {
  if (route.meta?.hidden) return
  const tag: TagView = {
    path: route.path,
    name: route.name as string,
    title: (route.meta?.title as string) || '',
    affix: route.meta?.affix as boolean,
  }
  appStore.addVisitedView(tag)
}

// 关闭标签
function closeTag(tag: TagView) {
  appStore.removeVisitedView(tag)
  if (isActive(tag)) {
    toLastView()
  }
}

// 关闭后跳转到最后一个
function toLastView() {
  const views = appStore.visitedViews
  const latestView = views.slice(-1)[0]
  if (latestView) {
    router.push(latestView.path)
  } else {
    router.push('/')
  }
}

// 关闭其他标签
function closeOtherTags() {
  router.push(selectedTag.value.path)
  appStore.closeOtherVisitedViews(selectedTag.value)
}

// 关闭所有标签
function closeAllTags() {
  appStore.clearVisitedViews()
  toLastView()
}

// 刷新当前页
function refreshSelectedTag() {
  const { path } = selectedTag.value
  nextTick(() => {
    router.replace({ path: '/redirect' + path })
  })
  contextMenuVisible.value = false
}

// ========== 右键菜单 ==========
const contextMenuVisible = ref(false)
const contextMenuLeft = ref(0)
const contextMenuTop = ref(0)
const selectedTag = ref<TagView>({ path: '', title: '' })

function openContextMenu(e: MouseEvent, tag: TagView) {
  selectedTag.value = tag
  contextMenuLeft.value = e.clientX
  contextMenuTop.value = e.clientY
  contextMenuVisible.value = true
}

// 点击其他位置关闭菜单（组件卸载时必须解绑，否则每次进入布局都会泄漏一个全局监听）
function closeContextMenu() {
  contextMenuVisible.value = false
}

// 监听路由变化添加标签
watch(() => route.path, () => {
  addTag()
}, { immediate: true })

onMounted(() => {
  // 添加固定标签
  addTag()
  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})
</script>

<style scoped>
.tags-view {
  height: var(--admin-tags-height);
  background-color: var(--admin-bg-surface);
  border-bottom: 1px solid var(--admin-border);
  flex-shrink: 0;
}

.tags-scroll {
  height: 100%;
}

.tags-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
  gap: 4px;
  white-space: nowrap;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 8px;
  font-size: 12px;
  border-radius: 3px;
  color: var(--admin-text-secondary);
  background-color: var(--admin-bg-page);
  border: 1px solid var(--admin-border);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-item:hover {
  color: var(--admin-primary);
}

.tag-item.active {
  color: #ffffff;
  background-color: var(--admin-primary);
  border-color: var(--admin-primary);
}

.tag-close {
  font-size: 12px;
  border-radius: 50%;
  transition: all 0.2s;
}

.tag-close:hover {
  background-color: rgba(0, 0, 0, 0.15);
}

[data-theme='dark'] .tag-item.active .tag-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  z-index: 9999;
  padding: 5px 0;
  margin: 0;
  list-style: none;
  background-color: var(--admin-bg-surface);
  border: 1px solid var(--admin-border);
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.context-menu li {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  font-size: 13px;
  color: var(--admin-text-secondary);
  cursor: pointer;
}

.context-menu li:hover {
  background-color: var(--admin-bg-hover);
  color: var(--admin-primary);
}
</style>
