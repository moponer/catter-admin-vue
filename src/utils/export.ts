/**
 * Excel 导出工具
 *
 * 用法：
 *   import { exportExcel } from '@/utils/export'
 *   exportExcel(columns, data, '用户列表')
 */

/** 导出列定义 */
interface ExportColumn {
  /** 字段名 */
  prop: string
  /** 表头标题 */
  label: string
  /** 格式化函数 */
  formatter?: (value: any, row: any) => string
}

/**
 * 导出为 CSV（纯前端，无需额外依赖）
 * 如果需要 xlsx 格式，安装 xlsx 依赖后替换此实现
 */
export function exportExcel(
  columns: ExportColumn[],
  data: Record<string, any>[],
  filename: string = 'export'
): void {
  // BOM + 表头
  const BOM = '\uFEFF'
  const header = columns.map((col) => col.label).join(',')
  const rows = data.map((row) =>
    columns
      .map((col) => {
        let value = row[col.prop]
        if (col.formatter) {
          value = col.formatter(value, row)
        }
        // CSV 注入防护：以 = + - @ 或制表符/回车开头的值会被 Excel 当作公式执行
        let str = String(value ?? '')
        if (/^[=+\-@\t\r]/.test(str)) {
          str = `'${str}`
        }
        // 处理包含逗号或换行的值
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      .join(',')
  )

  const csv = BOM + header + '\n' + rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
