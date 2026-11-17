<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-left">
        <div class="brand">
          <h1>Catter Admin</h1>
          <p>{{ $t('login.brandDesc') }}</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon><Check /></el-icon>
            <span>{{ $t('login.featureTS') }}</span>
          </div>
          <div class="feature-item">
            <el-icon><Check /></el-icon>
            <span>{{ $t('login.featureTheme') }}</span>
          </div>
          <div class="feature-item">
            <el-icon><Check /></el-icon>
            <span>{{ $t('login.featureI18n') }}</span>
          </div>
          <div class="feature-item">
            <el-icon><Check /></el-icon>
            <span>{{ $t('login.featureRouter') }}</span>
          </div>
          <div class="feature-item">
            <el-icon><Check /></el-icon>
            <span>{{ $t('login.featureMock') }}</span>
          </div>
          <div class="feature-item">
            <el-icon><Check /></el-icon>
            <span>{{ $t('login.featurePinia') }}</span>
          </div>
        </div>
      </div>

      <div class="login-right">
        <h2>{{ $t('login.title') }}</h2>
        
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          size="large"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="formData.username"
              :placeholder="$t('user.placeholder.username')"
              prefix-icon="User"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="formData.password"
              :placeholder="$t('user.placeholder.password')"
              prefix-icon="Lock"
              type="password"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="remember">{{ $t('login.remember') }}</el-checkbox>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              style="width: 100%"
              @click.prevent="handleLogin"
            >
              {{ loading ? $t('common.loading') : $t('login.submit') }}
            </el-button>
          </el-form-item>
        </el-form>

        <div v-if="isDev" class="demo-tips">
          <p>{{ $t('login.demoAccount') }}：admin / 123456</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { t: $t } = useI18n()

const formRef = ref<FormInstance>()
const loading = ref(false)
const remember = ref(true)

// 演示账号只在开发环境预填，生产环境留空
const isDev = import.meta.env.DEV

const formData = reactive({
  username: isDev ? 'admin' : '',
  password: isDev ? '123456' : '',
})

/**
 * 登录后的跳转目标。
 * redirect 来自 URL 查询参数，必须校验，避免被构造成站外跳转（open redirect）。
 */
const redirectTarget = computed(() => {
  const raw = route.query.redirect
  const path = Array.isArray(raw) ? raw[0] : raw
  if (typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')) {
    return path
  }
  return '/dashboard'
})

const formRules = computed<FormRules>(() => ({
  username: [{ required: true, message: $t('user.placeholder.username'), trigger: 'blur' }],
  password: [{ required: true, message: $t('user.placeholder.password'), trigger: 'blur' }],
}))

const handleLogin = async () => {
  // 防止回车 + 点击重复提交
  if (loading.value || !formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.loginAction(formData, remember.value)

    ElMessage.success($t('login.success'))

    // 跳转到目标页或首页（路由守卫会自动加载用户信息与菜单）
    await router.replace(redirectTarget.value)
  } catch (error) {
    // 错误提示已由 request 拦截器统一处理
    console.error('Login failed:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--admin-primary);
  padding: var(--admin-spacing-lg);
}

.login-card {
  display: flex;
  width: 900px;
  max-width: 100%;
  background: var(--admin-bg-surface);
  border-radius: var(--admin-radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.login-left {
  flex: 1;
  padding: 60px 48px;
  background-color: var(--admin-primary-active);
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
}

.brand h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: var(--admin-spacing-sm);
}

.brand p {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: var(--admin-spacing-xl);
}

.features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--admin-spacing-md);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--admin-spacing-sm);
  font-size: 14px;
  opacity: 0.9;
}

.feature-item .el-icon {
  color: #10B981;
  font-size: 16px;
}

.login-right {
  width: 380px;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-right h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--admin-text-primary);
  margin-bottom: var(--admin-spacing-xl);
  text-align: center;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.demo-tips {
  margin-top: var(--admin-spacing-lg);
  text-align: center;
}

.demo-tips p {
  font-size: 12px;
  color: var(--admin-text-muted);
}

@media (max-width: 768px) {
  .login-card {
    flex-direction: column;
  }

  .login-left {
    display: none;
  }

  .login-right {
    width: 100%;
    padding: 40px 24px;
  }
}
</style>
