import { ref, computed } from 'vue'

/**
 * 表格多选 composable
 *
 * 用法：
 *   const { selectedRows, selectedIds, handleSelectionChange, clearSelection } = useSelection()
 *   <el-table @selection-change="handleSelectionChange">
 *   <el-button :disabled="!selectedIds.length">批量删除 {{ selectedIds.length }} 项</el-button>
 */
export function useSelection<T extends Record<string, any> = any>(
  idKey: string = 'id'
) {
  const selectedRows = ref<T[]>([])

  /** 选中行的 ID 列表 */
  const selectedIds = computed(() =>
    selectedRows.value.map((row) => row[idKey])
  )

  /** 是否有选中 */
  const hasSelected = computed(() => selectedRows.value.length > 0)

  /** 选中数量 */
  const selectedCount = computed(() => selectedRows.value.length)

  /** el-table @selection-change 回调 */
  function handleSelectionChange(rows: T[]) {
    selectedRows.value = rows
  }

  /**
   * 清空选中。
   * 传入 el-table 的 ref 时同时清掉表格内部勾选，否则下一次 selection-change 会把旧行又推回来。
   */
  function clearSelection(tableRef?: { clearSelection?: () => void }) {
    selectedRows.value = []
    tableRef?.clearSelection?.()
  }

  return {
    selectedRows,
    selectedIds,
    hasSelected,
    selectedCount,
    handleSelectionChange,
    clearSelection,
  }
}
