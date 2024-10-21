import { useAuthStore } from '@/stores/authStore';
import useSettingsStore from '@/stores/settingsStore';
import { useTtStore } from '@/stores/ttStore';
import { useUsersStore } from '@/stores/usersStore';
import IssuePage from '@/views/IssuePage.vue';
import IssuesPage from '@/views/IssuesPage.vue';
import LoginPage from '@/views/LoginPage.vue';
import SettingsPage from '@/views/SettingsPage.vue';
import SimplePage from '@/views/SimplePage.vue';
import TabWrapper from '@/views/TabWrapper.vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';


const routes = [
  {
    path: '/login',
    component: LoginPage,
  },
  {
    path: '/',
    component: TabWrapper,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/tt'
      },
      {
        path: 'tt',
        component: SimplePage,
        children: [
          {
            path: '',
            redirect: '/tt/issues'
          },
          {
            path: 'issues',
            name: 'issues',
            component: IssuesPage,
          },
          {
            path: 'issue/:id',
            name: 'issue',
            component: IssuePage,
          },
        ]
      },
      {
        path: 'settings',
        name: 'settings',
        component: SettingsPage,
        children: [
        ]
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
    await settingsStore.init()
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
  const usersStore = useUsersStore()

  try {
    if (to.path.startsWith('/tt')) {
      if (!ttStore.meta)
        await ttStore.load();
      if (usersStore.users.length === 0)
        await usersStore.load()
    }
    next();
  } catch (error) {
    console.warn(error);
    next();
  }
});


export default router;
