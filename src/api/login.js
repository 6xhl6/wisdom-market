import request from '@/utils/request.js'
import { Toast } from 'vant'

export const getPicCode = () => {
  return request.get('captcha/image')
}

export const getMsgCode = (captchaCode, captchaKey, mobile) => {
  return request.post('captcha/sendSmsCaptcha', {
    form: {
      captchaCode,
      captchaKey,
      mobile
    }
  })
}

export const login = async (mobile, smsCode) => {
  Toast.loading({
    duration: 0,
    message: '登录中...',
    forbidClick: true
  })
  const res = await request.post('passport/login', {
    form: {
      isParty: false,
      mobile,
      partyData: {},
      smsCode
    }
  }, {
    skipLoading: true
  })
  Toast.clear()
  return res
}
