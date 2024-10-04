import { createRouter, createWebHistory } from '@ionic/vue-router';
import { useAuthStore } from '@/stores/authStore';
import LoginPage from '@/views/LoginPage.vue';
import HomePage from '@/views/HomePage.vue';


const routes = [
  {
    path: '/login',
    component: LoginPage,
  },
  {
    path: '/',
    component: HomePage, // Главная страница (пример)
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  await authStore.initialize();
  if (to.meta.requiresAuth && !authStore.token) {
    next('/login');
  } else {
    next();
  }
});

export default router;
