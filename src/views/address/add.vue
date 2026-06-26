<template>
  <div class="address-add">
    <van-nav-bar :title="isEditMode ? '编辑地址' : '新增地址'" left-arrow @click-left="$router.go(-1)" />
    <van-address-edit
      :area-list="areaList"
      :address-info="addressInfo"
      show-set-default
      :area-columns-placeholder="['请选择', '请选择', '请选择']"
      @save="onSave"
    />
  </div>
</template>

<script>
import { addAddress, editAddress } from '@/api/address'
import { getRegionTree } from '@/api/region'

/**
 * 构建 Vant Area 6 位编码（XXYYZZ）：
 *   XX = 省份序号（01 起）
 *   YY = 城市序号（01 起，省份内递增）
 *   ZZ = 区县序号（01 起，城市内递增）
 * 返回 areaList + codeToId 反向映射 + nameToCode
 */
function buildAreaData (tree) {
  const provinceList = {}
  const cityList = {}
  const countyList = {}
  const nameToCode = {}
  const codeToId = {}

  let pIdx = 0
  for (const pid of Object.keys(tree)) {
    pIdx++
    const province = tree[pid]
    const pCode = String(pIdx).padStart(2, '0') + '0000'
    provinceList[pCode] = province.name
    nameToCode[province.name] = pCode

    if (province.city) {
      let cIdx = 0
      for (const cid of Object.keys(province.city)) {
        cIdx++
        const city = province.city[cid]
        const cPrefix = String(pIdx).padStart(2, '0') + String(cIdx).padStart(2, '0')
        const cCode = cPrefix + '00'
        cityList[cCode] = city.name
        nameToCode[city.name] = cCode

        if (city.region) {
          let rIdx = 0
          for (const rid of Object.keys(city.region)) {
            rIdx++
            const region = city.region[rid]
            const rCode = cPrefix + String(rIdx).padStart(2, '0')
            countyList[rCode] = region.name
            nameToCode[region.name] = rCode
            codeToId[rCode] = {
              provinceId: Number(pid),
              cityId: Number(cid),
              regionId: Number(rid)
            }
          }
        }
      }
    }
  }

  return {
    areaList: { province_list: provinceList, city_list: cityList, county_list: countyList },
    nameToCode,
    codeToId
  }
}

export default {
  name: 'AddressForm',
  data () {
    return {
      areaList: { province_list: {}, city_list: {}, county_list: {} },
      nameToCode: {},
      codeToId: {},
      addressInfo: {}
    }
  },
  computed: {
    // 直接从路由判断当前是否为编辑模式，不依赖 created 中的赋值
    isEditMode () {
      return !!this.$route.query.address_id
    }
  },
  methods: {
    async onSave (content) {
      const { name, tel, province, city, county, addressDetail, areaCode } = content
      const mapped = this.codeToId[areaCode] || {}
      const region = [
        { value: mapped.provinceId, label: province },
        { value: mapped.cityId, label: city },
        { value: mapped.regionId, label: county }
      ]
      try {
        let res
        if (this.isEditMode) {
          const addressId = Number(this.$route.query.address_id)
          if (!addressId) {
            this.$toast('编辑失败：缺少地址ID')
            return
          }
          res = await editAddress({
            address_id: addressId,
            name,
            phone: tel,
            region,
            detail: addressDetail
          })
        } else {
          res = await addAddress({
            name,
            phone: tel,
            region,
            detail: addressDetail
          })
        }
        if (res.status === 200) {
          this.$toast(this.isEditMode ? '地址修改成功' : '地址添加成功')
          localStorage.removeItem('chosenAddressId')
          this.$router.go(-1)
        }
      } catch (e) {
        // response 拦截器已 toast 错误信息
      }
    }
  },
  async created () {
    try {
      const res = await getRegionTree()
      if (res.status === 200 && res.data) {
        const data = buildAreaData(res.data.list)
        this.areaList = data.areaList
        this.nameToCode = data.nameToCode
        this.codeToId = data.codeToId
      }
    } catch (e) {
      console.error('获取地区数据失败', e)
    }

    // 编辑模式：通过 query 参数构建 addressInfo
    const query = this.$route.query
    if (query.address_id) {
      const provinceCode = this.nameToCode[query.province] || ''
      const cityCode = this.nameToCode[query.city] || ''
      const regionCode = this.nameToCode[query.region] || ''
      this.addressInfo = {
        name: query.name,
        tel: query.phone,
        province: query.province,
        city: query.city,
        county: query.region,
        addressDetail: query.detail,
        areaCode: regionCode || cityCode || provinceCode || ''
      }
    }
  }
}
</script>

<style lang="less" scoped>
.address-add {
  background-color: #f7f8fa;
  min-height: 100vh;
}
</style>
