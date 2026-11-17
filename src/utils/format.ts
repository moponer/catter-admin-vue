/**
 * 格式化工具函数
 */

/** 日期格式化 */
export function formatDate(
  value: string | number | Date | undefined,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  if (!value) return ''

  const date = new Date(value)
  if (isNaN(date.getTime())) return ''

  const pad = (n: number) => String(n).padStart(2, '0')

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/** 文件大小格式化 */
export function formatFileSize(bytes: number | undefined): string {
  if (bytes === undefined || bytes === null) return '0 B'
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`
}

/** 数字千分位格式化 */
export function formatNumber(num: number | undefined, decimals: number = 2): string {
  if (num === undefined || num === null) return '0'
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** 百分比格式化 */
export function formatPercent(value: number | undefined, total: number): string {
  if (!value || !total) return '0%'
  return `${((value / total) * 100).toFixed(1)}%`
}

/** 相对时间（几分钟前、几小时前等） */
import i18n from '@/locales'

const { t: $t } = i18n.global

export function formatRelativeTime(value: string | number | Date): string {
  const date = new Date(value)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return $t('relativeTime.justNow')
  if (minutes < 60) return $t('relativeTime.minutesAgo', { n: minutes })
  if (hours < 24) return $t('relativeTime.hoursAgo', { n: hours })
  if (days < 30) return $t('relativeTime.daysAgo', { n: days })
  if (days < 365) return $t('relativeTime.monthsAgo', { n: Math.floor(days / 30) })
  return $t('relativeTime.yearsAgo', { n: Math.floor(days / 365) })
}

/** 手机号脱敏：138****8888 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/** 身份证脱敏：110***********1234 */
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 8) return idCard
  return idCard.replace(/(\d{3})\d+(\d{4})/, '$1***********$2')
}

/** 邮箱脱敏：t***e@example.com */
export function maskEmail(email: string): string {
  if (!email) return email
  const [name, domain] = email.split('@')
  if (!domain) return email
  const masked = name.charAt(0) + '***' + name.charAt(name.length - 1)
  return `${masked}@${domain}`
}
