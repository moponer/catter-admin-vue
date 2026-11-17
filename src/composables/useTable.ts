import { ref, reactive } from 'vue'

interface UseTableOptions {
  /** API 请求函数 */
  apiFn: (params: any) => Promise<any>
  /** 默认查询参数 */
  defaultParams?: Record<string, any>
  /** 响应中列表数据的字段名（默认 'list'） */
  dataField?: string
  /** 响应中总条数的字段名（默认 'total'） */
  totalField?: string
  /** 是否在创建时自动加载（默认 true） */
  immediate?: boolean
}

export function useTable(options: UseTableOptions) {
  const {
    apiFn,
    defaultParams = {},
    dataField = 'list',
    totalField = 'total',
    immediate = true,
  } = options

  // 查询参数
  const queryParams = reactive({
    page: 1,
    pageSize: 10,
    keyword: '',
    ...defaultParams,
  })

  // 表格状态
  const loading = ref(false)
  const tableData = ref<any[]>([])
  const total = ref(0)

  // 请求序号：只接受最后一次请求的结果，避免快速切换筛选条件时旧数据覆盖新数据
  let requestSeq = 0

  // 加载数据
  async function loadData() {
    const seq = ++requestSeq
    loading.value = true
    try {
      const res = await apiFn({ ...queryParams })
      if (seq !== requestSeq) return

      const data = res?.data ?? res ?? {}
      tableData.value = Array.isArray(data[dataField]) ? data[dataField] : []
      total.value = Number(data[totalField]) || 0
    } catch (error) {
      if (seq !== requestSeq) return
      // 保留上一次成功的数据：一次网络抖动不应该把表格清空成「暂无数据」
      console.warn('Load table data failed:', error)
    } finally {
      if (seq === requestSeq) {
        loading.value = false
      }
    }
  }

  // 搜索（重置到第1页）
  function handleSearch() {
    queryParams.page = 1
    loadData()
  }

  // 重置（恢复默认参数后搜索）
  function handleReset() {
    Object.keys(queryParams).forEach((key) => {
      if (key === 'page' || key === 'pageSize' || key === 'keyword') return
      if (!(key in defaultParams)) {
        delete (queryParams as Record<string, any>)[key]
      }
    })
    Object.keys(defaultParams).forEach((key) => {
      const params = queryParams as Record<string, any>
      params[key] = defaultParams[key]
    })
    queryParams.page = 1
    queryParams.pageSize = 10
    queryParams.keyword = ''
    loadData()
  }

  // 刷新（保持当前页）
  function refresh() {
    loadData()
  }

  // 自动加载
  if (immediate) {
    loadData()
  }

  return {
    queryParams,
    loading,
    tableData,
    total,
    loadData,
    handleSearch,
    handleReset,
    refresh,
  }
}
