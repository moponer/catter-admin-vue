<template>
  <div class="login-log-page">
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
        :show-actions="false"
        :show-column-setting="false"
        @search="handleSearch"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        @batch-delete="handleBatchDelete"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { SearchForm, ProTable, type SearchFormItem, type ProTableColumn } from '@/components/common'
import { getLoginLogs, cleanLoginLogs, deleteLoginLog, type LoginLogQuery } from '@/api/log'

const { t: $t } = useI18n()

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)

// dateRange 只用于界面展示，请求前会转换成 startTime / endTime
const queryParams = reactive<LoginLogQuery & { dateRange?: string[] }>({
  page: 1,
  pageSize: 10,
  keyword: '',
  status: undefined as number | undefined,
  startTime: '',
  endTime: '',
  dateRange: [],
})

const searchItems = computed<SearchFormItem[]>(() => [
  { prop: 'keyword', label: $t('log.keyword'), type: 'input', placeholder: $t('log.keywordPlaceholder') },
  {
    prop: 'status', label: $t('common.status'), type: 'select',
    options: [
      { label: $t('log.loginSuccess'), value: 1 },
      { label: $t('log.loginFailed'), value: 0 },
    ],
  },
  { prop: 'dateRange', label: $t('log.dateRange'), type: 'daterange' },
])

const columns = computed<ProTableColumn[]>(() => [
  { prop: 'username', label: $t('log.username'), minWidth: 120 },
  { prop: 'ip', label: $t('log.ip'), width: 140 },
  { prop: 'location', label: $t('log.location'), width: 120 },
  { prop: 'browser', label: $t('log.browser'), width: 130 },
  { prop: 'os', label: $t('log.os'), width: 130 },
  {
    prop: 'status', label: $t('common.status'), width: 100, tag: true,
    tagMap: {
      1: { label: $t('log.loginSuccess'), type: 'success' },
      0: { label: $t('log.loginFailed'), type: 'danger' },
    },
  },
  { prop: 'message', label: $t('log.message'), minWidth: 120 },
  { prop: 'loginTime', label: $t('log.loginTime'), width: 180, dateFormat: 'YYYY-MM-DD HH:mm:ss' },
])

async function loadData() {
  loading.value = true
  try {
    // dateRange 不是接口字段，不能发给后端
    const params: Record<string, any> = { ...queryParams }
    delete params.dateRange
    const res = await getLoginLogs(params)
    tableData.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (error) {
    console.error('Failed to load login logs:', error)
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

async function handleClean() {
  try {
    await cleanLoginLogs()
    ElMessage.success($t('common.deleteSuccess'))
    loadData()
  } catch (error) {
    console.error('Clean login logs failed:', error)
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
    await Promise.all(rows.map((row) => deleteLoginLog(row.id)))
    ElMessage.success($t('common.deleteSuccess'))
    loadData()
  } catch (error) {
    console.error('Batch delete login logs failed:', error)
  }
}

loadData().catch(() => {})
</script>

<style scoped>
.login-log-page {
  padding: 0;
}

.table-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
</style>
