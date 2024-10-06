import { createRouter, createWebHistory } from '@ionic/vue-router';
import { useAuthStore } from '@/stores/authStore';
import LoginPage from '@/views/LoginPage.vue';
import HomePage from '@/views/HomePage.vue';
import ProjectsPage from '@/views/ProjectsPage.vue';
import { IonRouterOutlet } from '@ionic/vue';
import { Component } from 'ionicons/dist/types/stencil-public-runtime';
import { useTtStore } from '@/stores/ttStore';
import FiltersPage from '@/views/FiltersPage.vue';
import IssuesPage from '@/views/IssuesPage.vue';
import IssuePage from '@/views/IssuePage.vue';


const routes = [
  {
    path: '/login',
    component: LoginPage,
  },
  {
    path: '/',
    component: IonRouterOutlet, // Главная страница (пример)
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        component: HomePage
      },
      {
        path: 'tt',
        component: IonRouterOutlet,
        children: [
          {
            path: '',
            redirect: '/tt/projects'
          },
          {
            path: 'projects',
            name: 'projects',
            component: ProjectsPage,
          },
          {
            path: 'filters',
            name: 'filters',
            component: FiltersPage,
          },
          {
            path: 'issues',
            name: 'issues',
            component: IssuesPage,
          },
          {
            path: 'issue:id',
            name: 'issue',
            component: IssuePage,
          }
        ]
      },
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

  next();
})

export default router;
