<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ $t('profile.settings') }}</h2>
    </div>

    <el-card shadow="hover" style="max-width: 700px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="large">
        <el-divider content-position="left">
          <el-icon><User /></el-icon>
          {{ $t('settings.basicInfo') }}
        </el-divider>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item :label="$t('settings.avatar')">
              <div class="avatar-upload">
                <el-avatar :size="80" src="" style="background:var(--admin-primary);font-size:28px;">
                  {{ form.nickname?.charAt(0)?.toUpperCase() }}
                </el-avatar>
                <el-button size="small" style="margin-left:12px;" @click="handleChangeAvatar">
                  {{ $t('settings.changeAvatar') }}
                </el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('settings.nickname')" prop="nickname">
              <el-input v-model="form.nickname" :placeholder="$t('settings.nicknamePlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('settings.email')" prop="email">
              <el-input v-model="form.email" :placeholder="$t('settings.emailPlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('settings.phone')" prop="phone">
              <el-input v-model="form.phone" :placeholder="$t('settings.phonePlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('settings.gender')">
              <el-radio-group v-model="form.gender">
                <el-radio value="male">{{ $t('common.male') }}</el-radio>
                <el-radio value="female">{{ $t('common.female') }}</el-radio>
                <el-radio value="">{{ $t('common.secret') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('settings.bio')">
              <el-input v-model="form.bio" type="textarea" :rows="3" :placeholder="$t('settings.bioPlaceholder')" maxlength="200" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">
          <el-icon><Lock /></el-icon>
          {{ $t('settings.changePassword') }}
        </el-divider>

        <el-alert type="info" :closable="false" style="margin-bottom:16px;">
          {{ $t('settings.passwordHint') }}
        </el-alert>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('settings.currentPassword')">
              <el-input v-model="form.currentPassword" type="password" show-password :placeholder="$t('settings.currentPasswordPlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('settings.newPassword')">
              <el-input v-model="form.newPassword" type="password" show-password :placeholder="$t('settings.newPasswordPlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('settings.confirmPassword')">
              <el-input v-model="form.confirmPassword" type="password" show-password :placeholder="$t('settings.confirmPasswordPlaceholder')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-col :span="24">
          <el-form-item>
            <el-button type="primary" @click="handleSubmit" :loading="saving">{{ $t('settings.saveChanges') }}</el-button>
            <el-button @click="handleReset">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-col>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { patterns } from '@/utils/validate'

const { t: $t } = useI18n()

const formRef = ref<FormInstance>()
const saving = ref(false)

const form = reactive({
  nickname: 'Admin',
  email: 'admin@example.com',
  phone: '13800138000',
  gender: 'male',
  bio: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const rules: FormRules = {
  nickname: [{ required: true, message: () => $t('settings.nicknameRequired'), trigger: 'blur' }],
  email: [{ required: true, type: 'email', message: () => $t('settings.emailRequired'), trigger: 'blur' }],
}

const handleSubmit = async () => {
  if (saving.value || !formRef.value) return

  // validate() 校验失败会 reject，必须捕获，否则会抛出未处理的 Promise 异常
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const wantsPasswordChange = !!(form.currentPassword || form.newPassword || form.confirmPassword)

  if (wantsPasswordChange) {
    if (!form.currentPassword) {
      ElMessage.error($t('settings.currentPasswordPlaceholder'))
      return
    }
    if (!patterns.password.test(form.newPassword)) {
      ElMessage.error($t('validate.password'))
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      ElMessage.error($t('settings.passwordMismatch'))
      return
    }
  }

  saving.value = true
  try {
    // TODO: 接入后端接口（当前脚手架未提供 profile / password 更新 API）
    await new Promise((resolve) => setTimeout(resolve, 300))
    ElMessage.success($t('common.saveSuccess'))
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  } finally {
    saving.value = false
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
}

const handleChangeAvatar = () => {
  // TODO: 接入头像上传组件（脚手架未提供 profile 相关的上传接口）
  ElMessage.info($t('settings.changeAvatar'))
}
</script>

<style scoped>
.avatar-upload {
  display: flex;
  align-items: center;
}
</style>
