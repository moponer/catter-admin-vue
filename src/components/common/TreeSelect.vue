<template>
  <el-tree-select
    :model-value="modelValue"
    :data="data"
    :props="treeProps"
    :node-key="nodeKey"
    :check-strictly="checkStrictly"
    :filterable="filterable"
    :placeholder="placeholder || $t('common.pleaseSelect')"
    :multiple="multiple"
    :clearable="clearable"
    :disabled="disabled"
    :default-expand-all="defaultExpandAll"
    :render-after-expand="false"
    style="width: 100%"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface TreeSelectProps {
  modelValue?: string | number | Array<string | number>
  data: any[]
  nodeKey?: string
  labelKey?: string
  childrenKey?: string
  disabledKey?: string
  multiple?: boolean
  checkStrictly?: boolean
  filterable?: boolean
  clearable?: boolean
  disabled?: boolean
  defaultExpandAll?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<TreeSelectProps>(), {
  nodeKey: 'id',
  labelKey: 'label',
  childrenKey: 'children',
  disabledKey: 'disabled',
  multiple: false,
  checkStrictly: true,
  filterable: true,
  clearable: true,
  disabled: false,
  defaultExpandAll: false,
  placeholder: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number | Array<string | number>): void
}>()

const treeProps = computed(() => ({
  label: props.labelKey,
  children: props.childrenKey,
  disabled: props.disabledKey,
  value: props.nodeKey,
}))
</script>
