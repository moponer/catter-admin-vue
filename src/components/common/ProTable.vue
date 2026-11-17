<template>
  <div class="pro-table">
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="table-toolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left" />
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right" />
        <el-tooltip v-if="showRefresh" :content="$t('common.refresh')" placement="top">
          <el-button :icon="Refresh" circle size="small" @click="handleRefresh" />
        </el-tooltip>
        <el-tooltip v-if="showColumnSetting" :content="$t('common.columnSetting')" placement="top">
          <el-button :icon="Setting" circle size="small" @click="showColSetting = true" />
        </el-tooltip>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="selectedRows.length > 0" class="batch-bar">
      <span class="batch-info">
        {{ $t('common.selectedCount', { count: selectedRows.length }) }}
      </span>
      <el-button type="danger" size="small" plain @click="handleBatchDelete">
        {{ $t('common.batchDelete') }}
      </el-button>
      <slot name="batch-actions" :rows="selectedRows" />
    </div>

    <!-- 表格 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="data"
      :border="border"
      :row-key="rowKey"
      :stripe="stripe"
      :height="height"
      :max-height="maxHeight"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <!-- 多选列 -->
      <el-table-column v-if="selectable" type="selection" width="50" :reserve-selection="true" />

      <!-- 序号列 -->
      <el-table-column
        v-if="showIndex"
        type="index"
        :label="$t('common.index')"
        width="60"
        :index="(i: number) => (pagination.currentPage - 1) * pagination.pageSize + i + 1"
      />

      <!-- 数据列 -->
      <template v-for="col in visibleColumns" :key="col.prop">
        <el-table-column
          v-if="!col.slot"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :sortable="col.sortable"
          :fixed="col.fixed"
          :show-overflow-tooltip="col.showOverflowTooltip !== false"
          :align="col.align"
        >
          <!-- 状态标签 -->
          <template v-if="col.tag" #default="{ row }">
            <el-tag :type="getTagType(row[col.prop], col.tagMap)">
              {{ getTagLabel(row[col.prop], col.tagMap) }}
            </el-tag>
          </template>
          <!-- 图片 -->
          <template v-else-if="col.image" #default="{ row }">
            <el-image
              v-if="row[col.prop]"
              :src="row[col.prop]"
              :preview-src-list="[row[col.prop]]"
              fit="cover"
              style="width: 40px; height: 40px; border-radius: 4px"
            />
          </template>
          <!-- 日期格式化 -->
          <template v-else-if="col.dateFormat" #default="{ row }">
            {{ formatDate(row[col.prop], col.dateFormat) }}
          </template>
        </el-table-column>

        <!-- 自定义列插槽 -->
        <el-table-column
          v-else
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :sortable="col.sortable"
          :fixed="col.fixed"
          :align="col.align"
        >
          <template #default="scope">
            <slot :name="col.prop" v-bind="scope" />
          </template>
        </el-table-column>
      </template>

      <!-- 操作列 -->
      <el-table-column
        v-if="showActions"
        :label="$t('common.actions')"
        :width="actionsWidth"
        :fixed="actionsFixed"
        align="center"
      >
        <template #default="scope">
          <slot name="actions" v-bind="scope" />
        </template>
      </el-table-column>

      <!-- 空状态 -->
      <template #empty>
        <el-empty :description="$t('common.noData')" :image-size="80" />
      </template>
    </el-table>

    <!-- 分页 -->
    <div v-if="showPagination" class="table-pagination">
      <!-- 注意：pagination 是只读 computed，不能用 v-model 绑定（会写入临时对象导致状态不同步），
           这里通过事件交给父组件更新 props -->
      <el-pagination
        :current-page="pagination.currentPage"
        :page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 列设置抽屉 -->
    <el-drawer
      v-model="showColSetting"
      :title="$t('common.columnSetting')"
      direction="rtl"
      size="280px"
    >
      <div class="column-setting">
        <el-checkbox
          v-model="allColumnsVisible"
          :indeterminate="indeterminate"
          @change="handleCheckAll"
        >
          {{ $t('common.selectAll') }}
        </el-checkbox>
        <el-divider />
        <draggable
          v-model="columnState"
          item-key="prop"
          handle=".drag-handle"
          @end="handleDragEnd"
        >
          <template #item="{ element }">
            <div class="column-item">
              <el-icon class="drag-handle"><Rank /></el-icon>
              <el-checkbox v-model="element.visible">{{ element.label }}</el-checkbox>
            </div>
          </template>
        </draggable>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CheckboxValueType } from 'element-plus'
