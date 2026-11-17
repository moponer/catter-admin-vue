<template>
  <div class="page-container">
    <!-- 工具栏 -->
    <el-card shadow="never" class="toolbar-card">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button v-permission="['system:menu:add']" type="primary" @click="handleAdd()">
            <el-icon><Plus /></el-icon>{{ $t('menu.addMenu') }}
          </el-button>
          <el-button :icon="isExpandAll ? 'DArrowLeft' : 'DArrowRight'" @click="toggleExpandAll">
            {{ isExpandAll ? $t('common.collapseAll') : $t('common.expandAll') }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 菜单树 -->
    <el-card shadow="never">
      <el-table
        v-if="refreshTable"
        v-loading="loading"
        :data="menuTree"
        row-key="id"
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        border
      >
        <el-table-column prop="title" :label="$t('menu.name')" min-width="200">
          <template #default="{ row }">
            <div class="menu-title-cell">
              <el-icon v-if="row.icon" class="menu-icon"><component :is="row.icon" /></el-icon>
              <span>{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="icon" :label="$t('menu.icon')" width="80" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="path" :label="$t('menu.path')" min-width="180" show-overflow-tooltip />
        <el-table-column prop="component" :label="$t('menu.component')" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.component" class="component-path">{{ row.component }}</span>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" :label="$t('menu.sort')" width="80" align="center" />
        <el-table-column prop="hidden" :label="$t('menu.hidden')" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.hidden ? 'danger' : 'success'" size="small">
              {{ row.hidden ? $t('menu.yes') : $t('menu.no') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operate')" width="200" align="center">
          <template #default="{ row }">
            <el-button v-permission="['system:menu:add']" link type="primary" @click="handleAdd(row)">
              {{ $t('common.add') }}
            </el-button>
            <el-button v-permission="['system:menu:edit']" link type="primary" @click="handleEdit(row)">
              {{ $t('common.edit') }}
            </el-button>
            <el-popconfirm :title="$t('common.confirmDelete')" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button v-permission="['system:menu:del']" link type="danger">
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
      :title="isEdit ? $t('common.edit') : $t('menu.addMenu')"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item :label="$t('menu.parentName')" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="menuTreeOptions"
            :props="({ label: 'title', value: 'id', children: 'children' }) as any"
            check-strictly
            filterable
            :placeholder="$t('menu.parentPlaceholder')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('menu.name')" prop="title">
          <el-input v-model="formData.title" :placeholder="$t('menu.namePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('menu.icon')" prop="icon">
          <el-input v-model="formData.icon" :placeholder="$t('menu.iconPlaceholder')">
            <template #append>
              <el-icon v-if="formData.icon"><component :is="formData.icon" /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('menu.path')" prop="path">
          <el-input v-model="formData.path" :placeholder="$t('menu.pathPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('menu.component')" prop="component">
          <el-input v-model="formData.component" :placeholder="$t('menu.componentPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('menu.sort')" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item :label="$t('menu.hidden')" prop="hidden">
          <el-radio-group v-model="formData.hidden">
            <el-radio :value="false">{{ $t('menu.no') }}</el-radio>
            <el-radio :value="true">{{ $t('menu.yes') }}</el-radio>
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
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getMenuList, createMenu, updateMenu, deleteMenu, type Menu, type MenuForm } from '@/api/menu'

const { t: $t } = useI18n()

// 状态
const loading = ref(false)
const menuTree = ref<Menu[]>([])
const isExpandAll = ref(true)
const refreshTable = ref(true)

// 弹窗
const dialogVisible = ref(false)
const isEdit = computed(() => !!formData.id)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const defaultForm = (): MenuForm => ({
  title: '',
  name: '',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  hidden: false,
  parentId: 0,
})

const formData = reactive<MenuForm>(defaultForm())

/**
 * 父级选项：编辑时必须排除「自己 + 自己的子树」，
 * 否则可以把节点的 parentId 指向自己，形成环，递归建树/建路由时会死循环。
 */
function excludeSubtree(nodes: Menu[], excludeId: number): Menu[] {
  return nodes
    .filter((node) => node.id !== excludeId)
    .map((node) => ({
      ...node,
      children: node.children?.length ? excludeSubtree(node.children, excludeId) : [],
    }))
}

const menuTreeOptions = computed(() => [
  {
    id: 0,
    title: $t('menu.rootNode'),
    children: formData.id ? excludeSubtree(menuTree.value, formData.id) : menuTree.value,
  },
])

const formRules = computed<FormRules>(() => ({
  title: [{ required: true, message: $t('menu.nameRequired'), trigger: 'blur' }],
  path: [{ required: true, message: $t('menu.pathRequired'), trigger: 'blur' }],
}))

// 展开/折叠
function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  requestAnimationFrame(() => {
    refreshTable.value = true
  })
}

// 加载数据
async function loadData() {
  loading.value = true
  try {
    const res = await getMenuList()
    menuTree.value = res.data || []
  } catch (error) {
    console.error('Failed to load menus:', error)
  } finally {
    loading.value = false
  }
}

// 新增
function handleAdd(parent?: Menu) {
  Object.assign(formData, defaultForm())
  // 清掉上一次编辑残留的 id，否则「新增」会走到更新分支
  formData.id = undefined
  if (parent) {
    formData.parentId = parent.id
  }
  formRef.value?.clearValidate()
  dialogVisible.value = true
}

// 编辑
function handleEdit(row: Menu) {
  Object.assign(formData, {
    id: row.id,
    title: row.title,
    name: row.name || row.title,
    path: row.path,
    component: row.component || '',
    icon: row.icon || '',
    sort: row.sort,
    hidden: !!row.hidden,
    parentId: row.parentId,
  })
  dialogVisible.value = true
}

// 提交
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    // 自动同步 title → name
    formData.name = formData.title
    if (isEdit.value) {
      await updateMenu(formData.id!, formData)
    } else {
      await createMenu(formData)
    }
    ElMessage.success(isEdit.value ? $t('common.updateSuccess') : $t('common.createSuccess'))
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('Submit menu failed:', error)
  } finally {
    submitLoading.value = false
  }
}

// 删除
async function handleDelete(id: number) {
  try {
    await deleteMenu(id)
    ElMessage.success($t('common.deleteSuccess'))
    loadData()
  } catch (error) {
    console.error('Delete menu failed:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.toolbar-card {
  margin-bottom: 16px;
}
.toolbar-card :deep(.el-card__body) {
  padding: 14px 20px;
}
.table-toolbar {
  display: flex;
  gap: 8px;
}
.menu-title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.menu-icon {
  color: var(--admin-text-muted);
}
.component-path {
  font-family: monospace;
  font-size: 12px;
  color: var(--admin-text-muted);
}
.text-muted {
  color: var(--admin-text-muted);
}
</style>
