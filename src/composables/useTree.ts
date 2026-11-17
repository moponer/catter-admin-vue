import { ref } from 'vue'

/**
 * 树形数据操作 composable
 *
 * 用法：
 *   const { treeData, treeFilter, loadTree, filterNode } = useTree({ apiFn: getDeptTree })
 *   <el-tree :data="treeData" :filter-node-method="filterNode" />
 */
interface UseTreeOptions {
  /** 获取树形数据的 API 函数 */
  apiFn?: () => Promise<any>
  /** 响应中树数据的字段名（默认 'data'） */
  dataField?: string
  /** 节点名称字段（默认 'label'，部门/菜单树常用 'name'） */
  labelKey?: string
}

export function useTree(options: UseTreeOptions = {}) {
  const { apiFn, dataField = 'data', labelKey = 'label' } = options

  const treeData = ref<any[]>([])
  const treeLoading = ref(false)
  const treeFilter = ref('')
  const expandedKeys = ref<(number | string)[]>([])

  // 树过滤
  function filterNode(value: string, data: any): boolean {
    if (!value) return true
    return String(data?.[labelKey] ?? '').includes(value)
  }

  // 加载树数据
  async function loadTree() {
    if (!apiFn) return
    treeLoading.value = true
    try {
      const res = await apiFn()
      treeData.value = res?.[dataField] ?? res?.data ?? []
    } catch (error) {
      console.warn('Load tree failed:', error)
      treeData.value = []
    } finally {
      treeLoading.value = false
    }
  }

  // 展开全部
  function expandAll() {
    expandedKeys.value = getAllNodeIds(treeData.value)
  }

  // 收起全部
  function collapseAll() {
    expandedKeys.value = []
  }

  // 递归获取所有节点 ID
  function getAllNodeIds(nodes: any[]): (number | string)[] {
    const ids: (number | string)[] = []
    for (const node of nodes) {
      ids.push(node.id)
      if (node.children?.length) {
        ids.push(...getAllNodeIds(node.children))
      }
    }
    return ids
  }

  // 根据 ID 查找节点
  function findNode(nodes: any[], id: number | string): any | null {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children?.length) {
        const found = findNode(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  // 扁平化树（返回所有叶子节点）
  function flattenTree(nodes: any[]): any[] {
    const result: any[] = []
    for (const node of nodes) {
      if (node.children?.length) {
        result.push(...flattenTree(node.children))
      } else {
        result.push(node)
      }
    }
    return result
  }

  return {
    treeData,
    treeLoading,
    treeFilter,
    expandedKeys,
    filterNode,
    loadTree,
    expandAll,
    collapseAll,
    findNode,
    flattenTree,
  }
}
