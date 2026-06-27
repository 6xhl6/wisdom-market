import axios from 'axios'
import { Toast } from 'vant'
import store from '@/store'

const instance = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/api/',
  timeout: 5000
})

// ============================================================
//  Axios 拦截器 —— 含 SW 缓存感知的智能 Loading
//
//  ★ 问题：SW 缓存命中时响应 < 5ms，但原逻辑会先弹 loading toast
//          再立刻清除 → 用户看到 loading 一闪，体验劣化
//
//  ★ 方案：200ms 延迟门限。
//          GET 请求（可能走 SW 缓存）→ 延迟 200ms 再弹 loading
//          POST/PUT/DELETE（绝无缓存）  → 立即弹 loading
//
//  ★ 效果：
//    - SW 缓存命中（< 5ms）  → loading 还来不及弹，请求已完成 → 丝滑
//    - 正常网络（100-500ms） → 200ms 后 loading 出现 → 正常加载态
//    - 弱网/超时（> 5s）     → loading 持续展示 → 兜底提示
// ============================================================

instance.interceptors.request.use(function (config) {
  // 注入认证 Token
  const token = store.state.user.userInfo.token
  if (token) {
    config.headers['Access-Token'] = token
  }
  config.headers.platform = 'h5'

  // ---- SW 缓存感知：延迟显示 Loading ----
  // GET 请求可能被 Service Worker 缓存命中（毫秒级响应），
  // 如果立即显示 loading 会造成闪烁。延迟 200ms 显示，
  // 缓存命中时 loading 来不及显示就已被清除，体验更流畅。
  // POST/PUT/DELETE 不走缓存，正常显示 loading。
  const showLoading = !config.skipLoading && config.method === 'get'
  if (showLoading) {
    config._loadingTimer = setTimeout(() => {
      Toast.loading({
        duration: 0,
        message: '加载中...',
        forbidClick: true
      })
    }, 200)
    config._showLoading = true
  } else if (!config.skipLoading) {
    Toast.loading({
      duration: 0,
      message: '加载中...',
      forbidClick: true
    })
  }

  return config
}, function (error) {
  return Promise.reject(error)
})

instance.interceptors.response.use(function (response) {
  // 清除延迟 loading 定时器（若尚未触发）
  if (response.config._loadingTimer) {
    clearTimeout(response.config._loadingTimer)
    response.config._loadingTimer = null
  }
  Toast.clear()

  const res = response.data
  if (res.status !== 200) {
    Toast(res.message)
    return Promise.reject(res)
  }
  return res
}, function (error) {
  // 清除延迟 loading 定时器
  if (error.config?._loadingTimer) {
    clearTimeout(error.config._loadingTimer)
    error.config._loadingTimer = null
  }
  Toast.clear()

  if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
    Toast('请求超时，请稍后再试')
  } else if (!error.response) {
    Toast('网络异常，请检查网络连接')
  } else {
    Toast(error.message)
  }
  return Promise.reject(error)
})
export default instance
