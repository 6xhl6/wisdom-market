
export const detectLogin = (vm, handleError = () => {}) => {
  if (!vm.$store.getters['user/getToken']) {
    vm.$dialog.confirm({
      title: '温馨提示',
      message: '此时需登录才能继续操作',
      confirmButtonText: '去登录',
      cancelButtonText: '取消'
    }).then(() => {
      vm.$router.replace({
        path: '/login',
        query: {
          backUrl: vm.$route.fullPath
        }
      })
    }).catch(handleError)
    return false
  }
  return true
}
