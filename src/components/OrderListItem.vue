<template>
  <div class="container">
    <div class="order-list-item" v-for="(order, index) in orderlist" :key="order.order_id">
        <div class="tit">
            <div class="time">{{order.create_time}}</div>
            <div class="status">
                <span v-if="order.state_text == '待支付'">待支付</span>
                <span v-else-if="order.state_text == '待发货'">待发货</span>
                <span v-else-if="order.state_text == '部分发货'">部分发货</span>
                <span v-else-if="order.state_text == '待收货'">待收货</span>
                <span v-else-if="order.state_text == '待取消'">已取消</span>
                <span v-else>已完成</span>
            </div>
        </div>
        <div class="list">
            <div class="list-item" v-for="item in order.goods" :key="item.goods_id">
                <div class="goods-img">
                    <img :src="item.goods_image" alt="">
                </div>
                <div class="goods-content text-ellipsis-2">
                {{item.goods_name}}
                </div>
                <div class="goods-trade">
                    <p>¥ {{item.goods_price}}</p>
                    <p>x {{item.total_num}}</p>
                </div>

            </div>
        </div>
        <div class="total">
            共{{totalnumlist[index]}}件商品，总金额 ¥{{order.total_price}}
        </div>
        <div class="actions">
            <span v-if="order.state_text === '待支付'" @click="handlePay(order.order_id)">立刻付款</span>
            <span v-if="order.state_text === '待发货'" @click="handleCancel(order)">申请取消</span>
            <span v-if="order.state_text === '待收货'" @click="handleConfirm(order.order_id)">确认收货</span>
            <span v-if="order.state_text === '已完成'" @click="handleComment(order.order_id)">评价</span>
        </div>

    </div>
  </div>

</template>

<script>
import { payOrder, cancelOrder, confirmOrder } from '@/api/order'
export default {
  props: {
    orderlist: {
      type: Array,
      default: () => []
    },
    totalnumlist: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    async handlePay (orderId) {
      const res = await payOrder(orderId)
      if (res.status === 200) {
        this.$toast(res.message)
        this.$emit('refresh')
      }
    },
    async handleCancel (order) {
      const res = await cancelOrder(order.order_id)
      if (res.status === 200) {
        this.$toast(res.message)
        this.$emit('refresh')
      }
    },
    async handleConfirm (orderId) {
      const res = await confirmOrder(orderId)
      if (res.status === 200) {
        this.$toast(res.message)
        this.$emit('refresh')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.order-list-item {
  margin: 10px auto;
  width: 94%;
  padding: 15px;
  background-color: #ffffff;
  box-shadow: 0 0.5px 2px 0 rgba(0,0,0,.05);
  border-radius: 8px;
  color: #333;
  font-size: 13px;

  .tit {
    height: 24px;
    line-height: 24px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    .status {
      color: #fa2209;
    }
  }

  .list-item {
    display: flex;
    .goods-img {
      width: 90px;
      height: 90px;
      margin: 0px 10px 10px 0;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .goods-content {
      flex: 2;
      line-height: 18px;
      max-height: 36px;
      margin-top: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      word-break: break-all;
    }
    .goods-trade {
      flex: 1;
      line-height: 18px;
      text-align: right;
      color: #b39999;
      margin-top: 8px;
    }
  }

  .total {
    text-align: right;
  }
  .actions {
    text-align: right;
    span {
      display: inline-block;
      height: 28px;
      line-height: 28px;
      color: #383838;
      border: 0.5px solid #a8a8a8;
      font-size: 14px;
      padding: 0 15px;
      border-radius: 5px;
      margin: 10px 5px;
    }
  }
}
</style>
