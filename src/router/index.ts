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
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/user',
      name: 'user',
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('../views/LogIn.vue')
        },
        {
          path: 'signup',
          name: 'signup',
          component: () => import('../views/SignUp.vue')
        }
      ]
    },
    {
      path: '/agents',
      children: [
        {
          path: '',
          name: 'agents',
          component: () => import('../views/AgentsMain.vue')
        },
        {
          path: 'add',
          name: 'add',
          component: () => import('../views/AddAgent.vue')
        },
        {
          path: ':id',
          children: [
            {
              path: '',
              name: 'agentdetail',
              component: () => import('../views/AgentDetail.vue')
            },
            {
              path: 'edit',
              name: 'edit',
              component: () => import('../views/EditAgent.vue')
            }
          ]
        }
      ]
    },
    {
      path: '/events',
      children: [
        {
          path: '',
          name: 'events',
          component: () => import('../views/EventsMain.vue')
        },
        {
          path: ':id',
          name: 'eventdetail',
          component: () => import('../views/EventDetail.vue')
        }
      ]
    }
  ]
})

export default router
