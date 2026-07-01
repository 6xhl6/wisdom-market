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
    <div class="nav-grid">
      <van-grid column-num="5" icon-size="40">
        <van-grid-item
          v-for="(item, index) in (homeDataList.length > 3 ? homeDataList[3].data : [])" :key="index"
          :icon="item.imgUrl"
          :text="item.text"
          to="/apps"
        />
      </van-grid>
    </div>

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
  methods: {
    async loadHomeData () {
      const res = await getHomeData()
      this.homeDataList = res.data.pageData.items

      // LCP 优化：API 响应后立即预加载首张轮播图
      const firstImage = this.homeDataList?.[1]?.data?.[0]?.imgUrl
      if (firstImage) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = firstImage
        document.head.appendChild(link)
      }
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
.my-swipe {
  min-height: 185px; // 轮播图数据异步加载前预留高度
}
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

// 导航网格 — 预留高度防 CLS
.nav-grid {
  min-height: 75px;
}

// 主会场
.main {
  min-height: 120px; // ★ CLS fix: 横幅图片加载前预留高度
}
.main img {
  display: block;
  width: 100%;
  // 已知 main.png 尺寸为 425×134，aspect-ratio 让浏览器提前计算高度
  aspect-ratio: 425 / 134;
  height: auto;
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
  min-height: 300px; // 商品列表异步加载前预留高度
  background-color: #f6f6f6;
}
</style>