import { Refresh, Setting, Rank } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import { formatDate } from '@/utils/format'

export interface ProTableColumn {
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  sortable?: boolean | 'custom'
  fixed?: boolean | 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  showOverflowTooltip?: boolean
  // 类型扩展
  slot?: boolean
  tag?: boolean
  tagMap?: Record<string | number, { label: string; type: '' | 'success' | 'warning' | 'danger' | 'info' }>
  image?: boolean
  dateFormat?: string
}

interface ColumnStateItem extends ProTableColumn {
  visible: boolean
}

const props = withDefaults(
  defineProps<{
    data: any[]
    columns: ProTableColumn[]
    loading?: boolean
    // 选择
    selectable?: boolean
    rowKey?: string
    // 序号
    showIndex?: boolean
    // 分页
    showPagination?: boolean
    total?: number
    currentPage?: number
    pageSize?: number
    // 操作列
    showActions?: boolean
    actionsWidth?: number | string
    actionsFixed?: 'left' | 'right' | boolean
    // 工具栏
    showToolbar?: boolean
    showRefresh?: boolean
    showColumnSetting?: boolean
    // 样式
    border?: boolean
    stripe?: boolean
    height?: string | number
    maxHeight?: string | number
  }>(),
  {
    loading: false,
    selectable: false,
    rowKey: 'id',
    showIndex: false,
    showPagination: true,
    total: 0,
    currentPage: 1,
    pageSize: 10,
    showActions: true,
    actionsWidth: 200,
    actionsFixed: 'right',
    showToolbar: true,
    showRefresh: true,
    showColumnSetting: true,
    border: true,
    stripe: false,
  }
)

const emit = defineEmits<{
  (e: 'search'): void
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'sort-change', sort: { prop: string; order: string }): void
  (e: 'selection-change', rows: any[]): void
  (e: 'batch-delete', rows: any[]): void
}>()

const tableRef = ref()
const selectedRows = ref<any[]>([])
const showColSetting = ref(false)

// 分页
const pagination = computed(() => ({
  currentPage: props.currentPage,
  pageSize: props.pageSize,
  total: props.total,
}))

// 列状态（可拖拽排序 + 可显隐）
const columnState = ref<ColumnStateItem[]>(
  props.columns.map((col) => ({ ...col, visible: true }))
)

watch(
  () => props.columns,
  (newCols) => {
    columnState.value = newCols.map((col) => ({
      ...col,
      visible:
        columnState.value.find((cs) => cs.prop === col.prop)?.visible ?? true,
    }))
  }
)

const visibleColumns = computed(() =>
  columnState.value.filter((col) => col.visible)
)

// 全选/半选
const allColumnsVisible = computed({
  get: () => columnState.value.every((c) => c.visible),
  set: () => {},
})

const indeterminate = computed(
  () =>
    !allColumnsVisible.value &&
    columnState.value.some((c) => c.visible)
)

function handleCheckAll(val: CheckboxValueType) {
  columnState.value.forEach((c) => (c.visible = !!val))
}

function handleDragEnd() {
  // vuedraggable 自动更新了 columnState
}

// 事件处理
function handleRefresh() {
  emit('search')
}

function handleSizeChange(size: number) {
  emit('size-change', size)
}

function handleCurrentChange(page: number) {
  emit('page-change', page)
}

function handleSortChange({ prop, order }: any) {
  emit('sort-change', { prop, order })
}

function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows
  emit('selection-change', rows)
}

function handleBatchDelete() {
  emit('batch-delete', selectedRows.value)
}

// Tag 辅助
function getTagType(
  val: string | number,
  tagMap?: Record<string | number, { label: string; type: string }>
): any {
  return tagMap?.[val]?.type || ''
}

function getTagLabel(
  val: string | number,
  tagMap?: Record<string | number, { label: string; type: string }>
): string {
  return tagMap?.[val]?.label || String(val)
}

// 暴露方法
defineExpose({
  tableRef,
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row: any, selected?: boolean) =>
    tableRef.value?.toggleRowSelection(row, selected),
})
</script>

<style scoped>
.pro-table {
  background: var(--el-bg-color);
  border-radius: 4px;
  padding: 16px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  margin-bottom: 12px;
  background: var(--admin-bg-active);
  border-radius: 4px;
}

.batch-info {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}

.column-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.drag-handle {
  cursor: move;
  color: var(--el-text-color-placeholder);
}
</style>
