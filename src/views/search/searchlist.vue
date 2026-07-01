<template>
  <div class="search">
    <van-nav-bar fixed title="商品列表" left-arrow @click-left="$router.go(-1)" />
    <van-search
      readonly
      shape="round"
      background="#ffffff"
      :value="keyword"
      show-action
      @click="$router.push('/search')"
    >
      <template #action>
        <van-icon class="tool" name="apps-o" />
      </template>
    </van-search>

    <!-- 排序选项按钮 -->
    <div class="sort-btns">
      <div class="sort-item" :class="{'active': active === 0}" @click="sortBy('all')">排序综合</div>
      <div class="sort-item" :class="{'active': active === 1}" @click="sortBy('sales')">销量排序</div>
      <div class="sort-item" :class="{'active': active === 2}" @click="sortBy('price')">价格排序 </div>
    </div>

    <div class="goods-list" v-if="goodsList.length">
      <GoodsItem v-for="item in goodsList" :key="item.goods_id" :item="item"></GoodsItem>
    </div>
    <div class="empty" v-else>
      <img src="@/assets/empty.png" alt="">
      <p>暂无相关商品</p>
    </div>
  </div>
</template>

<script>
import GoodsItem from '@/components/GoodsItem.vue'
import { getSearchList } from '@/api/search.js'
export default {
  name: 'SearchList',
  data () {
    return {
      keyword: this.$route.params.keyword || '',
      categoryId: this.$route.query.categoryId || 0,
      goodsList: [],
      active: 0,
      sortTypeList: ['all', 'sales', 'price']
    }
  },
  components: {
    GoodsItem
  },
  async created () {
    const res = await getSearchList({
      categoryId: this.$route.query.categoryId || 0,
      goodsName: this.$route.params.keyword || '',
      page: 1
    })
    this.goodsList = res.data.list.data
  },
  methods: {
    async sortBy (type) {
      this.active = this.sortTypeList.indexOf(type)
      const res = await getSearchList({
        categoryId: this.$route.query.categoryId || 0,
        goodsName: this.$route.params.keyword || '',
        page: 1,
        sortType: type
      })
      this.goodsList = res.data.list.data
    }
  }
}
</script>

<style lang="less" scoped>
.search {
  padding-top: 46px;
  ::v-deep .van-icon-arrow-left {
    color: #333;
  }
  .tool {
    font-size: 24px;
    height: 40px;
    line-height: 40px;
  }

  .sort-btns {
    display: flex;
    height: 36px;
    line-height: 36px;
    .sort-item {
      position: relative;
      text-align: center;
      flex: 1;
      font-size: 16px;
      color: #333;
      &.active {
        color: #fa2209;
        &::after {
          position: absolute;
          bottom: 0;
          left: 0;
          content: '';
          display: block;
          width: 100%;
          height: 2px;
          background-color: #fa2209;
        }
      }
    }
  }
}

// 商品样式
.goods-list {
  min-height: 300px; // 搜索结果异步加载前预留高度
  background-color: #f6f6f6;
}

.empty {
  text-align: center;
  padding-top: 100px;
  color: #999;
  font-size: 14px;

  img {
    width: 120px;
    height: 120px;
    margin-bottom: 10px;
  }
}
</style>
