import { useAuthStore } from '@/stores/authStore';
import useSettingsStore from '@/stores/settingsStore';
import { useTtStore } from '@/stores/ttStore';
import { useUsersStore } from '@/stores/usersStore';
import { createRouter, createWebHistory } from '@ionic/vue-router';

const routes = [
  {
    path: '/login',
    component: () => import('@/views/LoginPage.vue'),
  },
  {
    path: '/',
    component: () => import('@/views/SimplePage.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        component: () => import('@/views/HomePage.vue'),
        // redirect: 'issues'
      },
      {
        path: 'issues',
        name: 'issues',
        component: () => import('@/views/IssuesPage.vue'),
      },
      {
        path: 'issue/:id',
        name: 'issue',
        component: () => import('@/views/IssuePage.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/SettingsPage.vue'),
      }
    ]
  },
];



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});



// init hook
router.beforeEach(async (to, from, next) => {
  const settingsStore = useSettingsStore();
  const authStore = useAuthStore();

  if (!settingsStore.isInitialized)
    await settingsStore.init();
  if (!authStore.user)
    await authStore.initialize();
  if (to.meta.requiresAuth && !authStore.token) {
    next('/login');
  } else {
    next();
  }
});

// tt hook
router.beforeEach(async (to, from, next) => {
  const ttStore = useTtStore();
  const usersStore = useUsersStore();

  try {
    if (to.path.startsWith('/login'))
      return
    if (!ttStore.meta)
      await ttStore.load();
    if (usersStore.users.length === 0)
      await usersStore.load();
  } catch (error) {
    console.warn(error);
  } finally {
    next();
  }
});

router.beforeEach((to, from, next) => {
  if (to.path === '/' && from.path === '/issues') {
    if (confirm('Вы хотите выйти из приложения?')) {
      next()
      router.back()
    } else {
      next(false)
      router.push(from.fullPath);
    }
  } else {
    next();
  }
});


export default router;
