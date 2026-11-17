<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-icon">
        <el-icon><CircleCloseFilled /></el-icon>
      </div>
      <div class="error-code">500</div>
      <h2 class="error-title">{{ $t('error.serverError') }}</h2>
      <p class="error-desc">{{ $t('error.serverErrorDesc') }}</p>
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
import { CircleCloseFilled, HomeFilled } from '@element-plus/icons-vue'

const { t: $t } = useI18n()
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #18181B;
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
  background-color: #2D1010;
  border: 2px solid #7F1D1D;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  animation: spin 4s linear infinite;
}

.error-icon .el-icon {
  font-size: 48px;
  color: #EF4444;
}

.error-code {
  font-size: 120px;
  font-weight: 800;
  line-height: 1;
  color: #EF4444;
  margin-bottom: 8px;
  letter-spacing: -4px;
}

.error-title {
  font-size: 28px;
  font-weight: 600;
  color: #F4F4F5;
  margin: 16px 0 12px;
  letter-spacing: 1px;
}

.error-desc {
  font-size: 15px;
  color: #71717A;
  margin-bottom: 40px;
  max-width: 400px;
  line-height: 1.6;
}

.error-actions .el-button {
  padding: 12px 32px;
  font-size: 15px;
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
