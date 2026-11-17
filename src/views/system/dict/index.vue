<template>
  <div class="dict-page">
    <el-row :gutter="16">
      <!-- 左侧：字典大类 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>{{ $t('dict.typeList') }}</span>
              <el-button type="primary" size="small" :icon="Plus" @click="handleAddType">
                {{ $t('common.add') }}
              </el-button>
            </div>
          </template>

          <!-- 搜索 -->
          <el-input
            v-model="typeQuery.keyword"
            :placeholder="$t('dict.searchPlaceholder')"
            clearable
            :prefix-icon="Search"
            style="margin-bottom: 12px"
            @keyup.enter="loadTypes"
            @clear="loadTypes"
          />

          <!-- 表格 -->
          <el-table
            v-loading="typeLoading"
            :data="typeList"
            border
            highlight-current-row
            @current-change="handleTypeSelect"
          >
            <el-table-column prop="name" :label="$t('dict.typeName')" min-width="120" />
            <el-table-column prop="code" :label="$t('dict.typeCode')" min-width="120" />
            <el-table-column prop="status" :label="$t('common.status')" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                  {{ row.status === 1 ? $t('common.enabled') : $t('common.disabled') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.actions')" width="150" fixed="right" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click.stop="handleEditType(row)">
                  {{ $t('common.edit') }}
                </el-button>
                <el-popconfirm :title="$t('common.confirmDelete')" @confirm="handleDeleteType(row.id)">
                  <template #reference>
                    <el-button type="danger" link size="small" @click.stop>
                      {{ $t('common.delete') }}
                    </el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrap">
            <el-pagination
              v-model:current-page="typeQuery.page"
              v-model:page-size="typeQuery.pageSize"
              :total="typeTotal"
              :background="true"
              layout="total, prev, pager, next"
              small
              @current-change="loadTypes"
            />
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：字典小类 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>{{ selectedType ? $t('dict.dataList') + ' - ' + selectedType.name : $t('dict.selectTypeHint') }}</span>
              <el-button
                type="primary"
                size="small"
                :icon="Plus"
                :disabled="!selectedType"
                @click="handleAddData"
              >
                {{ $t('common.add') }}
              </el-button>
            </div>
          </template>

          <el-empty v-if="!selectedType" :description="$t('dict.selectTypeHint')" :image-size="60" />

          <el-table v-else v-loading="dataLoading" :data="dataList" border>
            <el-table-column prop="label" :label="$t('dict.dataLabel')" min-width="120" />
            <el-table-column prop="value" :label="$t('dict.dataValue')" min-width="120" />
            <el-table-column prop="sort" :label="$t('dict.sort')" width="80" align="center" />
            <el-table-column prop="status" :label="$t('common.status')" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                  {{ row.status === 1 ? $t('common.enabled') : $t('common.disabled') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.actions')" width="150" fixed="right" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEditData(row)">
                  {{ $t('common.edit') }}
                </el-button>
                <el-popconfirm :title="$t('common.confirmDelete')" @confirm="handleDeleteData(row.id)">
                  <template #reference>
                    <el-button type="danger" link size="small">
                      {{ $t('common.delete') }}
                    </el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 大类弹窗 -->
    <el-dialog v-model="typeDialogVisible" :title="typeDialogTitle" width="500px" destroy-on-close>
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeFormRules" label-width="100px">
        <el-form-item :label="$t('dict.typeName')" prop="name">
          <el-input v-model="typeForm.name" :placeholder="$t('dict.typeNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('dict.typeCode')" prop="code">
          <el-input v-model="typeForm.code" :placeholder="$t('dict.typeCodePlaceholder')" :disabled="!!typeForm.id" />
        </el-form-item>
        <el-form-item :label="$t('common.status')" prop="status">
          <el-radio-group v-model="typeForm.status">
            <el-radio :value="1">{{ $t('common.enabled') }}</el-radio>
            <el-radio :value="0">{{ $t('common.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('dict.remark')" prop="remark">
          <el-input v-model="typeForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="typeSubmitLoading" @click="handleTypeSubmit">
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 小类弹窗 -->
    <el-dialog v-model="dataDialogVisible" :title="dataDialogTitle" width="500px" destroy-on-close>
      <el-form ref="dataFormRef" :model="dataForm" :rules="dataFormRules" label-width="100px">
        <el-form-item :label="$t('dict.dataLabel')" prop="label">
          <el-input v-model="dataForm.label" :placeholder="$t('dict.dataLabelPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('dict.dataValue')" prop="value">
          <el-input v-model="dataForm.value" :placeholder="$t('dict.dataValuePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('dict.sort')" prop="sort">
          <el-input-number v-model="dataForm.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item :label="$t('common.status')" prop="status">
          <el-radio-group v-model="dataForm.status">
            <el-radio :value="1">{{ $t('common.enabled') }}</el-radio>
            <el-radio :value="0">{{ $t('common.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="dataSubmitLoading" @click="handleDataSubmit">
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import {
  getDictTypes, createDictType, updateDictType, deleteDictType,
  getDictDataList, createDictData, updateDictData, deleteDictData,
  type DictType, type DictTypeForm, type DictData, type DictDataForm,
} from '@/api/dict'

const { t: $t } = useI18n()

// ========= 大类 =========
const typeLoading = ref(false)
const typeList = ref<DictType[]>([])
const typeTotal = ref(0)
const selectedType = ref<DictType | null>(null)

const typeQuery = ref({ page: 1, pageSize: 10, keyword: '', status: undefined as number | undefined })

const typeDialogVisible = ref(false)
const typeSubmitLoading = ref(false)
const typeFormRef = ref<FormInstance>()

const defaultTypeForm = (): DictTypeForm => ({
  id: undefined, name: '', code: '', status: 1, remark: '',
})
const typeForm = ref<DictTypeForm>(defaultTypeForm())
const isEditType = computed(() => !!typeForm.value.id)
const typeDialogTitle = computed(() =>
  (isEditType.value ? $t('common.edit') : $t('common.add')) + $t('dict.typeTitle')
)

const typeFormRules = computed<FormRules>(() => ({
  name: [{ required: true, message: $t('dict.typeNameRequired'), trigger: 'blur' }],
  code: [{ required: true, message: $t('dict.typeCodeRequired'), trigger: 'blur' }],
}))

async function loadTypes() {
  typeLoading.value = true
  try {
    const res = await getDictTypes(typeQuery.value)
    typeList.value = res.data?.list || []
    typeTotal.value = res.data?.total || 0
  } catch (error) {
    console.error('Failed to load dict types:', error)
  } finally {
    typeLoading.value = false
  }
}

function handleTypeSelect(row: DictType | null) {
  selectedType.value = row
  if (row) loadDataList(row.id)
  else dataList.value = []
}

function handleAddType() {
  typeForm.value = defaultTypeForm()
  typeDialogVisible.value = true
}

function handleEditType(row: DictType) {
  typeForm.value = { ...row }
  typeDialogVisible.value = true
}

async function handleDeleteType(id: number) {
  try {
    await deleteDictType(id)
    ElMessage.success($t('common.deleteSuccess'))
    if (selectedType.value?.id === id) selectedType.value = null
    loadTypes()
  } catch (error) {
    console.error('Delete dict type failed:', error)
  }
}

async function handleTypeSubmit() {
  const valid = await typeFormRef.value?.validate().catch(() => false)
  if (!valid) return

  typeSubmitLoading.value = true
  try {
    if (isEditType.value) await updateDictType(typeForm.value.id!, typeForm.value)
    else await createDictType(typeForm.value)
    ElMessage.success($t('common.saveSuccess'))
    typeDialogVisible.value = false
    loadTypes()
  } catch (error) {
    console.error('Submit dict type failed:', error)
  } finally {
    typeSubmitLoading.value = false
  }
}

// ========= 小类 =========
const dataLoading = ref(false)
const dataList = ref<DictData[]>([])

const dataDialogVisible = ref(false)
const dataSubmitLoading = ref(false)
const dataFormRef = ref<FormInstance>()

const defaultDataForm = (): DictDataForm => ({
  id: undefined, typeId: 0, label: '', value: '', sort: 0, status: 1,
})
const dataForm = ref<DictDataForm>(defaultDataForm())
const isEditData = computed(() => !!dataForm.value.id)
const dataDialogTitle = computed(() =>
  (isEditData.value ? $t('common.edit') : $t('common.add')) + $t('dict.dataTitle')
)

const dataFormRules = computed<FormRules>(() => ({
  label: [{ required: true, message: $t('dict.dataLabelRequired'), trigger: 'blur' }],
  value: [{ required: true, message: $t('dict.dataValueRequired'), trigger: 'blur' }],
}))

async function loadDataList(typeId: number) {
  dataLoading.value = true
  try {
    const res = await getDictDataList(typeId)
    dataList.value = res.data || []
  } catch (error) {
    console.error('Failed to load dict data:', error)
  } finally {
    dataLoading.value = false
  }
}

function handleAddData() {
  if (!selectedType.value) return
  dataForm.value = { ...defaultDataForm(), typeId: selectedType.value.id }
  dataDialogVisible.value = true
}

function handleEditData(row: DictData) {
  dataForm.value = { ...row }
  dataDialogVisible.value = true
}

async function handleDeleteData(id: number) {
  try {
    await deleteDictData(id)
    ElMessage.success($t('common.deleteSuccess'))
    if (selectedType.value) loadDataList(selectedType.value.id)
  } catch (error) {
    console.error('Delete dict data failed:', error)
  }
}

async function handleDataSubmit() {
  const valid = await dataFormRef.value?.validate().catch(() => false)
  if (!valid) return

  dataSubmitLoading.value = true
  try {
    if (isEditData.value) await updateDictData(dataForm.value.id!, dataForm.value)
    else await createDictData(dataForm.value)
    ElMessage.success($t('common.saveSuccess'))
    dataDialogVisible.value = false
    if (selectedType.value) loadDataList(selectedType.value.id)
  } catch (error) {
    console.error('Submit dict data failed:', error)
  } finally {
    dataSubmitLoading.value = false
  }
}

// 初始化
loadTypes().catch(() => {})
</script>

<style scoped>
.dict-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}
</style>
