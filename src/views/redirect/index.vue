<template>
  <div />
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 刷新页面后重新导航到目标页面
router.replace(route.path.replace('/redirect', '') || '/')
</script>
