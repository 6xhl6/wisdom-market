<template>
  <div class="address-container">
    <van-nav-bar title="收货地址" left-arrow @click-left="goBack" />
    <div class="address-list">
      <van-address-list
        v-model="chosenAddressId"
        :list="address_list"
        default-tag-text="默认"
        @edit-item="onEditItem"
        @add="onAdd"
      />
    </div>
  </div>
</template>
<script>
import { getAddressList } from '@/api/address'
export default {
  name: 'AddressIndex',
  data () {
    return {
      address_list: [],
      chosenAddressId: '',
      rawList: []
    }
  },
  methods: {
    goBack () {
      this.$router.go(-1)
    },
    onAdd () {
      this.$router.push({ path: '/address/add' })
    },
    onEditItem (item) {
      const raw = this.rawList.find(r => r.address_id === item.id)
      if (raw) {
        this.$router.push({
          path: '/address/edit',
          query: {
            address_id: raw.address_id,
            name: raw.name,
            phone: raw.phone,
            province: raw.region.province,
            city: raw.region.city,
            region: raw.region.region,
            detail: raw.detail
          }
        })
      }
    }
  },
  watch: {
    chosenAddressId (val) {
      if (val) {
        localStorage.setItem('chosenAddressId', val)
      }
    }
  },
  async created () {
    const res = await getAddressList()
    this.rawList = res.data.list
    this.address_list = res.data.list.map((item, index) => ({
      id: item.address_id,
      name: item.name,
      tel: item.phone,
      address: `${item.region.province}${item.region.city}${item.region.region} ${item.detail}`,
      isDefault: index === 0
    }))

    // 恢复之前选中的地址，或默认第一个
    const savedId = localStorage.getItem('chosenAddressId')
    if (savedId && this.address_list.find(item => item.id === Number(savedId))) {
      this.chosenAddressId = Number(savedId)
    } else if (this.address_list.length > 0) {
      this.chosenAddressId = this.address_list[0].id
    }
  }
}
</script>
<style lang="less" scoped>
.address-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}
.address-list {
  padding-bottom: 80px;
}
</style>
