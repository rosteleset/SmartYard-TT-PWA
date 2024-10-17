import { useAuthStore } from '@/stores/authStore';
import useSettingsStore from '@/stores/settingsStore';
import { useTtStore } from '@/stores/ttStore';
import HomePage from '@/views/HomePage.vue';
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
        component: HomePage
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
          }
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

  try {
    if (to.path.startsWith('/tt') && !ttStore.meta)
      await ttStore.load();

    const project = to.query['project'] as string || (await Preferences.get({ key: 'lastProject' })).value
    const filter = to.query['filter'] as string || (await Preferences.get({ key: 'lastFilter' })).value

    console.log(project);
    console.log(filter);
    

    if (project) {
      ttStore.project = ttStore.meta?.projects.find(p => p.acronym === project)
      Preferences.set({ key: 'lastProject', value: project})
    }
    if (filter) {
      ttStore.filter = ttStore.getFilterWithLabel(filter)
      Preferences.set({ key: 'lastFilter', value: filter})
    }
  } catch (error) {
    console.warn(error);
  }

  next();
})

export default router;
