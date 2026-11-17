<template>
  <div class="file-upload">
    <el-upload
      ref="uploadRef"
      :action="action"
      :headers="headers"
      :accept="accept"
      :limit="limit"
      :multiple="multiple"
      :disabled="disabled"
      :drag="drag"
      :auto-upload="autoUpload"
      :file-list="fileList"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-exceed="handleExceed"
      :before-upload="handleBeforeUpload"
    >
      <slot>
        <el-button type="primary" :icon="Upload" :disabled="disabled">
          {{ $t('common.upload') }}
        </el-button>
      </slot>
      <template #tip>
        <div v-if="tip" class="upload-tip">{{ tip }}</div>
      </template>
    </el-upload>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="previewVisible"
      :url-list="[previewUrl]"
      @close="previewVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadFile, UploadRawFile } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/modules/user'

const { t: $t } = useI18n()

const props = withDefaults(
  defineProps<{
    action?: string
    accept?: string
    limit?: number
    maxSize?: number // MB
    multiple?: boolean
    disabled?: boolean
    drag?: boolean
    autoUpload?: boolean
    modelValue?: string[]
    tip?: string
    /** 允许的扩展名白名单（为空表示不限制，但始终拦截可执行/可注入类型） */
    allowedExtensions?: string[]
  }>(),
  {
    action: '/api/upload',
    accept: '',
    limit: 5,
    maxSize: 10,
    multiple: false,
    disabled: false,
    drag: false,
    autoUpload: true,
    modelValue: () => [],
    tip: '',
    allowedExtensions: () => [],
  }
)

// 这些类型可能被浏览器直接执行（同源托管时构成存储型 XSS），默认一律拒绝
const BLOCKED_EXTENSIONS = ['html', 'htm', 'xhtml', 'svg', 'js', 'mjs', 'jsp', 'php', 'exe', 'msi', 'bat', 'cmd', 'com', 'scr', 'sh', 'ps1']

const emit = defineEmits<{
  (e: 'update:modelValue', urls: string[]): void
  (e: 'success', file: UploadFile): void
}>()

const uploadRef = ref()
const previewVisible = ref(false)
const previewUrl = ref('')

const headers = computed(() => {
  const userStore = useUserStore()
  return { Authorization: `Bearer ${userStore.token}` }
})

const fileList = computed(() =>
  props.modelValue.map((url, idx) => ({
    name: url.split('/').pop() || `file-${idx}`,
    url,
    status: 'success' as const,
  }))
)

function handleBeforeUpload(rawFile: UploadRawFile) {
  // accept 只是浏览器侧的提示，必须在提交前自行校验类型
  const name = rawFile.name || ''
  const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : ''

  if (BLOCKED_EXTENSIONS.includes(ext)) {
    ElMessage.error($t('common.fileTypeInvalid'))
    return false
  }

  if (props.allowedExtensions.length && !props.allowedExtensions.includes(ext)) {
    ElMessage.error($t('common.fileTypeInvalid'))
    return false
  }

  if (props.maxSize && rawFile.size / 1024 / 1024 > props.maxSize) {
    ElMessage.error($t('common.fileSizeExceed', { size: props.maxSize }))
    return false
  }
  return true
}

function handleSuccess(response: any, file: UploadFile) {
  const url = response?.data?.url || response?.url
  if (url) {
    const newUrls = [...props.modelValue, url]
    emit('update:modelValue', newUrls)
    emit('success', file)
  }
}

function handleError() {
  ElMessage.error($t('common.uploadFailed'))
}

function handleRemove(file: UploadFile) {
  const url = file.url || (file.response as any)?.data?.url
  const newUrls = props.modelValue.filter((u) => u !== url)
  emit('update:modelValue', newUrls)
}

function handlePreview(file: UploadFile) {
  const url = file.url || (file.response as any)?.data?.url
  if (url && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)) {
    previewUrl.value = url
    previewVisible.value = true
  } else {
    window.open(url, '_blank')
  }
}

function handleExceed() {
  ElMessage.warning($t('common.fileLimitExceed', { limit: props.limit }))
}
</script>

<style scoped>
.upload-tip {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-top: 4px;
}
</style>
