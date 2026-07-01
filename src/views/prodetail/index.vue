<template>
  <div class="prodetail">
    <van-nav-bar fixed title="商品详情页" left-arrow @click-left="$router.go(-1)" />

    <van-swipe :autoplay="3000" @change="onChange" class="product-swipe">
      <van-swipe-item v-for="(image, index) in this.goodsData.goods_images" :key="index">
        <img :src="image.external_url" :alt="goodsData.goods_name || '商品图片'" />
      </van-swipe-item>

      <template #indicator>
        <div class="custom-indicator">{{ current + 1 }} / {{ goodsData.goods_images.length }}</div>
      </template>
    </van-swipe>

    <!-- 商品说明 -->
    <div class="info">
      <div class="title">
        <div class="price">
          <span class="now">￥{{ goodsData.goods_price_max }}</span>
          <span class="oldprice">￥{{ goodsData.line_price_max }}</span>
        </div>
        <div class="sellcount">已售{{ goodsData.goods_sales }}件</div>
      </div>
      <div class="msg text-ellipsis-2">
        {{ goodsData.goods_name }}
      </div>

      <div class="service">
        <div class="left-words">
          <span><van-icon name="passed" />{{ serviceList[0].name || '七天无理由退货' }}</span>
          <span><van-icon name="passed" />{{ serviceList[1].name || '48小时发货' }}</span>
        </div>
        <div class="right-icon">
          <van-icon name="arrow" />
        </div>
      </div>
    </div>

    <!-- 商品评价 -->
    <div class="comment">
      <div class="comment-title">
        <div class="left">商品评价 ({{ commentTotal.all }}条)</div>
        <div class="right">查看更多 <van-icon name="arrow" /> </div>
      </div>
      <div class="comment-list">
        <div class="comment-item" v-for="item in commentList" :key="item.comment_id">
          <div class="top">
            <img :src="item.user.avatar_url || defaultAvatarUrl" alt="">
            <div class="name">{{ item.user.nick_name }}</div>
            <van-rate :size="16" :value="item.score" color="#ffd21e" void-icon="star" void-color="#eee" />
          </div>
          <div class="content">
            {{ item.content }}
          </div>
          <div class="time">
            {{ item.create_time }}
          </div>
        </div>
      </div>
    </div>

    <!-- 商品描述 -->
    <div class="desc">
      <img src="https://uimgproxy.suning.cn/uimg1/sop/commodity/kHgx21fZMWwqirkMhawkAw.jpg" alt="商品详情图1">
      <img src="https://uimgproxy.suning.cn/uimg1/sop/commodity/0rRMmncfF0kGjuK5cvLolg.jpg" alt="商品详情图2">
      <img src="https://uimgproxy.suning.cn/uimg1/sop/commodity/2P04A4Jn0HKxbKYSHc17kw.jpg" alt="商品详情图3">
    </div>

    <!-- 底部 -->
    <div class="footer">
      <div class="icon-home" @click="$router.push('/home')">
        <van-icon name="wap-home-o" />
        <span>首页</span>
      </div>
      <div class="icon-cart" @click="$router.push('/cart')">
        <van-icon name="shopping-cart-o" />
        <span>购物车</span>
        <span class="cart-count" v-if="$store.state.cart.cartList.length > 0">{{ $store.state.cart.cartList.length }}</span>
      </div>
      <div class="btn-add" @click="showAddCart">加入购物车</div>
      <div class="btn-buy" @click="buyNow">立刻购买</div>
    </div>
    <van-action-sheet v-model="showPannel" :title="mode === 'cart' ? '加入购物车' : '立刻购买'">
      <div class="product">
        <div class="product-title">
          <div class="left">
            <img :src="this.goodsData.goods_image" alt="">
          </div>
          <div class="right">
            <div class="price">
              <span>¥</span>
              <span class="nowprice">{{ goodsData.goods_price_min }}</span>
            </div>
            <div class="count">
              <span>库存：{{ stock ? stock + '件' : '已售完' }}</span>
            </div>
          </div>
        </div>
        <div class="num-box">
          <span>数量</span>
          <van-stepper v-model="buy_num" />
        </div>
        <div class="showbtn" v-if="true">
          <div class="btn" v-if="mode === 'cart'" @click="addToCart">加入购物车</div>
          <div class="btn now" v-else @click="GOPay">立刻购买</div>
        </div>
        <div class="btn-none" v-else>该商品已抢完</div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script>
