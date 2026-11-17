<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-icon">
        <el-icon><DocumentDelete /></el-icon>
      </div>
      <div class="error-code">404</div>
      <h2 class="error-title">{{ $t('error.notFound') }}</h2>
      <p class="error-desc">{{ $t('error.notFoundDesc') }}</p>
      <div class="error-actions">
        <router-link to="/">
          <el-button type="primary" size="large">
            <el-icon><HomeFilled /></el-icon>
            {{ $t('common.backToHome') }}
          </el-button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { DocumentDelete, HomeFilled } from '@element-plus/icons-vue'

const { t: $t } = useI18n()
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--admin-primary);
  padding: 40px;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

.error-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

.error-icon .el-icon {
  font-size: 48px;
  color: #FFFFFF;
}

.error-code {
  font-size: 120px;
  font-weight: 800;
  line-height: 1;
  color: #FFFFFF;
  letter-spacing: -4px;
  margin-bottom: 8px;
}

.error-title {
  font-size: 28px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 16px 0 12px;
  letter-spacing: 1px;
}

.error-desc {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 40px;
  max-width: 400px;
  line-height: 1.6;
}

.error-actions .el-button {
  padding: 12px 32px;
  font-size: 15px;
  background-color: #FFFFFF;
  border-color: #FFFFFF;
  color: var(--admin-primary);
}

.error-actions .el-button:hover {
  background-color: var(--admin-bg-hover);
  border-color: var(--admin-border);
}

.error-actions .el-icon {
  margin-right: 6px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
