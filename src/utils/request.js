import axios from 'axios'
import { Toast } from 'vant'
import store from '@/store'

const instance = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/api/',
  timeout: 5000
})

//  全局 Loading 计数器 —— 多个请求并发时只显示一个 loading

let pendingCount = 0
let loadingTimer = null
let loadingVisible = false

function onRequestStart (config) {
  if (config.skipLoading) return
  pendingCount++

  if (loadingVisible) return

  const delay = config.method === 'get' ? 200 : 0
  if (delay === 0) {
    // POST/PUT/DELETE：立即显示 loading
    if (loadingTimer) {
      clearTimeout(loadingTimer)
      loadingTimer = null
    }
    loadingVisible = true
    Toast.loading({ duration: 0, message: '加载中...', forbidClick: true })
  } else if (!loadingTimer) {
    // GET：延迟 200ms，缓存命中时 timer 来不及触发就被清除
    loadingTimer = setTimeout(() => {
      loadingTimer = null
      loadingVisible = true
      Toast.loading({ duration: 0, message: '加载中...', forbidClick: true })
    }, delay)
  }
}

function onRequestEnd () {
  if (pendingCount <= 0) return
  pendingCount--

  if (pendingCount === 0) {
    if (loadingTimer) {
      clearTimeout(loadingTimer)
      loadingTimer = null
    }
    if (loadingVisible) {
      Toast.clear()
      loadingVisible = false
    }
  }
}

instance.interceptors.request.use(function (config) {
  // 注入认证 Token
  const token = store.state.user.userInfo.token
  if (token) {
    config.headers['Access-Token'] = token
  }
  config.headers.platform = 'h5'

  onRequestStart(config)

  return config
}, function (error) {
  onRequestEnd()
  return Promise.reject(error)
})

instance.interceptors.response.use(function (response) {
  onRequestEnd()

  const res = response.data
  if (res.status !== 200) {
    Toast(res.message)
    return Promise.reject(res)
  }
  return res
}, function (error) {
  onRequestEnd()

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
