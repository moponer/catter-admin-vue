import { ref } from 'vue'

/**
 * Dialog / Drawer 开关状态管理
 *
 * 用法：
 *   const { visible, open, close } = useModal()
 *   <el-dialog v-model="visible">
 */
export function useModal(defaultVisible = false) {
  const visible = ref(defaultVisible)

  function open() {
    visible.value = true
  }

  function close() {
    visible.value = false
  }

  function toggle() {
    visible.value = !visible.value
  }

  return { visible, open, close, toggle }
}
