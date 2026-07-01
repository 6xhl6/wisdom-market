/**
 * Service Worker 注册 & 生命周期管理
 *
 * 职责：把 Workbox 构建生成的 service-worker.js 注册到浏览器，
 *       并管理 SW 的一整个生命周期——安装、激活、更新、离线/在线切换。
 *
 * 生命周期函数（register-service-worker 提供的 8 个钩子）：
 *   ready      → SW 首次安装激活完成，应用具备离线能力
 *   registered → 非首次注册成功，每小时轮询检查更新
 *   updated    → 检测到新版本，弹窗询问用户是否立即刷新
 *   cached     → 本次页面的响应来自 SW 缓存（离线或缓存命中）
 *   error      → 注册失败，降级走正常网络（不阻塞应用）
 *   offline    → 浏览器断网，提示用户当前为离线模式
 *
 * 设计决策：
 *   - 仅生产环境注册（环境判断 if NODE_ENV === 'production'），
 *     避免开发热更新与 SW 缓存冲突
 *   - import() 动态加载 Vant Dialog/Toast，不把 UI 库打进入口 chunk
 *   - 更新流程：弹窗确认 → postMessage SKIP_WAITING → reload，
 *     避免旧 SW 和新页面的缓存版本错乱
 *   - 非 HTTPS / 不支持 SW 的浏览器 → 静默降级，不影响正常功能
 */

import { register } from 'register-service-worker'
import { initSessionCache } from '@/utils/sw-message.js'

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready () {
      // SW 激活完成 → 检查是否新 session，决定是否清除旧缓存
      initSessionCache()
    },

    registered (registration) {
      // 每小时检查一次 SW 更新
      setInterval(() => {
        registration.update()
      }, 1000 * 60 * 60)
    },

    updated (registration) {
      // 检测到新版本 → 弹窗确认 → 刷新
      import('vant').then(({ Dialog }) => {
        Dialog.confirm({
          title: '版本更新',
          message: '检测到新版本，是否立即刷新页面？',
          confirmButtonText: '立即刷新',
          cancelButtonText: '稍后'
        }).then(() => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          }
          window.location.reload()
        }).catch(() => {})
      })
    },

    offline () {
      import('vant').then(({ Toast }) => {
        Toast({
          message: '当前处于离线模式，页面内容来自缓存',
          duration: 2000,
          icon: 'warning-o'
        })
      })
    }
  })
}
