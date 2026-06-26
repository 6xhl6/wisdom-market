import request from '@/utils/request'

// 获取搜索商品列表
export const getSearchList = (params) => {
  return request.get('/goods/list', { params })
}
