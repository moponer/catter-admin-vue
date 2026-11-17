/**
 * 文件下载工具
 *
 * 用法：
 *   import { download } from '@/utils/download'
 *   download.byUrl('/api/file/123', '报告.pdf')
 *   download.byBlob(blob, '数据.xlsx')
 */

export const download = {
  /** 通过 URL 下载（创建 <a> 标签模拟点击） */
  byUrl(url: string, filename?: string) {
    // 只允许 http(s)、blob 和站内相对路径，避免 javascript:/data: 之类的伪协议被执行
    const isSafe =
      /^https?:\/\//i.test(url) || /^blob:/i.test(url) || (url.startsWith('/') && !url.startsWith('//'))
    if (!isSafe) {
      console.warn('[download] Blocked unsafe url:', url)
      return
    }

    const link = document.createElement('a')
    link.href = url
    if (filename) link.download = filename
    link.target = '_blank'
    // 阻断反向标签页劫持（新窗口可通过 window.opener 操控原页面）
    link.rel = 'noopener noreferrer'
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  /** 通过 Blob 下载 */
  byBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  /** 通过 Base64 下载 */
  byBase64(base64: string, filename: string, mimeType: string = 'application/octet-stream') {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: mimeType })
    this.byBlob(blob, filename)
  },
}
