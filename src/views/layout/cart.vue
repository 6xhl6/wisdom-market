<template>
  <div class="cart-box">
    <div class="cart" v-if="cartTotal > 0">
      <van-nav-bar title="购物车" fixed />
      <!-- 购物车开头 -->
      <div class="cart-title">
        <span class="all">共<i>{{ cartTotal }}</i>件商品</span>
        <span class="edit"  @click="mode = mode === 'edit' ? 'delete' : 'edit'">
          <van-icon name="edit"/>
            {{mode === 'edit' ? '编辑' : '取消编辑'}}
        </span>
      </div>

    <!-- 购物车列表 -->
      <div class="cart-list">
        <div class="card-item" v-for="item in cartList" :key="item.id">
          <van-checkbox class="item-checkbox" v-model="item.checked"></van-checkbox>
          <van-card :num="item.goods_num" :price="item.goodsPricePrice" :title="item.goods.goods_name" :thumb="item.goods.goods_image">
            <template #footer>
              <van-button size="small" @click="update_goods(item.goods_id,item.goods_num-1)">-</van-button>
              <van-button size="small" @click="update_goods(item.goods_id,item.goods_num+1)">+</van-button>
            </template>
          </van-card>
        </div>
      </div>

      <div class="footer-fixed">
        <div  class="all-check">
          <van-checkbox id="all_checkbox" icon-size="18" v-model="is_AllChecked"></van-checkbox>
          <label for="all_checkbox">全选</label>
        </div>

        <div class="all-total">
          <div class="price">
            <span>合计：</span>
            <span>¥ <i class="totalPrice">{{totalPrice}}</i></span>
          </div>
          <div v-if="mode === 'edit'" class="goPay" @click="goPay">结算({{checked_Num}})</div>
          <div v-else class="delete" @click="deleteChecked">删除</div>
        </div>
      </div>
    </div>
    <div class="empty-cart" v-else>
      <img src="@/assets/empty.png" alt="">
      <div class="tips">
        您的购物车是空的, 快去逛逛吧
      </div>
      <div class="btn" @click="$router.push('/')">去逛逛</div>
    </div>
  </div>
</template>

<script>
import { detectLogin } from '@/utils/login-detect'
export default {
  name: 'CartPage',
  data () {
    return {
      mode: 'edit'
    }
  },
  methods: {
    goPay () {
      if (this.checked_Num > 0) {
        this.$router.push({
          path: '/pay',
          query: {
            mode: 'cart',
            cartIds: this.checked_list.map(item => item.id).join(',')
          }
        })
      }
    },
    async update_goods (goodsId, goodsNum) {
      if (goodsNum < 1) return
      this.$store.dispatch('cart/updateCartAction', { goodsId, goodsNum })
    },
    deleteChecked () {
      this.$dialog.confirm({
        title: '确认删除选中商品吗？'
      }).then(() => {
        const cartIds = this.checked_list.map(item => item.id)
        this.$store.dispatch('cart/deleteCartAction', cartIds)
      }).catch(() => {})
    }
  },
  async created () {
    if (!detectLogin(this, () => {})) {
      return
    }
    this.$store.dispatch('cart/getCartListAction')
  },
  computed: {
    checked_list () {
      return this.cartList.filter(item => item.checked)
    },
    checked_Num () {
      return this.checked_list.length
    },
    // 计算属性的可写性
    is_AllChecked: {
      get () { return this.cartList.every(item => item.checked) },
      set (newVal) {
        this.cartList.forEach(item => { item.checked = newVal })
      }
    },
    cartList () {
      return this.$store.state.cart.cartList
    },
    cartTotal () {
      return this.cartList.reduce((pre, cur) => pre + cur.goods_num, 0)
    },
    totalPrice () {
      return this.checked_list.reduce((pre, cur) => pre + cur.goods.goods_price_min * cur.goods_num, 0)
    }
  }
}
</script>

<style lang="less" scoped>
// 主题 padding
.cart-box {
  min-height: 100vh; //  购物车状态判断前预留高度
}
.cart {
  padding-top: 46px;
  padding-bottom: 100px;
  background-color: #f5f5f5;
  .card-item {
    display: flex;
    align-items: center;
    background-color: #fafafa;
    .item-checkbox {
      flex-shrink: 0;
      margin-left: 10px;
    }
  }
  .cart-title {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    font-size: 14px;
    .all {
      i {
        font-style: normal;
        margin: 0 2px;
        color: #fa2209;
        font-size: 16px;
      }
    }
    .edit {
      .van-icon {
        font-size: 18px;
      }
    }
  }

  .cart-item {
    margin: 0 10px 10px 10px;
    padding: 10px;
    display: flex;
    justify-content: space-between;
    background-color: #ffffff;
    border-radius: 5px;

    .show img {
      width: 100px;
      height: 100px;
    }
    .info {
      width: 210px;
      padding: 10px 5px;
      font-size: 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .bottom {
        display: flex;
        justify-content: space-between;
        .price {
          display: flex;
          align-items: flex-end;
          color: #fa2209;
          font-size: 12px;
          span {
            font-size: 16px;
          }
        }
        .count-box {
          display: flex;
          width: 110px;
          .add,
          .minus {
            width: 30px;
            height: 30px;
            outline: none;
            border: none;
          }
          .inp {
            width: 40px;
            height: 30px;
            outline: none;
            border: none;
            background-color: #efefef;
            text-align: center;
            margin: 0 5px;
          }
        }
      }
    }
  }
}

.footer-fixed {
  position: fixed;
  left: 0;
  bottom: 50px;
  height: 50px;
  width: 100%;
  border-bottom: 1px solid #ccc;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;

  .all-check {
    display: flex;
    align-items: center;
    .van-checkbox {
      margin-right: 5px;
    }
  }

  .all-total {
    display: flex;
    line-height: 36px;
    .price {
      font-size: 14px;
      margin-right: 10px;
      .totalPrice {
        color: #fa2209;
        font-size: 18px;
        font-style: normal;
      }
    }

    .goPay, .delete {
      min-width: 100px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      background-color: #fa2f21;
      color: #fff;
      border-radius: 18px;
      &.disabled {
        background-color: #ff9779;
      }
    }
  }

}
.empty-cart {
  padding: 80px 30px;
  img {
    width: 140px;
    height: 92px;
    display: block;
    margin: 0 auto;
  }
  .tips {
    text-align: center;
    color: #666;
    margin: 30px;
  }
  .btn {
    width: 110px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    background-color: #fa2c20;
    border-radius: 16px;
    color: #fff;
    display: block;
    margin: 0 auto;
  }
}
</style>
