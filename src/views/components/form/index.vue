<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ $t('menu.form') }}</h2>
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>{{ $t('formDemo.basicInfo') }}</template>
          <el-form ref="baseFormRef" :model="baseForm" :rules="baseRules" label-width="100px">
            <el-form-item :label="$t('user.username')" prop="username">
              <el-input v-model="baseForm.username" :placeholder="$t('user.placeholder.username')" />
            </el-form-item>
            <el-form-item :label="$t('user.email')" prop="email">
              <el-input v-model="baseForm.email" :placeholder="$t('user.placeholder.email')" />
            </el-form-item>
            <el-form-item :label="$t('user.phone')" prop="phone">
              <el-input v-model="baseForm.phone" :placeholder="$t('user.placeholder.phone')" />
            </el-form-item>
            <el-form-item :label="$t('settings.gender')">
              <el-radio-group v-model="baseForm.gender">
                <el-radio value="male">{{ $t('common.male') }}</el-radio>
                <el-radio value="female">{{ $t('common.female') }}</el-radio>
                <el-radio value="">{{ $t('common.secret') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('formDemo.city')">
              <el-cascader v-model="baseForm.city" :options="cityOptions" :placeholder="$t('common.pleaseSelect')" />
            </el-form-item>
            <el-form-item :label="$t('formDemo.birthday')">
              <el-date-picker v-model="baseForm.birthday" type="date" :placeholder="$t('formDemo.selectDate')" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitBaseForm">{{ $t('common.save') }}</el-button>
              <el-button @click="resetBaseForm">{{ $t('common.reset') }}</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>{{ $t('formDemo.advancedSettings') }}</template>
          <el-form ref="advFormRef" :model="advForm" label-width="100px">
            <el-form-item :label="$t('formDemo.switchOption')">
              <el-switch v-model="advForm.enabled" :active-text="$t('common.on')" :inactive-text="$t('common.off')" />
            </el-form-item>
            <el-form-item :label="$t('formDemo.slider')">
              <el-slider v-model="advForm.progress" :marks="{ 0: '0%', 50: '50%', 100: '100%' }" />
            </el-form-item>
            <el-form-item :label="$t('formDemo.rating')">
              <el-rate v-model="advForm.rate" allow-half show-score />
            </el-form-item>
            <el-form-item :label="$t('formDemo.colorPicker')">
              <el-color-picker v-model="advForm.color" />
            </el-form-item>
            <el-form-item :label="$t('formDemo.tags')">
              <el-select v-model="advForm.tags" multiple filterable allow-create default-first-option :placeholder="$t('formDemo.addTags')">
                <el-option v-for="tag in tagOptions" :key="tag.value" :label="tag.label" :value="tag.value" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('formDemo.remark')">
              <el-input v-model="advForm.remark" type="textarea" :rows="4" :placeholder="$t('formDemo.remarkPlaceholder')" maxlength="200" show-word-limit />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const { t: $t } = useI18n()

// 基础表单
const baseFormRef = ref<FormInstance>()
const baseForm = reactive({
  username: '',
  email: '',
  phone: '',
  gender: '' as string,
  city: [] as string[],
  birthday: null as Date | null,
})

const baseRules: FormRules = {
  username: [{ required: true, message: () => $t('formDemo.usernameRequired'), trigger: 'blur' }],
  email: [{ required: true, type: 'email', message: () => $t('formDemo.emailRequired'), trigger: 'blur' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: () => $t('formDemo.phoneInvalid'), trigger: 'blur' }],
}

const cityOptions = [
  { value: 'beijing', label: 'Beijing' },
  { value: 'shanghai', label: 'Shanghai' },
  { value: 'guangzhou', label: 'Guangzhou' },
  { value: 'shenzhen', label: 'Shenzhen' },
]

// 高级表单
const advFormRef = ref<FormInstance>()
const advForm = reactive({
  enabled: true,
  progress: 50,
  rate: 4.5,
  color: 'var(--admin-primary)',
  tags: [] as string[],
  remark: '',
})

const tagOptions = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'angular', label: 'Angular' },
  { value: 'typescript', label: 'TypeScript' },
]

const submitBaseForm = async () => {
  if (!baseFormRef.value) return
  // 校验失败会 reject，必须捕获，否则会变成未处理的 Promise 异常
  const valid = await baseFormRef.value.validate().catch(() => false)
  if (!valid) return
  ElMessage.success($t('common.saveSuccess'))
}

const resetBaseForm = () => {
  baseFormRef.value?.resetFields()
}
</script>
