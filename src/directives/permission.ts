import { watch } from 'vue'
import type { Directive, DirectiveBinding } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'

/**
 * v-permission — 按钮级权限控制
 *
 * 用法：
 *   v-permission="['system:user:create']"           — 无权限则隐藏元素
 *   v-permission:disabled="['system:user:delete']"   — 无权限则禁用元素
 *
 * 注意：
 * - 权限码为 '*' 表示超级权限，直接放行；
 * - 权限是异步加载的，指令会监听权限变化重新计算，而不是只在 mounted 时判断一次；
 * - 隐藏使用 display:none 而不是移除节点，避免 Vue diff 时出现「父节点已不存在」的报错。
 */

/** 每个元素对应的取消监听函数 */
const stopHandlers = new WeakMap<HTMLElement, () => void>()

function hasPermission(value: string[], permissions: string[]): boolean {
  if (!value || !value.length) return true
  if (permissions.includes('*')) return true
  return value.some((code) => permissions.includes(code))
}

function applyState(el: HTMLElement, value: string[], arg: string | undefined, permissions: string[]) {
  const granted = hasPermission(value, permissions)

  // 先恢复初始状态，再按最新判定结果处理
  el.style.removeProperty('display')
  el.style.removeProperty('pointer-events')
  el.style.removeProperty('opacity')
  el.classList.remove('is-disabled')
  el.removeAttribute('disabled')

  if (granted) return

  if (arg === 'disabled') {
    el.setAttribute('disabled', '')
    el.classList.add('is-disabled')
    el.style.pointerEvents = 'none'
    el.style.opacity = '0.5'
  } else {
    el.style.display = 'none'
  }
}

export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string[]>) {
    const permissionStore = usePermissionStore()

    const stop = watch(
      () => permissionStore.permissions,
      (permissions) => applyState(el, binding.value || [], binding.arg, permissions),
      { deep: true, immediate: true }
    )

    stopHandlers.set(el, stop)
  },
  updated(el: HTMLElement, binding: DirectiveBinding<string[]>) {
    const permissionStore = usePermissionStore()
    applyState(el, binding.value || [], binding.arg, permissionStore.permissions)
  },
  unmounted(el: HTMLElement) {
    stopHandlers.get(el)?.()
    stopHandlers.delete(el)
  },
}
