<template>
  <el-form
    ref="formRef"
    :model="form"
    :inline="true"
    :label-width="labelWidth"
    class="search-form"
    @submit.prevent
  >
    <template v-for="item in visibleItems" :key="item.prop">
      <!-- 文本输入 -->
      <el-form-item v-if="item.type === 'input' || !item.type" :label="item.label" :prop="item.prop">
        <el-input
          v-model="form[item.prop]"
          :placeholder="item.placeholder || $t('common.pleaseInput')"
          clearable
          :style="{ width: item.width || '200px' }"
          @keyup.enter="handleSearch"
        />
      </el-form-item>

      <!-- 下拉选择 -->
      <el-form-item v-else-if="item.type === 'select'" :label="item.label" :prop="item.prop">
        <el-select
          v-model="form[item.prop]"
          :placeholder="item.placeholder || $t('common.pleaseSelect')"
          clearable
          :style="{ width: item.width || '200px' }"
        >
          <el-option
            v-for="opt in item.options || []"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <!-- 日期范围 -->
      <el-form-item v-else-if="item.type === 'daterange'" :label="item.label" :prop="item.prop">
        <el-date-picker
          v-model="form[item.prop]"
          type="daterange"
          :start-placeholder="$t('common.startDate')"
          :end-placeholder="$t('common.endDate')"
          value-format="YYYY-MM-DD"
          :style="{ width: item.width || '260px' }"
        />
      </el-form-item>

      <!-- 单日期 -->
      <el-form-item v-else-if="item.type === 'date'" :label="item.label" :prop="item.prop">
        <el-date-picker
          v-model="form[item.prop]"
          type="date"
          :placeholder="item.placeholder || $t('common.pleaseSelect')"
          value-format="YYYY-MM-DD"
          :style="{ width: item.width || '200px' }"
        />
      </el-form-item>

      <!-- 数字范围 -->
      <el-form-item v-else-if="item.type === 'numberRange'" :label="item.label">
        <div class="number-range">
          <el-input-number
            v-model="form[item.prop]"
            :placeholder="$t('common.min')"
            controls-position="right"
            :style="{ width: '110px' }"
          />
          <span class="range-separator">~</span>
          <el-input-number
            v-model="form[item.endProp!]"
            :placeholder="$t('common.max')"
            controls-position="right"
            :style="{ width: '110px' }"
          />
        </div>
      </el-form-item>

      <!-- 自定义插槽 -->
      <el-form-item v-else-if="item.type === 'slot'" :label="item.label" :prop="item.prop">
        <slot :name="item.slotName || item.prop" :model="form" />
      </el-form-item>
    </template>

    <el-form-item class="search-actions">
      <el-button type="primary" :icon="Search" @click="handleSearch">
        {{ $t('common.search') }}
      </el-button>
      <el-button :icon="Refresh" @click="handleReset">
        {{ $t('common.reset') }}
      </el-button>
      <el-button
        v-if="items.length > defaultCollapsedCount"
        link
        type="primary"
        @click="collapsed = !collapsed"
      >
        {{ collapsed ? $t('common.expand') : $t('common.collapse') }}
        <el-icon class="collapse-icon" :class="{ 'is-expanded': !collapsed }">
          <ArrowDown />
        </el-icon>
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Search, Refresh, ArrowDown } from '@element-plus/icons-vue'

export interface SearchFormItem {
  prop: string
  label: string
  type?: 'input' | 'select' | 'daterange' | 'date' | 'numberRange' | 'slot'
  placeholder?: string
  options?: Array<{ label: string; value: string | number }>
  width?: string
  endProp?: string // numberRange 的结束字段
  slotName?: string // slot 类型的插槽名
}

const props = withDefaults(
  defineProps<{
    modelValue: Record<string, any>
    items: SearchFormItem[]
    defaultCollapsedCount?: number
    labelWidth?: string
  }>(),
  {
    defaultCollapsedCount: 3,
    labelWidth: '80px',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'search'): void
  (e: 'reset'): void
}>()

const formRef = ref()
const collapsed = ref(true)

/**
 * 表单内部状态。
 * 不能直接修改 props.modelValue（只读 prop），而是维护一份本地副本，
 * 任何改动通过 update:modelValue 事件交还父组件。
 */
const form = reactive<Record<string, any>>({ ...props.modelValue })

// 外部（例如查询重置）改动时同步到内部副本
watch(
  () => props.modelValue,
  (value) => {
    Object.keys(form).forEach((key) => {
      if (!(key in value)) delete form[key]
    })
    Object.assign(form, value)
  },
  { deep: true }
)

// 内部改动时通知父组件
watch(
  form,
  () => {
    emit('update:modelValue', { ...form })
  },
  { deep: true }
)

const visibleItems = computed(() => {
  if (collapsed.value && props.items.length > props.defaultCollapsedCount) {
    return props.items.slice(0, props.defaultCollapsedCount)
  }
  return props.items
})

function handleSearch() {
  emit('search')
}

function handleReset() {
  // 重置所有字段为初始值
  for (const item of props.items) {
    form[item.prop] = undefined
    if (item.endProp) {
      form[item.endProp] = undefined
    }
  }
  emit('update:modelValue', { ...form })
  emit('reset')
}
</script>

<style scoped>
.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  padding: 18px 20px 0;
  background: var(--el-bg-color);
  border-radius: 4px;
  margin-bottom: 16px;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 18px;
  margin-right: 16px;
}

.search-actions {
  margin-left: auto;
}

.collapse-icon {
  transition: transform 0.3s;
}

.collapse-icon.is-expanded {
  transform: rotate(180deg);
}

.number-range {
  display: flex;
  align-items: center;
  gap: 4px;
}

.range-separator {
  color: var(--el-text-color-secondary);
}
</style>
