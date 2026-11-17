<template>
  <div class="image-upload">
    <el-upload
      :action="action"
      :headers="headers"
      :accept="accept"
      :limit="limit"
      :multiple="multiple"
      :disabled="disabled"
      :file-list="innerFileList"
      list-type="picture-card"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-exceed="handleExceed"
      :before-upload="handleBeforeUpload"
    >
      <el-icon class="upload-icon"><Plus /></el-icon>
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
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadFile, UploadRawFile } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/modules/user'

const { t: $t } = useI18n()

const props = withDefaults(
  defineProps<{
    action?: string
    limit?: number
    maxSize?: number // MB
    multiple?: boolean
    disabled?: boolean
    modelValue?: string[]
    accept?: string
  }>(),
  {
    action: '/api/upload',
    limit: 5,
    maxSize: 5,
    multiple: false,
    disabled: false,
    modelValue: () => [],
    accept: 'image/*',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', urls: string[]): void
  (e: 'success', file: UploadFile): void
}>()

const previewVisible = ref(false)
const previewUrl = ref('')

const headers = computed(() => {
  const userStore = useUserStore()
  return { Authorization: `Bearer ${userStore.token}` }
})

const innerFileList = computed(() =>
  props.modelValue.map((url, idx) => ({
    name: url.split('/').pop() || `image-${idx}`,
    url,
    status: 'success' as const,
  }))
)

function handleBeforeUpload(rawFile: UploadRawFile) {
  if (!rawFile.type.startsWith('image/')) {
    ElMessage.error($t('common.onlyImage'))
    return false
  }

  // SVG 可以内嵌脚本，直接访问该文件时会执行，默认不接受
  if (rawFile.type === 'image/svg+xml' || /\.svg$/i.test(rawFile.name || '')) {
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
    emit('update:modelValue', [...props.modelValue, url])
    emit('success', file)
  }
}

function handleError() {
  ElMessage.error($t('common.uploadFailed'))
}

function handleRemove(file: UploadFile) {
  const url = file.url || (file.response as any)?.data?.url
  emit(
    'update:modelValue',
    props.modelValue.filter((u) => u !== url)
  )
}

function handlePreview(file: UploadFile) {
  previewUrl.value = file.url || ''
  previewVisible.value = true
}

function handleExceed() {
  ElMessage.warning($t('common.fileLimitExceed', { limit: props.limit }))
}
</script>

<style scoped>
.upload-icon {
  font-size: 28px;
  color: var(--el-text-color-placeholder);
}
</style>
