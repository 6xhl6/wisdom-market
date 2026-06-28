<template>
  <div class="home">
    <!-- 导航条 -->
    <van-nav-bar title="智慧商城" fixed />

    <!-- 搜索框 -->
    <van-search
      readonly
      :shape="homeDataList.length ? homeDataList[0].style.searchStyle : 'round'"
      background="#f1f1f2"
      :placeholder="homeDataList.length ? homeDataList[0].params.placeholder : '请在此输入搜索关键词'"
      @click="$router.push('/search')"
    />

    <!-- 轮播图 -->
    <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white">
      <van-swipe-item v-for="(item, index) in (homeDataList.length > 1 ? homeDataList[1].data : [])" :key="index">
        <img :src="item.imgUrl" alt="">
      </van-swipe-item>
    </van-swipe>

    <!-- 导航 -->
    <van-grid column-num="5" icon-size="40">
      <van-grid-item
        v-for="(item, index) in (homeDataList.length > 3 ? homeDataList[3].data : [])" :key="index"
        :icon="item.imgUrl"
        :text="item.text"
        to="/apps"
      />
    </van-grid>

    <!-- 主会场 -->
    <div class="main">
      <img src="@/assets/main.png" alt="">
    </div>

    <!-- 猜你喜欢 -->
    <div class="guess">
      <p class="guess-title">—— 猜你喜欢 ——</p>

      <div class="goods-list">
        <GoodsItem v-for="item in (homeDataList.length > 6 ? homeDataList[6].data : [])" :key="item.goods_id" :item="item"></GoodsItem>
      </div>
    </div>
  </div>
</template>

<script>
import GoodsItem from '@/components/GoodsItem.vue'
import { getHomeData } from '@/api/home.js'

export default {
  name: 'HomePage',
  data () {
    return {
      homeDataList: []
    }
  },
  components: {
    GoodsItem
  },
  async created () {
    this.loadHomeData()
  },
  // keep-alive 激活时：数据已存在则跳过请求，避免切 tab 后重复请求
  activated () {
    if (this.homeDataList.length > 0) return
    this.loadHomeData()
  },
  methods: {
    async loadHomeData () {
      const res = await getHomeData()
      this.homeDataList = res.data.pageData.items
    }
  }
}
</script>

<style lang="less" scoped>
// 主题 padding
.home {
  padding-top: 100px;
  padding-bottom: 50px;
}

// 导航条样式定制
.van-nav-bar {
  z-index: 999;
  background-color: #c21401;
  ::v-deep .van-nav-bar__title {
    color: #fff;
  }
}

// 搜索框样式定制
.van-search {
  position: fixed;
  width: 100%;
  top: 46px;
  z-index: 999;
}

// 分类导航部分
.my-swipe .van-swipe-item {
  height: 185px;
  color: #fff;
  font-size: 20px;
  text-align: center;
  background-color: #39a9ed;
}
.my-swipe .van-swipe-item img {
  width: 100%;
  height: 185px;
}

// 主会场
.main img {
  display: block;
  width: 100%;
}

// 猜你喜欢
.guess .guess-title {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  line-height: 40px;
  text-align: center;
  color: #999;
  font-size: 14px;

  &::before,
  &::after {
    content: '';
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #ddd, transparent);
  }

  &::before {
    margin-right: 10px;
  }

  &::after {
    margin-left: 10px;
  }
}

// 商品样式
.goods-list {
  background-color: #f6f6f6;
}
</style>
