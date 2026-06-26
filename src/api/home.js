import request from '@/utils/request.js'

export const getHomeData = () => {
  return request.get('page/detail')
}
