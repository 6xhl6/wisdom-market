<template>
  <div class="login">
    <van-nav-bar title="会员登录" left-arrow @click-left="$router.go(-1)" />
    <div class="container">
      <div class="title">
        <h3>手机号登录</h3>
        <p>未注册的手机号登录后将自动注册</p>
      </div>

      <div class="form">
        <div class="form-item">
          <input class="inp" v-model="Mobile" maxlength="11" placeholder="请输入手机号码" type="text" autocomplete>
        </div>
        <div class="form-item">
          <input class="inp" v-model="CaptchaCode" maxlength="5" placeholder="请输入图形验证码" type="text">
          <img :src="PicUrl" alt="" @click="getPicCode">
        </div>
        <div class="form-item">
          <input v-model="MsgchaCode" class="inp" placeholder="请输入短信验证码" type="text">
          <button @click="getMsgCode">{{ count == 10 ? '获取验证码' : count + '秒后重新获取' }}</button>
        </div>
      </div>

      <div class="login-btn" @click="login">登录</div>
    </div>
  </div>
</template>

<script>
import { getPicCode, getMsgCode, login as loginApi } from '@/api/login.js'

import md5 from 'js-md5'
export default {
  name: 'LoginIndex',
  data () {
    return {
      PicUrl: '',
      PicKey: '',
      PicMd5: '',
      Mobile: '',
      CaptchaCode: '',
      MsgchaCode: '',
      timer: null,
      count: 10,
      is_getMsgCode: false
    }
  },
  methods: {
    countdown () {
      this.count--
      if (this.count === 0) {
        clearInterval(this.timer)
        this.timer = null
        this.count = 10
      }
    },
    async getPicCode () {
      const { data: { base64, key, md5: picMd5 } } = await getPicCode()
      this.PicUrl = base64
      this.PicKey = key
      this.PicMd5 = picMd5
      this.CaptchaCode = ''
    },
    async getMsgCode () {
      if (this.count !== 10 || this.timer !== null) return
      if (!this.Mobile || !/^1[3456789]\d{9}$/.test(this.Mobile)) {
        this.$toast('请输入正确的手机号')
        return
      }
      if (!this.CaptchaCode) {
        this.$toast('请输入图形验证码')
        return
      }
      // 通过md5校验图形验证码是否正确
      if (md5(this.CaptchaCode.toLowerCase()) !== this.PicMd5) {
        this.$toast('图形验证码错误')
        return
      }
      await getMsgCode(this.CaptchaCode, this.PicKey, this.Mobile)
      this.$toast('获取短信验证码成功')
      this.is_getMsgCode = true
      this.countdown()
      this.timer = setInterval(this.countdown, 1000)
    },
    async login () {
      if (!this.Mobile || !/^1[3456789]\d{9}$/.test(this.Mobile)) {
        this.$toast('请输入正确的手机号')
        return
      }
      if (md5(this.CaptchaCode.toLowerCase()) !== this.PicMd5) {
        this.$toast('图形验证码错误')
        return
      }
      if (!this.is_getMsgCode) {
        this.$toast('请先获取短信验证码')
        return
      }
      if (!this.MsgchaCode.trim() || this.MsgchaCode.length !== 6) {
        this.$toast('请输入正确的短信验证码')
        return
      }
      const res = await loginApi(this.Mobile, this.MsgchaCode)
      if (res.status === 200) {
        this.$toast(res.message)
        this.$store.commit('user/setUserInfo', {
          token: res.data.token,
          userId: res.data.userId
        })
        if (this.$route.query.backUrl) {
          this.$router.replace(this.$route.query.backUrl)
        } else {
          this.$router.push('/')
        }
      } else {
        this.$toast('登录失败，请检查手机号或验证码是否正确')
      }
    }
  },
  async created () {
    await this.getPicCode()
    this.$toast('获取图形验证码成功')
  }
}
</script>

<style lang="less" scoped>
.container {
  padding: 49px 29px;

  .title {
    margin-bottom: 20px;

    h3 {
      font-size: 26px;
      font-weight: normal;
    }

    p {
      line-height: 40px;
      font-size: 14px;
      color: #b8b8b8;
    }
  }

  .form-item {
    border-bottom: 1px solid #f3f1f2;
    padding: 8px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;

    .inp {
      display: block;
      border: none;
      outline: none;
      height: 32px;
      font-size: 14px;
      flex: 1;
    }

    img {
      width: 94px;
      height: 31px;
    }

    button {
      height: 31px;
      border: none;
      font-size: 13px;
      color: #cea26a;
      background-color: transparent;
      padding-right: 9px;
    }
  }

  .login-btn {
    width: 100%;
    height: 42px;
    margin-top: 39px;
    background: linear-gradient(90deg, #ecb53c, #ff9211);
    color: #fff;
    border-radius: 39px;
    box-shadow: 0 10px 20px 0 rgba(0, 0, 0, .1);
    letter-spacing: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
