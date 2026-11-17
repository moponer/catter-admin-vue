/**
 * 表单验证器集合
 *
 * 用法：
 *   import { validate } from '@/utils/validate'
 *   rules: { phone: [{ validator: validate.phone, trigger: 'blur' }] }
 *   或直接使用正则：
 *   import { patterns } from '@/utils/validate'
 *   patterns.phone.test('13800138000')  // true
 */
import i18n from '@/locales'

const { t: $t } = i18n.global

/** 常用正则模式 */
export const patterns = {
  /** 手机号（中国大陆） */
  phone: /^1[3-9]\d{9}$/,
  /** 邮箱 */
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  /** 身份证号（18位） */
  idCard: /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
  /** URL */
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_+.~#?&/=]*$/,
  /** 邮政编码 */
  zipCode: /^[1-9]\d{5}$/,
  /** IP 地址（IPv4） */
  ipv4: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  /** 仅中文 */
  chinese: /^[\u4e00-\u9fa5]+$/,
  /** 仅字母 */
  alpha: /^[a-zA-Z]+$/,
  /** 字母+数字 */
  alphaNum: /^[a-zA-Z0-9]+$/,
  /** 密码（8-20位，至少含大小写字母和数字） */
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=[\]{}|;':",.<>?/`~]{8,20}$/,
}

/** Element Plus 表单验证器 */
export const validate = {
  /** 手机号验证 */
  phone(_rule: any, value: string, callback: Function) {
    if (!value) return callback()
    if (!patterns.phone.test(value)) {
      callback(new Error($t('validate.phone')))
    } else {
      callback()
    }
  },

  /** 邮箱验证 */
  email(_rule: any, value: string, callback: Function) {
    if (!value) return callback()
    if (!patterns.email.test(value)) {
      callback(new Error($t('validate.email')))
    } else {
      callback()
    }
  },

  /** 身份证验证 */
  idCard(_rule: any, value: string, callback: Function) {
    if (!value) return callback()
    if (!patterns.idCard.test(value)) {
      callback(new Error($t('validate.idCard')))
    } else {
      callback()
    }
  },

  /** URL 验证 */
  url(_rule: any, value: string, callback: Function) {
    if (!value) return callback()
    if (!patterns.url.test(value)) {
      callback(new Error($t('validate.url')))
    } else {
      callback()
    }
  },

  /** 密码强度验证 */
  password(_rule: any, value: string, callback: Function) {
    if (!value) return callback()
    if (!patterns.password.test(value)) {
      callback(new Error($t('validate.password')))
    } else {
      callback()
    }
  },
}

/** 密码强度等级（0-4） */
export function getPasswordStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*()_+\-=[\]{}|;':",.<>?/`~]/.test(password)) score++
  return Math.min(score, 4)
}
