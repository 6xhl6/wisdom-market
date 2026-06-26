import request from '@/utils/request.js'

// 获取省市区树
export const getRegionTree = () => {
  return request({
    url: '/region/tree',
    method: 'get'
  })
}
