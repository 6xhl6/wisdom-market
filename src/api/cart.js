import request from '@/utils/request'

export const addToCartList = ({ goodsId, goodsNum, goodsSkuId }) => {
  return request({
    url: '/cart/add',
    method: 'post',
    data: {
      goodsId,
      goodsNum,
      goodsSkuId
    }
  })
}

export const getCartList = () => {
  return request({
    url: '/cart/list',
    method: 'get'
  })
}

export const updateCartList = ({ goodsId, goodsNum }) => {
  return request({
    url: '/cart/update',
    method: 'post',
    data: {
      goodsId,
      goodsNum,
      goodsSkuId: '0'
    }
  })
}

export const deleteCartList = (cartIds) => {
  return request({
    url: '/cart/clear',
    method: 'post',
    data: {
      cartIds
    }
  })
}
