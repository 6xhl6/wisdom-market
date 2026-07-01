/**
 * Service Worker 消息通道 — 缓存控制工具
 *
 * 用途：主线程通过 postMessage 向 SW 发送缓存清除指令。
 *
 * 两个使用场景：
 *   1. 退出登录 → 清除所有运行时 API 缓存（防止下一个用户看到旧数据）
 *   2. 新 Session  → 清除上个 session 的缓存（sessionStorage 隔离）
 *
 * 原理：
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
    return
  }
  navigator.serviceWorker.controller.postMessage(data)
}

/**
 * 清除所有运行时 API 缓存
 * 触发场景：退出登录
 */
export function clearAllRuntimeCaches () {
  sendSWMessage({ type: 'CLEAR_ALL_CACHES' })
}

/**
 * 清除用户相关缓存（用户信息、搜索记录等）
 * 触发场景：退出登录（更精确的清理，不影响首页/分类等公共缓存）
 */
export function clearUserCaches () {
  sendSWMessage({ type: 'CLEAR_USER_CACHES' })
}

const SESSION_KEY = 'sw-cache-session'

/**
 * 新 Session 检测 & 缓存清除
 *
 * 在应用初始化时调用（registerServiceWorker ready 回调中）。
 * sessionStorage 在标签页关闭后自动清空，
 * 所以每次新打开标签页都会触发缓存清除。
 *
 * 设计决策：
 *   - 不清除静态资源预缓存（JS/CSS 有 contenthash，新旧不会冲突）
 *   - 只清除运行时 API 缓存（数据可能过时或包含上一位用户信息）
 */
export function initSessionCache () {
  if (!sessionStorage.getItem(SESSION_KEY)) {
    sessionStorage.setItem(SESSION_KEY, Date.now().toString())
    sendSWMessage({ type: 'SESSION_INIT' })
  }
}
