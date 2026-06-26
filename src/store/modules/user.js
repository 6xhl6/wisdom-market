import { setInfo, getInfo } from '@/utils/storage.js'
export default {
  namespaced: true,
  state: {
    userInfo: getInfo()
  },
  mutations: {
    setUserInfo (state, userInfo) {
      state.userInfo = userInfo
      setInfo(userInfo)
    }
  },
  getters: {
    getToken (state) {
      return state.userInfo.token
    }
  },
  actions: {}
}
