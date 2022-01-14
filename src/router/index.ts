import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Review.vue')
  },
  {
    path: '/review',
    name: 'Review',
    component: () => import('@/views/Review.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
