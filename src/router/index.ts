import { useAuthStore } from '@/stores/authStore';
import { useTtStore } from '@/stores/ttStore';
import HomePage from '@/views/HomePage.vue';
import IssuePage from '@/views/IssuePage.vue';
import IssuesPage from '@/views/IssuesPage.vue';
import LoginPage from '@/views/LoginPage.vue';
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
        component: HomePage,
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

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  await authStore.initialize();
  if (to.meta.requiresAuth && !authStore.token) {
    next('/login');
  } else {
    next();
  }
});

router.beforeEach(async (to, from, next) => {

  const ttStore = useTtStore();

  if (to.path.startsWith('/tt') && !ttStore.meta)
    await ttStore.load();

  if (to.query['project'])
    ttStore.project = ttStore.meta?.projects.find(p => p.acronym === to.query['project'])

  if (to.query['filter'])
    ttStore.filter = ttStore.getFilterWithLabel(to.query['filter'] as string)

  next();
})

export default router;
