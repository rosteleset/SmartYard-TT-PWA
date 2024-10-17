import { BackgroundSyncPlugin, } from 'workbox-background-sync';
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, NetworkOnly } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope
cleanupOutdatedCaches()

precacheAndRoute(self.__WB_MANIFEST)

self.skipWaiting()
clientsClaim()

const SERVER_URL = import.meta.env.VITE_SERVER_URL

// Регистрация маршрута для кеширования всех запросов к SERVER_URL
registerRoute(
    ({ url, request }) => url.href.startsWith(SERVER_URL) && request.method === 'GET',
    new NetworkFirst({
        cacheName: 'api-cache',
    })
);

// Настройка BackgroundSyncPlugin
const bgSyncPlugin = new BackgroundSyncPlugin('issueUploadQueue', {
    maxRetentionTime: 48 * 60, // Хранить запросы в течение 48 часов

});

// Регистрация маршрута для обработки запросов на загрузку фотографий
registerRoute(
    ({ url }) => [`${SERVER_URL}/tt/file`, `${SERVER_URL}/tt/comment`].includes(url.href),
    new NetworkOnly({
        plugins: [bgSyncPlugin]
    }),
    'POST'
);




