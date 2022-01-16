import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    alias: '/',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/submit',
    name: 'Submit',
    component: () => import('@/views/Submit.vue'),
  },
  {
    path: '/query',
    name: 'Query',
    component: () => import('@/views/Query.vue'),
  },
  {
    path: '/review',
    name: 'Review',
    component: () => import('@/views/Review.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
