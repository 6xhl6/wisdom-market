import request from '@/utils/request.js'

export const getCommentList = (goodsId, limit) => {
  return request({
    url: 'comment/listRows',
    method: 'get',
    params: {
      goodsId,
      limit
    }
  })
}

export const getCommentTotal = (goodsId) => {
  return request({
    url: 'comment/total',
    method: 'get',
    params: {
      goodsId
    }
  })
}
