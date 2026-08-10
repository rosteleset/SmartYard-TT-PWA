import { useAuthStore } from '@/stores/authStore';
import useSettingsStore from '@/stores/settingsStore';
import { useTtStore } from '@/stores/ttStore';
import { useUsersStore } from '@/stores/usersStore';
import { createRouter, createWebHistory } from '@ionic/vue-router';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginPage.vue'),
  },
  {
    path: '/',
    component: () => import('@/views/TabWrapper.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'issues' },
      },
      {
        path: 'issues',
        name: 'issues',
        component: () => import('@/views/IssuesPage.vue'),
        meta: { requiresTt: true },
      },
      {
        path: 'issue/:id',
        name: 'issue',
        component: () => import('@/views/IssuePage.vue'),
        meta: { requiresTt: true },
      },
      {
        path: 'devices',
        name: 'devices',
        component: () => import('@/views/DevicesPage.vue'),
      },
      {
        path: 'houses',
        name: 'houses',
        component: () => import('@/views/HousesPage.vue'),
      },
      {
        path: 'house/:id',
        name: 'house',
        component: () => import('@/views/HousePage.vue'),
      },
      {
        path: 'flat/:id',
        name: 'flat',
        component: () => import('@/views/FlatPage.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/SettingsPage.vue'),
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
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
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

// tt hook
router.beforeEach(async (to, from, next) => {
  const ttStore = useTtStore();
  const usersStore = useUsersStore();

  try {
    if (to.name === 'login' || !to.matched.some(record => record.meta.requiresTt))
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


export default router;
