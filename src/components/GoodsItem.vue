<template>
    <div class="goods-item" @click="toDetail(item.goods_id)">
        <img :src="this.item.goods_image" alt="" loading="lazy">
        <div class="goods-info">
            <p class="goods-desc">{{ item.goods_name }}</p>
            <p class="goods-sales_count">{{ item.goods_sales }}</p>
            <div class="price">
                <span class="price-couned">¥{{ item.goods_price_max }}</span>
                <span class="price-origin">¥{{ item.line_price_max }}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: () => { }
    }
  },
  methods: {
    toDetail (id) {
      this.$router.push(`/prodetail/${id}`)
    }
  }
}
</script>

<style lang="less" scoped>
.goods-item {
    height: 100px;
    display: flex;
}

.goods-info {
    margin-left: 10px;
}

.goods-item img {
    width: 100px;
    height: 100px;
    display: block;
    // 明确宽高比让浏览器在图片加载前预留空间
    aspect-ratio: 1 / 1;
}

.goods-desc {
  font-size: 16px;
  font-weight: normal;
  color: #333;
  margin-top: 2px;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goods-sales_count {
    font-size: 14px;
    color: #b8b8b8;
    margin-bottom: 10px;
}

.price-couned {
    margin-right: 10px;
    color: red;
    font-size: 20px;
}

.price-origin {
    font-size: 14px;
    color: #b8b8b8;
    text-decoration: line-through;
}
</style>
