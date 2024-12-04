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

router.beforeEach((to, from, next) => {
  if (to.hash && to.path === '/') {
    const hash = to.hash.substring(1); // Удаляем ведущий '#'
    const params = new URLSearchParams(hash);
    const issueId = params.get('issue');
    const filter = params.get('filter');
    const search = params.get('search');
    const skip = params.get('skip');

    if (issueId) {
      // Перенаправляем на /issue/:id без сохранения параметров запроса
      next({
        name: 'issue',
        params: { id: issueId },
      });
    } else {
      // Перенаправляем на /issues с сохранением параметров запроса
      next({
        name: 'issues',
        query: { filter, search, skip }
      });
    }
  } else {
    next();
  }
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
      await ttStore.load(to.query);
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
