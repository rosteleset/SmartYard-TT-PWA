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
import { Preferences } from '@capacitor/preferences';
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
        redirect:'/tt'
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
  useUsersStore()
  if (!ttStore.meta) {
    await ttStore.load();
  }
  try {
    if (to.path.startsWith('/tt/issues')) {
      const lastProject = (await Preferences.get({ key: 'lastProject' })).value;
      const lastFilter = (await Preferences.get({ key: 'lastFilter' })).value;

      const project = to.query['project'] as string ?? lastProject;
      const filter = to.query['filter'] as string ?? lastFilter;

      const queryUpdates: Record<string, string> = {};

      if (project) {
        ttStore.project = ttStore.meta?.projects.find(p => p.acronym === project);
        if (project !== lastProject) {
          await Preferences.set({ key: 'lastProject', value: project });
        }
        if (!to.query['project']) queryUpdates['project'] = project;
      }

      if (filter) {
        ttStore.filter = ttStore.getFilterWithLabel(filter);
        if (filter !== lastFilter) {
          await Preferences.set({ key: 'lastFilter', value: filter });
        }
        if (!to.query['filter']) queryUpdates['filter'] = filter;
      }

      if (Object.keys(queryUpdates).length > 0) {
        next({ ...to, query: { ...to.query, ...queryUpdates } });
      }
      else {
        next();
      }
    } else {
      next();
    }
  } catch (error) {
    console.warn(error);
    next();
  }
});


export default router;
