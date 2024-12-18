import { BackgroundSyncPlugin, } from 'workbox-background-sync';
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst, NetworkOnly } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope
cleanupOutdatedCaches()

precacheAndRoute(self.__WB_MANIFEST)

self.skipWaiting()
clientsClaim()

const SERVER_URL = import.meta.env.VITE_SERVER_URL

function notifyClients(message: string) {
    self.registration.showNotification('TT', {
        body: message,
        icon: `${import.meta.env.BASE_URL}favicon.png`,
    });
}


// Регистрация маршрута для кеширования всех запросов к SERVER_URL
registerRoute(
    ({ url, request }) => url.href.startsWith(SERVER_URL) && request.method === 'GET',
    new NetworkFirst({
        cacheName: 'api-cache',
    })
);

// Настройка BackgroundSyncPlugin
const bgSyncPlugin = new BackgroundSyncPlugin('issueUploadQueue', {
    maxRetentionTime: 48 * 60,
    onSync: async ({ queue }) => {
        let entry;
        while ((entry = await queue.shiftRequest())) {
            try {
                await fetch(entry.request);
                notifyClients('Фотографии успешно отправлены на сервер.');
            } catch (error) {
                console.error('Повторная попытка не удалась, возвращаем запрос в очередь', error);
                await queue.unshiftRequest(entry);
                notifyClients('Ошибка при отправке фотографий. Будет повторная попытка.');
                throw error; // Останавливаем цикл, чтобы попробовать снова позже
            }
        }
    },
});


// Регистрация маршрута для обработки запросов на загрузку фотографий
registerRoute(
    ({ url }) => [`${SERVER_URL}/tt/file`, `${SERVER_URL}/tt/comment`].includes(url.href),
    new NetworkOnly({
        plugins: [bgSyncPlugin]
    }),
    'POST'
);

// Регистрируем маршрут навигации
if (import.meta.env.DEV) {
    console.log('Режим разработки: сервис-воркер не будет регистрировать маршруты навигации.');
} else {
    const handler = createHandlerBoundToURL(`${import.meta.env.BASE_URL}index.html`);
    const navigationRoute = new NavigationRoute(handler);
    registerRoute(navigationRoute);
}
