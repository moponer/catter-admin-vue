<template>
  <div class="operate-log-page">
    <SearchForm
      :model-value="queryParams"
      :items="searchItems"
      @update:model-value="(value: Record<string, any>) => Object.assign(queryParams, value)"
      @search="handleSearch"
      @reset="handleReset"
    />

    <el-card shadow="never">
      <div class="table-toolbar">
        <el-popconfirm :title="$t('log.confirmClean')" @confirm="handleClean">
          <template #reference>
            <el-button type="danger" :icon="Delete">{{ $t('log.cleanAll') }}</el-button>
          </template>
        </el-popconfirm>
      </div>

      <ProTable
        :data="tableData"
        :columns="columns"
        :loading="loading"
        :total="total"
        :current-page="queryParams.page"
        :page-size="queryParams.pageSize"
        :selectable="true"
        :show-column-setting="false"
        @search="handleSearch"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        @batch-delete="handleBatchDelete"
      >
        <template #actions="{ row }">
          <el-button type="primary" link size="small" @click="handleDetail(row)">
            {{ $t('common.detail') }}
          </el-button>
          <el-popconfirm :title="$t('common.confirmDelete')" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button type="danger" link size="small">{{ $t('common.delete') }}</el-button>
            </template>
          </el-popconfirm>
        </template>
      </ProTable>
    </el-card>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" :title="$t('common.detail')" direction="rtl" size="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('log.username')">{{ detailData.username }}</el-descriptions-item>
        <el-descriptions-item :label="$t('log.module')">{{ detailData.module }}</el-descriptions-item>
        <el-descriptions-item :label="$t('log.action')">{{ detailData.action }}</el-descriptions-item>
        <el-descriptions-item :label="$t('log.method')">{{ detailData.method }}</el-descriptions-item>
        <el-descriptions-item :label="$t('log.ip')">{{ detailData.ip }}</el-descriptions-item>
        <el-descriptions-item :label="$t('log.location')">{{ detailData.location }}</el-descriptions-item>
        <el-descriptions-item :label="$t('common.status')">
          <el-tag :type="detailData.status === 1 ? 'success' : 'danger'" size="small">
            {{ detailData.status === 1 ? $t('log.operateSuccess') : $t('log.operateFailed') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.errorMsg" :label="$t('log.errorMsg')">
          <span style="color: var(--el-color-danger)">{{ detailData.errorMsg }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('log.duration')">{{ detailData.duration }}ms</el-descriptions-item>
        <el-descriptions-item :label="$t('log.params')">
          <pre class="params-pre">{{ detailData.params || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('log.operateTime')">{{ detailData.operateTime }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { SearchForm, ProTable, type SearchFormItem, type ProTableColumn } from '@/components/common'
import {
  getOperateLogs, getOperateLog, deleteOperateLog, cleanOperateLogs,
  type OperateLog, type OperateLogQuery,
} from '@/api/log'

const { t: $t } = useI18n()

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const detailVisible = ref(false)
const detailData = ref<OperateLog>({} as OperateLog)

// dateRange 只用于界面展示，请求前会转换成 startTime / endTime
const queryParams = reactive<OperateLogQuery & { dateRange?: string[] }>({
  page: 1,
  pageSize: 10,
  keyword: '',
  module: '',
  status: undefined as number | undefined,
  startTime: '',
  endTime: '',
  dateRange: [],
})

const searchItems = computed<SearchFormItem[]>(() => [
  { prop: 'keyword', label: $t('log.keyword'), type: 'input', placeholder: $t('log.keywordPlaceholder') },
  { prop: 'module', label: $t('log.module'), type: 'input' },
  {
    prop: 'status', label: $t('common.status'), type: 'select',
    options: [
      { label: $t('log.operateSuccess'), value: 1 },
      { label: $t('log.operateFailed'), value: 0 },
    ],
  },
  { prop: 'dateRange', label: $t('log.dateRange'), type: 'daterange' },
])

const columns = computed<ProTableColumn[]>(() => [
  { prop: 'username', label: $t('log.username'), minWidth: 100 },
  { prop: 'module', label: $t('log.module'), minWidth: 100 },
  { prop: 'action', label: $t('log.action'), width: 100 },
  { prop: 'ip', label: $t('log.ip'), width: 140 },
  { prop: 'location', label: $t('log.location'), width: 120 },
  {
    prop: 'status', label: $t('common.status'), width: 100, tag: true,
    tagMap: {
      1: { label: $t('log.operateSuccess'), type: 'success' },
      0: { label: $t('log.operateFailed'), type: 'danger' },
    },
  },
  { prop: 'duration', label: $t('log.duration'), width: 100 },
  { prop: 'operateTime', label: $t('log.operateTime'), width: 180, dateFormat: 'YYYY-MM-DD HH:mm:ss' },
])

async function loadData() {
  loading.value = true
  try {
    // dateRange 不是接口字段，不能发给后端
    const params: Record<string, any> = { ...queryParams }
    delete params.dateRange
    const res = await getOperateLogs(params)
    tableData.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (error) {
    console.error('Failed to load operate logs:', error)
  } finally {
    loading.value = false
  }
}

/** 搜索：日期区间转换 + 回到第一页 */
function handleSearch() {
  const [start, end] = queryParams.dateRange ?? []
  queryParams.startTime = start || ''
  queryParams.endTime = end || ''
  queryParams.page = 1
  loadData()
}

function handleReset() {
  queryParams.keyword = ''
  queryParams.module = ''
  queryParams.status = undefined
  queryParams.startTime = ''
  queryParams.endTime = ''
  queryParams.dateRange = []
  queryParams.page = 1
  loadData()
}

function handlePageChange(page: number) {
  queryParams.page = page
  loadData()
}

function handleSizeChange(size: number) {
  queryParams.pageSize = size
  queryParams.page = 1
  loadData()
}

async function handleDetail(row: OperateLog) {
  try {
    const res = await getOperateLog(row.id)
    detailData.value = res.data
    detailVisible.value = true
  } catch (error) {
    console.error('Load operate log detail failed:', error)
  }
}

async function handleDelete(id: number) {
  try {
    await deleteOperateLog(id)
    ElMessage.success($t('common.deleteSuccess'))
    loadData()
  } catch (error) {
    console.error('Delete operate log failed:', error)
  }
}

async function handleClean() {
  try {
    await cleanOperateLogs()
    ElMessage.success($t('common.deleteSuccess'))
    loadData()
  } catch (error) {
    console.error('Clean operate logs failed:', error)
  }
}

async function handleBatchDelete(rows: any[]) {
  if (!rows.length) return

  // 批量删除属于不可逆操作，必须先确认
  try {
    await ElMessageBox.confirm($t('common.confirmBatchDelete'), $t('common.tips'), {
      confirmButtonText: $t('common.confirm'),
      cancelButtonText: $t('common.cancel'),
      type: 'warning',
    })
  } catch {
    return
  }

  try {
    await Promise.all(rows.map((row) => deleteOperateLog(row.id)))
    ElMessage.success($t('common.deleteSuccess'))
    loadData()
  } catch (error) {
    console.error('Batch delete operate logs failed:', error)
  }
}

loadData().catch(() => {})
</script>

<style scoped>
.operate-log-page {
  padding: 0;
}

.table-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.params-pre {
  margin: 0;
  padding: 8px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
