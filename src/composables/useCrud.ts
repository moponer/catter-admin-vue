import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'

interface UseCrudOptions<T = any> {
  /** 创建 API */
  createFn: (data: T) => Promise<any>
  /** 更新 API */
  updateFn: (data: T) => Promise<any>
  /** 删除 API */
  deleteFn: (ids: number | number[]) => Promise<any>
  /** 表单初始值工厂函数 */
  initForm: () => T
  /** 刷新列表回调 */
  refreshFn: () => void
}

export function useCrud<T extends Record<string, any>>(options: UseCrudOptions<T>) {
  const { createFn, updateFn, deleteFn, initForm, refreshFn } = options
  const { t: $t } = useI18n()

  // 弹窗状态
  const dialogVisible = ref(false)
  const dialogType = ref<'create' | 'update'>('create')
  const submitLoading = ref(false)
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive(initForm()) as T

  // 打开新增弹窗
  function openCreate() {
    dialogType.value = 'create'
    resetForm()
    dialogVisible.value = true
  }

  // 打开编辑弹窗
  function openUpdate(row: T) {
    dialogType.value = 'update'
    // 先重置为初始值，避免上一行残留的字段（例如 password）被一起提交
    resetForm()
    Object.assign(formData, { ...row })
    dialogVisible.value = true
  }

  /** 把表单重置为初始值（同时清掉校验状态） */
  function resetForm() {
    Object.keys(formData as Record<string, any>).forEach((key) => {
      delete (formData as Record<string, any>)[key]
    })
    Object.assign(formData, initForm())
    formRef.value?.clearValidate()
  }

  // 提交表单
  async function handleSubmit() {
    if (submitLoading.value) return

    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    submitLoading.value = true
    try {
      if (dialogType.value === 'create') {
        await createFn(formData)
        ElMessage.success($t('common.createSuccess'))
      } else {
        await updateFn(formData)
        ElMessage.success($t('common.updateSuccess'))
      }
      dialogVisible.value = false
      refreshFn()
    } catch (error) {
      // 请求错误已由 request 拦截器提示，这里只保证 loading 复位
      console.warn('Submit failed:', error)
    } finally {
      submitLoading.value = false
    }
  }

  /** 二次确认，用户取消时返回 false（ElMessageBox 取消会 reject，不能直接 await） */
  async function confirm(message: string): Promise<boolean> {
    try {
      await ElMessageBox.confirm(message, $t('common.tips'), {
        confirmButtonText: $t('common.confirm'),
        cancelButtonText: $t('common.cancel'),
        type: 'warning',
      })
      return true
    } catch {
      return false
    }
  }

  // 单条删除
  async function handleDelete(id: number) {
    if (!(await confirm($t('common.confirmDelete')))) return
    try {
      await deleteFn(id)
      ElMessage.success($t('common.deleteSuccess'))
      refreshFn()
    } catch (error) {
      console.warn('Delete failed:', error)
    }
  }

  // 批量删除
  async function handleBatchDelete(ids: number[]) {
    if (!ids.length) return
    if (!(await confirm($t('common.confirmBatchDelete')))) return
    try {
      await deleteFn(ids)
      ElMessage.success($t('common.deleteSuccess'))
      refreshFn()
    } catch (error) {
      console.warn('Batch delete failed:', error)
    }
  }

  return {
    dialogVisible,
    dialogType,
    submitLoading,
    formRef,
    formData,
    openCreate,
    openUpdate,
    resetForm,
    handleSubmit,
    handleDelete,
    handleBatchDelete,
  }
}
