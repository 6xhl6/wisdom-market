import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginIndex from '@/views/login/index.vue'
import MyOrderIndex from '@/views/myorder/index.vue'
import PayIndex from '@/views/pay/index.vue'
import SearchIndex from '@/views/search/index.vue'
import ProDetailIndex from '@/views/prodetail/index.vue'
import store from '@/store'
import SearchList from '@/views/search/searchlist.vue'
import AddressIndex from '@/views/address/index.vue'
import AddressAdd from '@/views/address/add.vue'
import Toast from 'vant/es/toast'

const LayoutIndex = () => import('@/views/layout/index.vue')
const Home = () => import('@/views/layout/home.vue')
const Apps = () => import('@/views/layout/apps.vue')
const Cart = () => import('@/views/layout/cart.vue')
const User = () => import('@/views/layout/user.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/login', component: LoginIndex },
  {
    path: '/',
    component: LayoutIndex,
    redirect: '/home',
    children: [
      { path: '/home', component: Home },
      { path: '/apps', component: Apps },
      { path: '/cart', component: Cart },
      { path: '/user', component: User }
    ]
  },
  { path: '/myorder', component: MyOrderIndex },
  { path: '/pay', component: PayIndex },
  { path: '/search', component: SearchIndex },
  { path: '/prodetail/:id', component: ProDetailIndex },
  { path: '/searchlist/:keyword?', component: SearchList },
  { path: '/address', component: AddressIndex },
  { path: '/address/add', component: AddressAdd },
  { path: '/address/edit', component: AddressAdd }
]

const router = new VueRouter({
  routes
})

const authPages = ['/pay', '/myorder', '/address/add', '/address/edit']

router.beforeEach((to, from, next) => {
  const token = store.state.user.userInfo.token
  if (authPages.includes(to.path) && !token) {
    Toast.fail('请先登录')
    router.replace('/login')
    return
  }
  next()
})

export default router
