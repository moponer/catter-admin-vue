<template>
  <div class="file-page">
    <SearchForm
      :model-value="queryParams"
      :items="searchItems"
      @update:model-value="(value: Record<string, any>) => Object.assign(queryParams, value)"
      @search="handleSearch"
      @reset="handleReset"
    />

    <el-card shadow="never">
      <div class="table-toolbar">
        <el-button type="primary" :icon="Upload" @click="uploadVisible = true">
          {{ $t('common.upload') }}
        </el-button>
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
        <template #name="{ row }">
          <div class="file-name-cell">
            <el-icon :size="20" :color="getFileIconColor(row.type)">
              <component :is="getFileIcon(row.type)" />
            </el-icon>
            <span>{{ row.name }}</span>
          </div>
        </template>
        <template #size="{ row }">
          {{ formatFileSize(row.size) }}
        </template>
        <template #actions="{ row }">
          <el-button type="primary" link size="small" @click="handlePreview(row)">
            {{ $t('common.preview') }}
          </el-button>
          <el-button type="primary" link size="small" @click="handleCopyUrl(row.url)">
            {{ $t('file.copyUrl') }}
          </el-button>
          <el-popconfirm :title="$t('common.confirmDelete')" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button type="danger" link size="small">{{ $t('common.delete') }}</el-button>
            </template>
          </el-popconfirm>
        </template>
      </ProTable>
    </el-card>

    <!-- 上传弹窗 -->
    <el-dialog v-model="uploadVisible" :title="$t('common.upload')" width="600px" destroy-on-close>
      <FileUpload
        v-model="uploadedUrls"
        :limit="10"
        drag
        :tip="$t('file.uploadTip')"
        @success="handleUploadSuccess"
      />
      <template #footer>
        <el-button @click="uploadVisible = false">{{ $t('common.close') }}</el-button>
      </template>
    </el-dialog>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="previewVisible"
      :url-list="[previewUrl]"
      @close="previewVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Upload, Document, Picture, VideoCamera, Headset, FolderOpened } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { SearchForm, ProTable, FileUpload, type SearchFormItem, type ProTableColumn } from '@/components/common'
import { getFiles, deleteFile, batchDeleteFiles, type FileQuery } from '@/api/file'
import { formatFileSize } from '@/utils/format'
import { clipboard } from '@/utils/clipboard'

const { t: $t } = useI18n()

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const uploadVisible = ref(false)
const uploadedUrls = ref<string[]>([])
const previewVisible = ref(false)
const previewUrl = ref('')

const queryParams = reactive<FileQuery>({
  page: 1,
  pageSize: 10,
  keyword: '',
  type: '',
  storageType: '',
})

const searchItems = computed<SearchFormItem[]>(() => [
  { prop: 'keyword', label: $t('file.fileName'), type: 'input' },
  {
    prop: 'type', label: $t('file.fileType'), type: 'select',
    options: [
      { label: $t('file.image'), value: 'image' },
      { label: $t('file.document'), value: 'document' },
      { label: $t('file.video'), value: 'video' },
      { label: $t('file.audio'), value: 'audio' },
      { label: $t('file.archive'), value: 'archive' },
    ],
  },
])

const columns = computed<ProTableColumn[]>(() => [
  { prop: 'name', label: $t('file.fileName'), minWidth: 200, slot: true },
  { prop: 'size', label: $t('file.fileSize'), width: 120, slot: true },
  { prop: 'type', label: $t('file.fileType'), width: 100 },
  { prop: 'storageType', label: $t('file.storageType'), width: 100 },
  { prop: 'createTime', label: $t('common.createTime'), width: 180, dateFormat: 'YYYY-MM-DD HH:mm:ss' },
])

// 文件图标映射
function getFileIcon(type: string) {
  const map: Record<string, any> = { image: Picture, video: VideoCamera, audio: Headset, archive: FolderOpened }
  return map[type] || Document
}

function getFileIconColor(type: string) {
  const map: Record<string, string> = { image: 'var(--admin-primary)', video: '#E6A23C', audio: '#67C23A', document: '#909399', archive: '#F56C6C' }
  return map[type] || '#909399'
}

function handlePreview(row: any) {
  // 只允许 http(s) / blob / 站内相对路径，避免 row.url 被构造成 javascript: 伪协议
  const url = String(row.url || '')
  const isSafe = /^https?:\/\//i.test(url) || /^blob:/i.test(url) || (url.startsWith('/') && !url.startsWith('//'))
  if (!isSafe) {
    ElMessage.error($t('common.fileTypeInvalid'))
    return
  }

  if (row.type === 'image') {
    previewUrl.value = url
    previewVisible.value = true
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

async function handleCopyUrl(url: string) {
  await clipboard.copy(url, false)
  ElMessage.success($t('file.copySuccess'))
}

async function handleDelete(id: number) {
  try {
    await deleteFile(id)
    ElMessage.success($t('common.deleteSuccess'))
    loadData()
  } catch (error) {
    console.error('Delete file failed:', error)
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
    await batchDeleteFiles(rows.map((r) => r.id))
    ElMessage.success($t('common.deleteSuccess'))
    loadData()
  } catch (error) {
    console.error('Batch delete files failed:', error)
  }
}

function handleUploadSuccess() {
  // 上传成功后刷新列表
  loadData()
}

/** 搜索：回到第一页，否则可能停在过滤后的空页 */
function handleSearch() {
  queryParams.page = 1
  loadData()
}

function handleReset() {
  queryParams.keyword = ''
  queryParams.type = ''
  queryParams.storageType = ''
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

async function loadData() {
  loading.value = true
  try {
    const res = await getFiles(queryParams)
    tableData.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (error) {
    console.error('Failed to load files:', error)
  } finally {
    loading.value = false
  }
}

loadData().catch(() => {})
</script>

<style scoped>
.file-page {
  padding: 0;
}

.table-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
