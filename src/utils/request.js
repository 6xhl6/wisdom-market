import axios from 'axios'
import { Toast } from 'vant'
import store from '@/store'

const instance = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/api/',
  timeout: 5000
})
instance.interceptors.request.use(function (config) {
  const token = store.state.user.userInfo.token
  if (token) {
    config.headers['Access-Token'] = token
  }
  config.headers.platform = 'h5'
  if (!config.skipLoading) {
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
  const res = response.data
  if (res.status !== 200) {
    Toast(res.message)
    return Promise.reject(res)
  } else {
    Toast.clear()
  }
  return res
}, function (error) {
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
