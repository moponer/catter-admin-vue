<template>
  <el-config-provider :locale="elLocale">
    <div class="app-container">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { useAdminTheme } from '@/composables/useAdminTheme'

useAdminTheme()

const { locale } = useI18n()

// Element Plus 内置文案（分页、日期选择器等）跟随应用语言切换
const elLocale = computed(() => (locale.value === 'en-US' ? en : zhCn))
</script>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
}
</style>
