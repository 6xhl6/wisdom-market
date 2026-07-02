import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './utils/vant-ui.js'
import './style/common.less'

// Service Worker 注册
// 生产环境下注册 Workbox 生成的 Service Worker，
// 实现：API 数据分层缓存 + 静态资源预缓存 + 离线可用
// 详见：src/registerServiceWorker.js

import './registerServiceWorker'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
