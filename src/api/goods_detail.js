import request from '@/utils/request'

export const getGoodsDetail = (id) => {
  return request({
    url: '/goods/detail',
    method: 'get',
    params: {
      goodsId: id
    }
  })
}
