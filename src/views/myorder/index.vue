<template>
  <div class="order">
    <van-nav-bar title="我的订单" left-arrow @click-left="$router.go(-1)" />
    <van-tabs v-model="active" @change="handleChange">
      <van-tab title="全部"></van-tab>
      <van-tab title="待支付"></van-tab>
      <van-tab title="待发货"></van-tab>
      <van-tab title="待收货"></van-tab>
      <van-tab title="待评价"></van-tab>
    </van-tabs>

    <OrderListItem :orderlist="orderList" :totalnumlist="totalNumList" @refresh="refresh"></OrderListItem>
  </div>
</template>

<script>
import OrderListItem from '@/components/OrderListItem.vue'
import { getOrderList } from '@/api/order'
export default {
  name: 'OrderPage',
  components: {
    OrderListItem
  },
  data () {
    return {
      orderList: [],
      dataTypes: ['all', 'payment', 'delivery', 'received', 'comment'],
      active: 0,
      totalNumList: []
    }
  },
  async created () {
    const idx = this.dataTypes.indexOf(this.$route.query.dataType)
    this.active = idx !== -1 ? idx : 0
    const res = await getOrderList({
      dataType: this.dataTypes[this.active],
      page: 1
    })
    this.orderList = res.data.list.data
    this.totalNumList = this.orderList.map(order => order.goods.reduce((pre, cur) => {
      return pre + cur.total_num
    }, 0))
  },
  methods: {
    async handleChange (index) {
      const res = await getOrderList({
        dataType: this.dataTypes[index],
        page: 1
      })
      this.orderList = res.data.list.data
      this.totalNumList = this.orderList.map(order => order.goods.reduce((pre, cur) => {
        return pre + cur.total_num
      }, 0))
    },
    async refresh () {
      const res = await getOrderList({
        dataType: this.dataTypes[this.active],
        page: 1
      })
      this.orderList = res.data.list.data
      this.totalNumList = this.orderList.map(order => order.goods.reduce((pre, cur) => {
        return pre + cur.total_num
      }, 0))
    }
  }
}
</script>

<style lang="less" scoped>
.order {
  background-color: #fafafa;
}
.van-tabs {
  position: sticky;
  top: 0;
}
</style>
