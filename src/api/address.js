import request from '@/utils/request.js'

export const getAddressList = () => {
  return request({
    url: '/address/list',
    method: 'get'
  })
}

export const addAddress = (data) => {
  return request({
    url: '/address/add',
    method: 'post',
    data: {
      form: {
        name: data.name,
        phone: data.phone,
        region: data.region,
        detail: data.detail
      }
    }
  })
}

export const editAddress = (data) => {
  return request({
    url: '/address/edit',
    method: 'post',
    data: {
      address_id: data.address_id,
      form: {
        name: data.name,
        phone: data.phone,
        region: data.region,
        detail: data.detail
      }
    }
  })
}