import { getGoodsDetail } from '@/api/goods_detail.js'
import { addToCartList } from '@/api/cart.js'
import { getCommentList, getCommentTotal } from '@/api/comments.js'
import { getGoodsService } from '@/api/goods_service.js'
import defaultAvatar from '@/assets/default-avatar.png'
import { detectLogin } from '@/utils/login-detect.js'
export default {
  name: 'ProDetail',
  data () {
    return {
      defaultAvatarUrl: defaultAvatar,
      goodsId: this.$route.params.id || '',
      current: 0,
      goodsData: {
        goods_images: []
      },
      commentList: [],
      commentTotal: 0,
      serviceList: [
        {
          name: '七天无理由退货'
        },
        {
          name: '48小时发货'
        }
      ],
      showPannel: false,
      mode: 'cart',
      buy_num: 1
    }
  },
  computed: {
    stock () {
      const stock = this.goodsData.stock_total - this.goodsData.goods_sales
      return stock > 0 ? stock : 0
    }
  },
  methods: {
    async loadDetail () {
      const res = await getGoodsDetail(this.goodsId)
      this.goodsData = res.data.detail
      const commentRes = await getCommentList(this.goodsId, 5)
      this.commentList = commentRes.data.list
      const totalRes = await getCommentTotal(this.goodsId)
      this.commentTotal = totalRes.data.total
      const serviceRes = await getGoodsService(this.goodsId)
      this.serviceList = serviceRes.data.list
    },
    isStockEnough () {
      const isEnough = this.stock >= this.buy_num
      if (!isEnough) {
        this.$toast('库存不足')
        return false
      }
      return isEnough
    },
    onChange (index) {
      this.current = index
    },
    showAddCart () {
      if (!detectLogin(this, () => {})) {
        return
      }
      this.mode = 'cart'
      this.showPannel = true
    },
    async addToCart () {
      if (!this.isStockEnough()) {
        return
      }
      const res = await addToCartList({
        goodsId: this.goodsId,
        goodsNum: this.buy_num,
        goodsSkuId: '0'
      })
      if (res.status === 200) {
        this.$toast('加入购物车成功')
        this.showPannel = false
        this.$store.dispatch('cart/getCartListAction')
      }
    },
    buyNow () {
      // 检查是否登录
      // 如果未登录，弹出登录提示窗
      if (!detectLogin(this, () => {})) {
        return
      }
      this.mode = 'buyNow'
      this.showPannel = true
    },
    GOPay () {
      if (!this.isStockEnough()) {
        return
      }
      this.$router.push({
        path: '/pay',
        query: {
          mode: 'buyNow',
          goodsId: this.goodsId,
          goodsNum: this.buy_num,
          goodsSkuId: '0'
        }
      })
    }
  },
  async created () {
    this.loadDetail()
  }
}
</script>

<style lang="less" scoped>
.prodetail {
  padding-top: 46px;
  padding-bottom: 55px;
  overflow-x: hidden;

  ::v-deep .van-icon-arrow-left {
    color: #333;
  }

  // 轮播图数据异步加载前预留高度（移动端 375×375 常见比例）
  .product-swipe {
    min-height: 375px;
  }

  img {
    display: block;
    width: 100%;
  }

  .custom-indicator {
    position: absolute;
    right: 10px;
    bottom: 10px;
    padding: 5px 10px;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 15px;
  }

  .desc {
    width: 100%;
    overflow: scroll;

    ::v-deep img {
      display: block;
      width: 100% !important;
    }
  }

  .info {
    padding: 10px;
  }

  .title {
    display: flex;
    justify-content: space-between;

    .now {
      color: #fa2209;
      font-size: 20px;
    }

    .oldprice {
      color: #959595;
      font-size: 16px;
      text-decoration: line-through;
      margin-left: 5px;
    }

    .sellcount {
      color: #959595;
      font-size: 16px;
      position: relative;
      top: 4px;
    }
  }

  .msg {
    font-size: 16px;
    line-height: 24px;
    margin-top: 5px;
  }

  .service {
    display: flex;
    justify-content: space-between;
    line-height: 40px;
    margin-top: 10px;
    font-size: 16px;
    background-color: #fafafa;

    .left-words {
      span {
        margin-right: 10px;
      }

      .van-icon {
        margin-right: 4px;
        color: #fa2209;
      }
    }
  }

  .comment {
    padding: 10px;
    width: 100vw;
  }

  .comment-title {
    display: flex;
    justify-content: space-between;

    .right {
      color: #959595;
    }
  }

  .comment-item {
    font-size: 16px;
    line-height: 30px;

    .top {
      height: 30px;
      display: flex;
      align-items: center;
      margin-top: 20px;

      img {
        width: 20px;
        height: 20px;
      }

      .name {
        margin: 0 10px;
      }
    }

    .time {
      color: #999;
    }
  }

  .product {
    .product-title {
      display: flex;

      .left {
        img {
          width: 90px;
          height: 90px;
        }

        margin: 10px;
      }

      .right {
        flex: 1;
        padding: 10px;

        .price {
          font-size: 14px;
          color: #fe560a;

          .nowprice {
            font-size: 24px;
            margin: 0 5px;
          }
        }
      }
    }

    .num-box {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      align-items: center;
    }

    .btn,
    .btn-none {
      height: 40px;
      line-height: 40px;
      margin: 20px;
      border-radius: 20px;
      text-align: center;
      color: rgb(255, 255, 255);
      background-color: rgb(255, 148, 2);
    }

    .btn.now {
      background-color: #fe5630;
    }

    .btn-none {
      background-color: #cccccc;
    }
  }

  .footer {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 55px;
    background-color: #fff;
    border-top: 1px solid #ccc;
    display: flex;
    justify-content: space-evenly;
    align-items: center;

    .icon-home,
    .icon-cart {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      .van-icon {
        font-size: 24px;
      }
    }
    .icon-cart .cart-count {
      color:#fff;
      text-align: center;
      line-height: 14px;
      position: absolute;
      top: -5px;
      right: -5px;
      width: 20px;
      height: 14px;
      background-color: #ff6600;
      border-radius: 14px;
    }

    .btn-add,
    .btn-buy {
      height: 36px;
      line-height: 36px;
      width: 120px;
      border-radius: 18px;
      background-color: #ffa900;
      text-align: center;
      color: #fff;
      font-size: 14px;
    }

    .btn-buy {
      background-color: #fe5630;
    }
  }

  .content {
    padding: 10px;

    .goods_info {
      display: flex;

      .goods-img {
        width: 100px;
        height: 100px;
      }
    }
  }

  .footer {
    position: fixed;
    /*固定在底部不被内容挤压*/
    bottom: 0;
    left: 0;
    right: 0;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .goods-info-detail {
    margin-left: 10px;

    .goods-price {
      font-size: 20px;
      color: #fa2209;
    }

    .goods-storage {
      font-size: 16px;
      color: #959595;
    }
  }
}

.tips {
  padding: 10px;
}
</style>
