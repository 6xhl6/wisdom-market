/**
 * Service Worker 消息通道 — 缓存控制工具
 *
 * ★ 用途：主线程通过 postMessage 向 SW 发送缓存清除指令。
 *
 * 两个使用场景：
 *   1. 退出登录 → 清除所有运行时 API 缓存（防止下一个用户看到旧数据）
 *   2. 新 Session  → 清除上个 session 的缓存（sessionStorage 隔离）
 *
 * ★ 原理：
 *   浏览器为每个 tab 分配独立的 sessionStorage，
 *   新 tab = 新 sessionStorage → 自动检测为新 session → 清除旧缓存。
 *   这样用户关掉标签页再打开，旧缓存就被清除了。
 */

/**
 * 向当前激活的 Service Worker 发送消息（fire-and-forget）
 * @param {object} data - 消息体，必须包含 type 字段
 */
export function sendSWMessage (data) {
  if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
    // SW 未激活（首次访问、强制刷新跳过 SW 等），无需清除
    console.log('[SW-Msg] SW 未激活，跳过消息：' + data.type)
    return
  }

  navigator.serviceWorker.controller.postMessage(data)
}

/**
 * 清除所有运行时 API 缓存
 * 触发场景：退出登录
 */
export function clearAllRuntimeCaches () {
  console.log('[SW-Msg] → 发送 CLEAR_ALL_CACHES')
  sendSWMessage({ type: 'CLEAR_ALL_CACHES' })
}

/**
 * 清除用户相关缓存（用户信息、搜索记录等）
 * 触发场景：退出登录（更精确的清理，不影响首页/分类等公共缓存）
 */
export function clearUserCaches () {
  console.log('[SW-Msg] → 发送 CLEAR_USER_CACHES')
  sendSWMessage({ type: 'CLEAR_USER_CACHES' })
}

const SESSION_KEY = 'sw-cache-session'

export function initSessionCache () {
  const existingSession = sessionStorage.getItem(SESSION_KEY)

  if (!existingSession) {
    // 新 session → 清除旧缓存 + 写入 session 标记
    sessionStorage.setItem(SESSION_KEY, Date.now().toString())
    console.log('[SW-Msg]  检测到新 Session，清除旧缓存')
    sendSWMessage({ type: 'SESSION_INIT' })
  } else {
    console.log('[SW-Msg] ♻ 同一 Session，保留缓存')
  }
}
