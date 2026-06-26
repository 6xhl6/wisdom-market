import request from '@/utils/request.js'

export const getGoodsService = (goodsId) => {
  return request.get('goods.service/list', {
    params: {
      goodsId
    }
  })
}
