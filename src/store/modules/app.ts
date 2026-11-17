import { defineStore } from 'pinia'
import { ref } from 'vue'

interface TagView {
  path: string
  name?: string
  title: string
  affix?: boolean
}

export const useAppStore = defineStore(
  'app',
  () => {
    // State
    const sidebarCollapsed = ref(false)
    const language = ref('zh-CN')
    const visitedViews = ref<TagView[]>([])
    const cachedViews = ref<string[]>([])

    // Sidebar actions
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    const setSidebarCollapsed = (collapsed: boolean) => {
      sidebarCollapsed.value = collapsed
    }

    const setLanguage = (lang: string) => {
      language.value = lang
    }

    // TagsView actions
    const addVisitedView = (view: TagView) => {
      if (visitedViews.value.some((v) => v.path === view.path)) return
      visitedViews.value.push({ ...view })
    }

    const removeVisitedView = (view: TagView) => {
      const index = visitedViews.value.findIndex((v) => v.path === view.path)
      if (index > -1) {
        visitedViews.value.splice(index, 1)
      }
    }

    const closeOtherVisitedViews = (view: TagView) => {
      visitedViews.value = visitedViews.value.filter(
        (v) => v.affix || v.path === view.path
      )
    }

    const clearVisitedViews = () => {
      visitedViews.value = visitedViews.value.filter((v) => v.affix)
    }

    // Cache actions (for keep-alive)
    const addCachedView = (viewName: string) => {
      if (cachedViews.value.includes(viewName)) return
      cachedViews.value.push(viewName)
    }

    const removeCachedView = (viewName: string) => {
      const index = cachedViews.value.indexOf(viewName)
      if (index > -1) {
        cachedViews.value.splice(index, 1)
      }
    }

    return {
      sidebarCollapsed,
      language,
      visitedViews,
      cachedViews,
      toggleSidebar,
      setSidebarCollapsed,
      setLanguage,
      addVisitedView,
      removeVisitedView,
      closeOtherVisitedViews,
      clearVisitedViews,
      addCachedView,
      removeCachedView,
    }
  },
  {
    persist: {
      paths: ['sidebarCollapsed', 'language'],
    },
  }
)

export type { TagView }
