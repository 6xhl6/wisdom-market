/* eslint-disable no-console */
/**
 * Service Worker 注册 & 生命周期管理
 *
 * ★ 职责：把 Workbox 构建生成的 service-worker.js 注册到浏览器，
 *         并管理 SW 的一整个生命周期——安装、激活、更新、离线/在线切换。
 *
 * 生命周期函数（register-service-worker 提供的 8 个钩子）：
 *   ready      → SW 首次安装激活完成，应用具备离线能力
 *   registered → 非首次注册成功，每小时轮询检查更新
 *   updated    → 检测到新版本，弹窗询问用户是否立即刷新
 *   cached     → 本次页面的响应来自 SW 缓存（离线或缓存命中）
 *   error      → 注册失败，降级走正常网络（不阻塞应用）
 *   offline    → 浏览器断网，提示用户当前为离线模式
 *   online     → 网络恢复，SW 后台静默更新缓存
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
  // service-worker.js 由 @vue/cli-plugin-pwa (Workbox) 在构建时自动生成
  // 部署路径：docs/service-worker.js，线上路径：/wisdom-market/service-worker.js
  register(`${process.env.BASE_URL}service-worker.js`, {
    // ----------------------------------------------------------------
    // ★ SW 安装成功（首次访问 或 新 SW 开始安装）
    // ----------------------------------------------------------------
    ready () {
      console.log(
        '[PWA] ✅ Service Worker 已激活，应用已支持离线访问。\n' +
        '  静态资源：预缓存，离线秒开\n' +
        '  API 数据：按策略分层缓存（Stale-While-Revalidate / Network First / Cache First / Network Only）'
      )

      initSessionCache()
    },

    // ★ SW 注册成功（非首次，缓存已就绪）

    registered (registration) {
      console.log('[PWA] ✅ Service Worker 注册成功，scope:', registration.scope)

      // 每小时检查一次 SW 更新（默认浏览器也会自动检查）
      setInterval(() => {
        registration.update()
      }, 1000 * 60 * 60)
    },

    // 检测到新版本 SW（页面仍在使用旧版本）
    // 提示用户刷新以获取最新缓存数据

    updated (registration) {
      console.log('[PWA] 🔔 检测到新版本 Service Worker，等待用户刷新页面激活')

      // 动态导入 Toast 提示组件（避免循环依赖）
      import('vant').then(({ Toast }) => {
        // 由于 Vant Toast 不支持交互按钮，采用确认弹窗方式
        import('vant').then(({ Dialog }) => {
          Dialog.confirm({
            title: '版本更新',
            message: '检测到新版本，是否立即刷新页面？',
            confirmButtonText: '立即刷新',
            cancelButtonText: '稍后'
          }).then(() => {
            // 用户确认刷新：通知 SW skipWaiting → 刷新页面
            if (registration.waiting) {
              // 向等待中的 SW 发送 SKIP_WAITING 消息
              registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            }
            window.location.reload()
          }).catch(() => {
            // 用户取消：下次页面加载时自动激活新版本
          })
        })
      })
    },

    // ----------------------------------------------------------------
    // ★ 缓存命中（请求被 SW 拦截并返回缓存响应）
    // ----------------------------------------------------------------
    cached () {
      console.log('[PWA] 📦 内容已由 Service Worker 缓存提供（离线或缓存命中）')
    },

    // ----------------------------------------------------------------
    // ★ 注册失败
    // ----------------------------------------------------------------
    error (error) {
      console.error('[PWA] ❌ Service Worker 注册失败:', error)

      // 常见原因：
      // 1. service-worker.js 404 → 检查构建产物中是否包含该文件
      // 2. 非 HTTPS 环境 → 部署后使用 HTTPS 访问
      // 3. 浏览器不支持 → 降级到正常网络请求，不影响功能
    },

    // 离线检测（网络断开，仍能正常使用）

    offline () {
      console.log('[PWA] 📡 网络已断开，应用将使用缓存数据运行')

      import('vant').then(({ Toast }) => {
        Toast({
          message: '当前处于离线模式，页面内容来自缓存',
          duration: 2000,
          icon: 'warning-o'
        })
      })
    },

    // 在线恢复（网络恢复，仍能正常使用）

    online () {
      console.log('[PWA] 🌐 网络已恢复，缓存将在后台静默更新')
    }
  })
}
