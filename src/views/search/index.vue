<template>
  <div class="search">
    <van-nav-bar title="商品搜索" left-arrow @click-left="$router.go(-1)" />
    <van-search ref="searchInput" v-model="search" @search="handleSearch" @submit.native.prevent="handleSearch" show-action action-text="搜索" placeholder="请输入搜索关键词" clearable>
      <template slot="action">
        <div @click="handleSearch">搜索</div>
      </template>
    </van-search>
    <!-- 搜索历史 -->
    <div class="search-history">
      <div class="title">
        <span>最近搜索</span>
        <van-icon name="delete-o" size="16" @click="clearHistory" />
      </div>
      <div class="list">
        <div class="list-item" v-for="(item,index) in history" :key="index" @click="$router.push(`/searchlist/${item}`)">{{ item }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { getHistory, setHistory } from '@/utils/storage'
export default {
  name: 'SearchIndex',
  data () {
    return {
      search: '',
      history: getHistory()
    }
  },
  // 搜索框自动获取焦点
  mounted () {
    this.$nextTick(() => {
      setTimeout(() => {
        const input = document.querySelector('.van-search__content input')
        if (input) {
          input.focus()
          input.click()
        }
      }, 300)
    })
  },
  methods: {
    handleSearch (val) {
      const keyword = typeof val === 'string' ? val.trim() : this.search.trim()
      if (!keyword) {
        this.$toast('请输入搜索关键词')
        this.search = ''
        return
      }
      if (this.history.includes(keyword)) {
        this.history.splice(this.history.indexOf(keyword), 1)
      }
      this.history.unshift(keyword)
      setHistory(this.history)
      this.$router.push('/searchlist/' + keyword)
      this.search = ''
    },
    clearHistory () {
      this.history = []
      setHistory(this.history)
      this.$toast('清除成功')
    }
  }
}
</script>

<style lang="less" scoped>
.search {
  .searchBtn {
    background-color: #fa2209;
    color: #fff;
  }
  ::v-deep .van-search__action {
    background-color: #c21401;
    color: #fff;
    padding: 0 20px;
    border-radius: 0 5px 5px 0;
    margin-right: 10px;
  }
  ::v-deep .van-icon-arrow-left {
    color: #333;
  }
  .title {
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
  }
  .list {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    padding: 0 10px;
    gap: 5%;
  }
  .list-item {
    width: 30%;
    text-align: center;
    padding: 7px;
    line-height: 15px;
    border-radius: 50px;
    background: #fff;
    font-size: 13px;
    border: 1px solid #efefef;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-bottom: 10px;
  }
}
</style>
