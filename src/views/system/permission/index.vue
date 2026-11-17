<template>
  <div class="permission-page">
    <el-card shadow="never">
      <div class="table-toolbar">
        <el-button type="primary" :icon="Plus" @click="handleAdd()">
          {{ $t('common.add') }}
        </el-button>
        <el-button :icon="Sort" @click="toggleExpandAll">
          {{ isExpandAll ? $t('common.collapseAll') : $t('common.expandAll') }}
        </el-button>
      </div>

      <el-table
        v-if="refreshTable"
        v-loading="loading"
        :data="permTree"
        row-key="id"
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children' }"
        border
      >
        <el-table-column prop="name" :label="$t('permission.name')" min-width="200" />
        <el-table-column prop="code" :label="$t('permission.code')" min-width="180" />
        <el-table-column prop="type" :label="$t('permission.type')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="(typeTagMap[(row as any).type]?.type || '') as any" size="small">
              {{ typeTagMap[(row as any).type]?.label || (row as any).type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" :label="$t('permission.path')" min-width="160" />
        <el-table-column prop="icon" :label="$t('permission.icon')" width="100" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="sort" :label="$t('permission.sort')" width="80" align="center" />
        <el-table-column prop="status" :label="$t('common.status')" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? $t('common.enabled') : $t('common.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.actions')" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-if="row.type !== 'button'" type="primary" link size="small" @click="handleAdd(row)">
              {{ $t('common.add') }}
            </el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              {{ $t('common.edit') }}
            </el-button>
            <el-popconfirm :title="$t('common.confirmDelete')" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" link size="small">{{ $t('common.delete') }}</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item :label="$t('permission.type')" prop="type">
          <el-radio-group v-model="formData.type" @change="handleTypeChange">
            <el-radio value="menu">{{ $t('permission.menuType') }}</el-radio>
            <el-radio value="button">{{ $t('permission.buttonType') }}</el-radio>
            <el-radio value="api">{{ $t('permission.apiType') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('permission.parentName')" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="permTreeOptions"
            :props="({ label: 'name', value: 'id', children: 'children' }) as any"
            check-strictly
            filterable
            :placeholder="$t('permission.parentPlaceholder')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('permission.name')" prop="name">
          <el-input v-model="formData.name" :placeholder="$t('permission.namePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('permission.code')" prop="code">
          <el-input v-model="formData.code" :placeholder="$t('permission.codePlaceholder')" />
        </el-form-item>
        <el-form-item v-if="formData.type === 'menu'" :label="$t('permission.path')" prop="path">
          <el-input v-model="formData.path" :placeholder="$t('permission.pathPlaceholder')" />
        </el-form-item>
        <el-form-item v-if="formData.type === 'menu'" :label="$t('permission.icon')" prop="icon">
          <el-input v-model="formData.icon" :placeholder="$t('permission.iconPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('permission.sort')" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item :label="$t('common.status')" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">{{ $t('common.enabled') }}</el-radio>
            <el-radio :value="0">{{ $t('common.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Sort } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import {
  getPermissionTree, createPermission, updatePermission, deletePermission,
  type Permission, type PermissionForm,
} from '@/api/permission'

const { t: $t } = useI18n()

const loading = ref(false)
const permTree = ref<Permission[]>([])
const isExpandAll = ref(true)
const refreshTable = ref(true)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const typeTagMap = computed(() => ({
  menu: { label: $t('permission.menuType'), type: '' },
  button: { label: $t('permission.buttonType'), type: 'warning' },
  api: { label: $t('permission.apiType'), type: 'info' },
} as Record<string, { label: string; type: string }>))

const defaultForm = (): PermissionForm => ({
  id: undefined, name: '', code: '', type: 'menu', parentId: 0, path: '', icon: '', sort: 0, status: 1,
})
const formData = ref<PermissionForm>(defaultForm())
const isEdit = computed(() => !!formData.value.id)
const dialogTitle = computed(() =>
  (isEdit.value ? $t('common.edit') : $t('common.add')) + $t('permission.title')
)

// 编辑时排除自己及自己的子孙，避免 parentId 形成环
function excludeSubtree(nodes: Permission[], excludeId: number): Permission[] {
  return nodes
    .filter((node) => node.id !== excludeId)
    .map((node) => ({
      ...node,
      children: node.children?.length ? excludeSubtree(node.children, excludeId) : [],
    }))
}

const permTreeOptions = computed(() => {
  const excludeId = formData.value.id
  const source = excludeId ? excludeSubtree(permTree.value, excludeId) : permTree.value
  return [{ id: 0, name: $t('permission.rootNode'), children: source }]
})

const formRules = computed<FormRules>(() => ({
  name: [{ required: true, message: $t('permission.nameRequired'), trigger: 'blur' }],
  code: [{ required: true, message: $t('permission.codeRequired'), trigger: 'blur' }],
  type: [{ required: true, message: $t('permission.typeRequired'), trigger: 'change' }],
}))

function handleTypeChange() {
  if (formData.value.type !== 'menu') {
    formData.value.path = ''
    formData.value.icon = ''
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await getPermissionTree()
    permTree.value = res.data || []
  } catch (error) {
    console.error('Failed to load permissions:', error)
  } finally {
    loading.value = false
  }
}

function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  requestAnimationFrame(() => { refreshTable.value = true })
}

function handleAdd(row?: Permission) {
  formData.value = defaultForm()
  if (row) {
    formData.value.parentId = row.id
    // 自动推导 code 前缀
    if (row.code) formData.value.code = row.code + ':'
  }
  dialogVisible.value = true
}

function handleEdit(row: Permission) {
  formData.value = { ...row }
  dialogVisible.value = true
}

async function handleDelete(id: number) {
  try {
    await deletePermission(id)
    ElMessage.success($t('common.deleteSuccess'))
    loadData()
  } catch (error) {
    console.error('Delete permission failed:', error)
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (isEdit.value) await updatePermission(formData.value.id!, formData.value)
    else await createPermission(formData.value)
    ElMessage.success($t('common.saveSuccess'))
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('Submit permission failed:', error)
  } finally {
    submitLoading.value = false
  }
}

loadData()
</script>

<style scoped>
.permission-page {
  padding: 0;
}

.table-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
</style>
