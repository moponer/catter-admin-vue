<template>
  <div class="dept-page">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-input
        v-model="filterText"
        :placeholder="$t('dept.searchPlaceholder')"
        clearable
        style="width: 300px"
        :prefix-icon="Search"
      />
    </el-card>

    <!-- 操作栏 -->
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <el-button type="primary" :icon="Plus" @click="handleAdd()">
          {{ $t('common.add') }}
        </el-button>
        <el-button :icon="Sort" @click="toggleExpandAll">
          {{ isExpandAll ? $t('common.collapseAll') : $t('common.expandAll') }}
        </el-button>
      </div>

      <!-- 树形表格 -->
      <el-table
        v-if="refreshTable"
        v-loading="loading"
        :data="deptTree"
        row-key="id"
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children' }"
        border
      >
        <el-table-column prop="name" :label="$t('dept.name')" min-width="200" />
        <el-table-column prop="leader" :label="$t('dept.leader')" width="120" />
        <el-table-column prop="phone" :label="$t('dept.phone')" width="140" />
        <el-table-column prop="sort" :label="$t('dept.sort')" width="80" align="center" />
        <el-table-column prop="status" :label="$t('dept.status')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? $t('common.enabled') : $t('common.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('common.createTime')" width="180" />
        <el-table-column :label="$t('common.actions')" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-permission="['system:dept:add']" type="primary" link size="small" @click="handleAdd(row)">
              {{ $t('common.add') }}
            </el-button>
            <el-button v-permission="['system:dept:edit']" type="primary" link size="small" @click="handleEdit(row)">
              {{ $t('common.edit') }}
            </el-button>
            <el-popconfirm
              :title="$t('common.confirmDelete')"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button v-permission="['system:dept:del']" type="danger" link size="small">
                  {{ $t('common.delete') }}
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item :label="$t('dept.parentName')" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="deptTreeOptions"
            :props="({ label: 'name', value: 'id', children: 'children' }) as any"
            check-strictly
            filterable
            :placeholder="$t('dept.parentPlaceholder')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('dept.name')" prop="name">
          <el-input v-model="formData.name" :placeholder="$t('dept.namePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('dept.sort')" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item :label="$t('dept.leader')" prop="leader">
          <el-input v-model="formData.leader" :placeholder="$t('dept.leaderPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('dept.phone')" prop="phone">
          <el-input v-model="formData.phone" :placeholder="$t('dept.phonePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('dept.email')" prop="email">
          <el-input v-model="formData.email" :placeholder="$t('dept.emailPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('dept.status')" prop="status">
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
import { ref, computed, watch } from 'vue'
import { Plus, Search, Sort } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { getDeptTree, createDept, updateDept, deleteDept, type Dept, type DeptForm } from '@/api/dept'

const { t: $t } = useI18n()

// 状态
const loading = ref(false)
// deptTree 是「展示用」数据（可能被过滤），allDepts 保存完整树
const deptTree = ref<Dept[]>([])
const allDepts = ref<Dept[]>([])
const filterText = ref('')
const isExpandAll = ref(true)
const refreshTable = ref(true)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const defaultForm = (): DeptForm => ({
  id: undefined,
  name: '',
  parentId: 0,
  sort: 0,
  leader: '',
  phone: '',
  email: '',
  status: 1,
})

const formData = ref<DeptForm>(defaultForm())
const isEdit = computed(() => !!formData.value.id)
const dialogTitle = computed(() => (isEdit.value ? $t('common.edit') : $t('common.add')) + $t('dept.title'))

// 编辑时不能把父级选成自己或自己的子孙，否则会形成环
function excludeSubtree(nodes: Dept[], excludeId: number): Dept[] {
  return nodes
    .filter((node) => node.id !== excludeId)
    .map((node) => ({
      ...node,
      children: node.children?.length ? excludeSubtree(node.children, excludeId) : [],
    }))
}

const deptTreeOptions = computed(() => {
  const excludeId = formData.value.id
  const source = excludeId ? excludeSubtree(allDepts.value, excludeId) : allDepts.value
  return [{ id: 0, name: $t('dept.rootNode'), children: source }]
})

// 校验规则
const formRules = computed<FormRules>(() => ({
  name: [{ required: true, message: $t('dept.nameRequired'), trigger: 'blur' }],
  parentId: [{ required: true, message: $t('dept.parentRequired'), trigger: 'change' }],
}))

/** 树形过滤：命中节点或其子孙命中时保留整条链路 */
function filterTree(nodes: Dept[], keyword: string): Dept[] {
  const lower = keyword.toLowerCase()
  const result: Dept[] = []

  for (const node of nodes) {
    const children = node.children?.length ? filterTree(node.children, keyword) : []
    const matched = String(node.name || '')
      .toLowerCase()
      .includes(lower)

    if (matched || children.length) {
      result.push({ ...node, children })
    }
  }

  return result
}

// 搜索过滤（客户端过滤，不会破坏原始数据）
watch(filterText, (value) => {
  deptTree.value = value ? filterTree(allDepts.value, value) : allDepts.value
})

// 加载数据
async function loadData() {
  loading.value = true
  try {
    const res = await getDeptTree()
    allDepts.value = res.data || []
    deptTree.value = filterText.value ? filterTree(allDepts.value, filterText.value) : allDepts.value
  } catch (error) {
    console.error('Failed to load departments:', error)
  } finally {
    loading.value = false
  }
}

// 展开/折叠
function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  // 重新渲染表格以应用 default-expand-all
  requestAnimationFrame(() => {
    refreshTable.value = true
  })
}

// 新增
function handleAdd(row?: Dept) {
  formData.value = defaultForm()
  if (row) {
    formData.value.parentId = row.id
  }
  dialogVisible.value = true
}

// 编辑
function handleEdit(row: Dept) {
  formData.value = {
    id: row.id,
    name: row.name,
    parentId: row.parentId,
    sort: row.sort,
    leader: row.leader || '',
    phone: row.phone || '',
    email: row.email || '',
    status: row.status,
  }
  dialogVisible.value = true
}

// 删除
async function handleDelete(id: number) {
  try {
    await deleteDept(id)
    ElMessage.success($t('common.deleteSuccess'))
    loadData()
  } catch (error) {
    console.error('Delete department failed:', error)
  }
}

// 提交
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateDept(formData.value.id!, formData.value)
    } else {
      await createDept(formData.value)
    }
    ElMessage.success($t('common.saveSuccess'))
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('Submit department failed:', error)
  } finally {
    submitLoading.value = false
  }
}

// 初始化
loadData().catch(() => {})
</script>

<style scoped>
.dept-page {
  padding: 0;
}

.search-card {
  margin-bottom: 16px;
}

.search-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.table-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
</style>
