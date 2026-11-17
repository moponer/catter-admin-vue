import { reactive } from 'vue'

/**
 * 字典数据 composable
 *
 * 用法：
 *   const { getDictOptions, getDictLabel } = useDict()
 *   const statusOptions = await getDictOptions('sys_status')
 *   const label = getDictLabel('sys_status', 1)  // → '启用'
 */

// 缓存必须是模块级的：放进 useDict() 内部会导致每个组件各有一份，缓存形同虚设
const dictCache = reactive<Record<string, DictOption[]>>({})
// 进行中的请求，避免同一字典并发重复请求
const pending = new Map<string, Promise<DictOption[]>>()

export function useDict() {
  /** 获取字典选项（带缓存） */
  async function getDictOptions(dictType: string): Promise<DictOption[]> {
    if (dictCache[dictType]) {
      return dictCache[dictType]
    }

    const inflight = pending.get(dictType)
    if (inflight) return inflight

    const task = (async () => {
      try {
        const { getDictDataByCode } = await import('@/api/dict')
        const res = await getDictDataByCode(dictType)
        const list = res?.data ?? []
        const options = list.map((item: any) => ({
          label: item.label || item.dictLabel,
          value: item.value ?? item.dictValue,
          tagType: item.tagType || item.listClass || '',
          cssClass: item.cssClass || '',
        }))
        dictCache[dictType] = options
        return options
      } catch (error) {
        console.warn('Load dict failed:', dictType, error)
        return []
      } finally {
        pending.delete(dictType)
      }
    })()

    pending.set(dictType, task)
    return task
  }

  /**
   * 根据 dictType + value 获取 label。
   * 用字符串比较：后端可能返回 '1'，而调用方常传数字 1。
   */
  function getDictLabel(dictType: string, value: any): string {
    const options = dictCache[dictType] || []
    const found = options.find((opt) => String(opt.value) === String(value))
    return found?.label || String(value ?? '')
  }

  /** 清除指定字典缓存 */
  function clearDictCache(dictType?: string) {
    if (dictType) {
      delete dictCache[dictType]
    } else {
      Object.keys(dictCache).forEach((key) => delete dictCache[key])
    }
  }

  return {
    dictCache,
    getDictOptions,
    getDictLabel,
    clearDictCache,
  }
}

export interface DictOption {
  label: string
  value: any
  tagType?: string
  cssClass?: string
}
