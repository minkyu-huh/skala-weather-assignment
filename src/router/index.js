import { createRouter, createWebHistory } from 'vue-router'
import WeatherHomeView from '../views/WeatherHomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'WeatherHome',
      component: WeatherHomeView,
    },
    {
      path: '/about',
      name: 'WeatherAbout',
      component: () => import('../views/WeatherAboutView.vue'),
    },
    {
      // 도시마다 View를 복사하지 않고 cityId 하나로 같은 상세 화면을 재사용한다.
      path: '/weather/:cityId',
      name: 'WeatherDetail',
      component: () => import('../views/WeatherDetailView.vue'),
    },
    {
      // 현재 위치 조회는 과제의 개인 기능으로 추가한 별도 View이다.
      path: '/my-location',
      name: 'MyLocation',
      component: () => import('../views/MyLocationView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

export default router
