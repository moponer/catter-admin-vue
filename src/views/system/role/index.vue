<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryParams" @submit.prevent="handleSearch">
        <el-form-item :label="$t('role.name')">
          <el-input
            v-model="queryParams.keyword"
            :placeholder="$t('role.namePlaceholder')"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>{{ $t('common.search') }}
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>{{ $t('common.reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button v-permission="['system:role:add']" type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>{{ $t('common.create') }}
          </el-button>
          <el-button
            v-permission="['system:role:del']"
            type="danger"
            :disabled="!selectedIds.length"
            @click="handleBatchDelete"
          >
            <el-icon><Delete /></el-icon>{{ $t('common.batchDelete') }}
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-tooltip :content="$t('common.refresh')">
            <el-button circle @click="loadData">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="id" :label="$t('common.index')" width="80" align="center" />
        <el-table-column prop="name" :label="$t('role.name')" min-width="150" />
        <el-table-column prop="code" :label="$t('role.code')" min-width="150" />
        <el-table-column prop="description" :label="$t('role.description')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" :label="$t('user.status')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? $t('common.enabled') : $t('common.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('common.createdAt')" width="180" />
        <el-table-column :label="$t('common.operate')" width="200" align="center">
          <template #default="{ row }">
            <el-button v-permission="['system:role:edit']" link type="primary" @click="handleEdit(row)">
              {{ $t('common.edit') }}
            </el-button>
            <el-popconfirm :title="$t('common.confirmDelete')" @confirm="handleDelete(row)">
              <template #reference>
                <el-button v-permission="['system:role:del']" link type="danger">
                  {{ $t('common.delete') }}
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination-wrapper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('common.edit') : $t('common.create')"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <el-form-item :label="$t('role.name')" prop="name">
          <el-input v-model="formData.name" :placeholder="$t('role.namePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('role.code')" prop="code">
          <el-input v-model="formData.code" :disabled="isEdit" :placeholder="$t('role.codePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('role.description')" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" :placeholder="$t('role.descriptionPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('user.status')" prop="status">
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getRoleList, createRole, updateRole, deleteRole, deleteRoleBatch, type Role, type RoleForm } from '@/api/role'

const { t: $t } = useI18n()

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
})

// 表格数据
const loading = ref(false)
const tableData = ref<Role[]>([])
const total = ref(0)

// 选中
const selectedIds = ref<number[]>([])
function handleSelectionChange(rows: Role[]) {
  selectedIds.value = rows.map((r) => r.id)
}

// 弹窗
const dialogVisible = ref(false)
const isEdit = computed(() => !!formData.id)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const initForm = (): RoleForm => ({
  name: '',
  code: '',
  description: '',
  status: 1,
})

const formData = reactive<RoleForm>(initForm())

const formRules = computed<FormRules>(() => ({
  name: [{ required: true, message: $t('role.nameRequired'), trigger: 'blur' }],
  code: [{ required: true, message: $t('role.codeRequired'), trigger: 'blur' }],
}))

// 加载数据
async function loadData() {
  loading.value = true
  try {
    const res = await getRoleList(queryParams)
    tableData.value = res.data?.list ?? []
    total.value = res.data?.total ?? 0
  } catch (error) {
    // 错误提示由 request 拦截器统一处理，这里保证 loading 复位
    console.error('Failed to load roles:', error)
  } finally {
    loading.value = false
  }
}

// 每页条数变化后回到第一页
function handleSizeChange() {
  queryParams.page = 1
  loadData()
}

// 页码变化（v-model 已同步 queryParams.page）
function handlePageChange() {
  loadData()
}

// 搜索 & 重置
function handleSearch() {
  queryParams.page = 1
  loadData()
}

function handleReset() {
  queryParams.keyword = ''
  handleSearch()
}

// 新增
function handleCreate() {
  Object.assign(formData, initForm())
  // 必须清掉上一次编辑残留的 id，否则「新建」会变成「更新」
  formData.id = undefined
  formRef.value?.clearValidate()
  dialogVisible.value = true
}

// 编辑
function handleEdit(row: Role) {
  Object.assign(formData, { id: row.id, name: row.name, code: row.code, description: row.description, status: row.status })
  dialogVisible.value = true
}

// 提交
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateRole(formData.id!, formData)
    } else {
      await createRole(formData)
    }
    ElMessage.success(isEdit.value ? $t('common.updateSuccess') : $t('common.createSuccess'))
    dialogVisible.value = false
    loadData()
  } finally {
    submitLoading.value = false
  }
}

// 删除
async function handleDelete(row: Role) {
  try {
    await deleteRole(row.id)
    ElMessage.success($t('common.deleteSuccess'))
    selectedIds.value = []
    loadData()
  } catch (error) {
    console.error('Delete role failed:', error)
  }
}

async function handleBatchDelete() {
  if (!selectedIds.value.length) return
  try {
    await ElMessageBox.confirm($t('common.confirmBatchDelete'), $t('common.tips'), {
      confirmButtonText: $t('common.confirm'),
      cancelButtonText: $t('common.cancel'),
      type: 'warning',
    })
  } catch {
    // 用户取消
    return
  }

  try {
    await deleteRoleBatch(selectedIds.value)
    ElMessage.success($t('common.deleteSuccess'))
    // 清空选择，避免用已删除的 id 再次提交
    selectedIds.value = []
    loadData()
  } catch (error) {
    console.error('Batch delete roles failed:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.search-card :deep(.el-card__body) {
  padding-bottom: 0;
}
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--admin-spacing-md);
}
.toolbar-left {
  display: flex;
  gap: var(--admin-spacing-xs);
}
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--admin-spacing-md);
}
</style>
