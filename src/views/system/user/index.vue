<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ $t('menu.user') }}</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        {{ $t('common.create') }}
      </el-button>
    </div>

    <!-- 搜索表单 -->
    <el-card shadow="hover">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item :label="$t('user.username')">
          <el-input
            v-model="queryParams.keyword"
            :placeholder="$t('user.placeholder.username')"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item :label="$t('user.status')">
          <el-select v-model="queryParams.status" clearable :placeholder="$t('common.all')">
            <el-option :label="$t('user.enabled')" :value="1" />
            <el-option :label="$t('user.disabled')" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            {{ $t('common.search') }}
          </el-button>
          <el-button @click="handleReset">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="hover" style="margin-top: 16px">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="id" :label="$t('common.index')" width="80" align="center" />
        <el-table-column prop="username" :label="$t('user.username')" min-width="120" />
        <el-table-column prop="nickname" :label="$t('user.nickname')" min-width="120" />
        <el-table-column prop="email" :label="$t('user.email')" min-width="180" show-overflow-tooltip />
        <el-table-column prop="phone" :label="$t('user.phone')" width="130" />
        <el-table-column prop="status" :label="$t('user.status')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? $t('user.enabled') : $t('user.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="roles" :label="$t('user.role')" width="120">
          <template #default="{ row }">
            <el-tag v-for="role in row.roles" :key="role" size="small" class="role-tag">
              {{ role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('user.createTime')" width="170" />
        <el-table-column :label="$t('common.operate')" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              {{ $t('common.edit') }}
            </el-button>
            <el-popconfirm :title="$t('common.confirmDelete')" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger">{{ $t('common.delete') }}</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('common.edit') : $t('common.create')"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item :label="$t('user.username')" prop="username">
          <el-input v-model="formData.username" :disabled="isEdit" :placeholder="$t('user.placeholder.username')" />
        </el-form-item>
        <el-form-item :label="$t('user.nickname')" prop="nickname">
          <el-input v-model="formData.nickname" :placeholder="$t('user.placeholder.nickname')" />
        </el-form-item>
        <el-form-item :label="$t('user.email')" prop="email">
          <el-input v-model="formData.email" :placeholder="$t('user.placeholder.email')" />
        </el-form-item>
        <el-form-item :label="$t('user.phone')" prop="phone">
          <el-input v-model="formData.phone" :placeholder="$t('user.placeholder.phone')" />
        </el-form-item>
        <el-form-item v-if="!isEdit" :label="$t('login.password')" prop="password">
          <el-input v-model="formData.password" type="password" show-password :placeholder="$t('user.placeholder.password')" />
        </el-form-item>
        <el-form-item :label="$t('user.status')" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">{{ $t('user.enabled') }}</el-radio>
            <el-radio :value="0">{{ $t('user.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ $t('common.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/user'

const { t: $t } = useI18n()

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  status: undefined as number | undefined,
})

// 表格数据
const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive({
  id: undefined as number | undefined,
  username: '',
  nickname: '',
  email: '',
  phone: '',
  password: '',
  status: 1,
  roles: [] as string[],
})

const formRules: FormRules = {
  username: [{ required: true, message: $t('user.usernameRequired'), trigger: 'blur' }],
  nickname: [{ required: true, message: $t('user.nicknameRequired'), trigger: 'blur' }],
  email: [{ required: true, type: 'email', message: $t('user.emailRequired'), trigger: 'blur' }],
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getUsers(queryParams)
    tableData.value = res.data?.list ?? []
    total.value = res.data?.total ?? 0
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.page = 1
  loadData()
}

// 每页条数变化 → 回到第一页
const handleSizeChange = () => {
  queryParams.page = 1
  loadData()
}

// 页码变化（v-model 已同步）
const handlePageChange = () => {
  loadData()
}

// 重置
const handleReset = () => {
  queryParams.keyword = ''
  queryParams.status = undefined
  handleSearch()
}

// 创建
const handleCreate = () => {
  isEdit.value = false
  Object.assign(formData, { id: undefined, username: '', nickname: '', email: '', phone: '', password: '', status: 1 })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    email: row.email,
    phone: row.phone,
    password: '',
    status: row.status,
  })
  dialogVisible.value = true
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value || submitting.value) return

  // validate() 校验失败会 reject，必须捕获，否则会冒泡成未处理的 Promise 异常
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value && formData.id) {
      await updateUser(formData.id, formData)
    } else {
      await createUser(formData)
    }
    ElMessage.success(isEdit.value ? $t('common.updateSuccess') : $t('common.createSuccess'))
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('Submit failed:', error)
  } finally {
    submitting.value = false
  }
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await deleteUser(row.id)
    ElMessage.success($t('common.deleteSuccess'))
    loadData()
  } catch (error) {
    console.error('Delete failed:', error)
  }
}

onMounted(() => {
  loadData().catch(() => {})
})
</script>

<style scoped>
.search-form {
  margin-bottom: 0;
}

.role-tag {
  margin-right: 4px;
}
</style>
