import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/login.vue'
import ShowData from '../pages/showData.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/showData', component: ShowData }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
