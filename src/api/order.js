import request from '@/utils/request'
export const checkOrder = (mode, obj) => {
  return request({
    url: '/checkout/order',
    method: 'get',
    params: {
      mode,
      delivery: 10,
      couponId: 0,
      isUsePoints: 0,
      ...obj
    }
  })
}
export const submitOrder = (mustData, obj) => {
  return request({
    url: '/checkout/submit',
    method: 'post',
    data: {
      ...mustData,
      ...obj
    }
  })
}
export const getOrderList = (params) => {
  return request({
    url: '/order/list',
    method: 'get',
    params
  })
}
export const payOrder = (orderId) => {
  return request({
    url: '/order/pay',
    method: 'get',
    params: {
      orderId,
      payType: 10
    }
  })
}
export const cancelOrder = (orderId) => {
  return request({
    url: '/order/cancel',
    method: 'post',
    params: {
      orderId
    }
  })
}
export const confirmOrder = (orderId) => {
  return request({
    url: '/order/confirm',
    method: 'post',
    params: {
      orderId
    }
  })
}
export const confirmCancel = (orderId) => {
  return request({
    url: '/order/cancel',
    method: 'post',
    data: {
      orderId
    }
  })
}
