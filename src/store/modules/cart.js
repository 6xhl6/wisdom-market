import { getCartList, updateCartList, deleteCartList } from '@/api/cart.js'

export default {
  namespaced: true,
  state: {
    cartList: []
  },
  mutations: {
    setCartList (state, newList) {
      state.cartList = newList
    },
    updateCartList (state, { goodsId, goodsNum }) {
      const index = state.cartList.findIndex(item => item.goods_id === goodsId)
      if (index !== -1) {
        state.cartList[index].goods_num = goodsNum
      }
    },
    delCartList (state, cartIds) {
      state.cartList = state.cartList.filter(item => !cartIds.includes(item.id))
    }
  },
  actions: {
    async getCartListAction (context) {
      const { data } = await getCartList()
      data.list.forEach(item => {
        item.checked = true
      })
      context.commit('setCartList', data.list)
    },
    async updateCartAction (context, obj) {
      const res = await updateCartList(obj)
      if (res.status === 200) {
        context.commit('updateCartList', obj)
      }
    },
    async deleteCartAction (context, cartIds) {
      await deleteCartList(cartIds)
      context.commit('delCartList', cartIds)
    }
  },
  getters: {
    getCartList (state) {
      return state.cartList
    }
  }
}
