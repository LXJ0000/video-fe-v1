import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/video/:id',
      name: 'video',
      component: () => import('../views/VideoView.vue')
    },
    {
      path: '/manage',
      name: 'manage',
      component: () => import('../views/VideoManageView.vue')
    }
  ]
})

export default router 