<template>
  <div class="layout">
    <router-view></router-view>
    <van-tabbar route active-color="#ee0a24" inactive-color="#000">
      <van-tabbar-item to="/home" icon="wap-home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/apps" icon="apps-o">分类页</van-tabbar-item>
      <van-tabbar-item to="/cart" icon="shopping-cart-o" :badge="cartBadge">购物车</van-tabbar-item>
      <van-tabbar-item to="/user" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>
<script>

export default {
  name: 'LayoutIndex',
  computed: {
    cartBadge () {
      const len = this.$store.state.cart.cartList.length
      return len > 0 ? len : ''
    }
  }
}
</script>
<style lang="less" scoped>
.van-icon-shopping-cart-o {
  ::v-deep .van-icon {
    min-width: 5.26667vw !important;
  }
}
</style>
