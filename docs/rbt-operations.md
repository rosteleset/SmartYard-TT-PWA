# RBT Operations in SmartYard TT PWA

Расширенные разделы используют ту же сессию и Bearer-токен, что и TT. Базовый URL задаётся через `VITE_SERVER_URL`, обычно это `/frontend` текущего RBT-инстанса или полный URL вида `https://rbt.example.com/frontend`.

## Маршруты PWA

- `/issues` — заявки;
- `/devices` — камеры и домофоны;
- `/houses` — поиск домов;
- `/house/:houseId` — квартиры выбранного дома;
- `/flat/:flatId` — управление квартирой.

## Используемые API

### Устройства

- `GET /cameras/cameras`;
- `GET /houses/domophones`;
- `PUT /houses/domophone/:domophoneId` для режима свободного прохода.

### Дома и квартиры

- `GET /houses/search?search=...`;
- `GET /houses/house/:houseId`;
- `GET /houses/flat/:flatId`;
- `PUT /houses/flat/:flatId` для административной блокировки и кода открытия.

### Пользователи и ключи

- `GET /subscribers/subscribers?by=flatId&query=...`;
- `GET /subscribers/devices?by=flat&query=...`;
- `POST|PUT|DELETE /subscribers/subscriber`;
- `POST|DELETE /subscribers/key`.

Все пути указаны относительно `VITE_SERVER_URL`. Права проверяются штатным ACL RBT; PWA не расширяет права текущего пользователя.

## Открытие двери

Команда `PUT /houses/domophone/:domophoneId` с телом `{ "action": "openLock", "doorId": N }` не входит в базовую реализацию SmartYard Server. Для неё требуется custom backend `server/api/houses/custom/domophone.php` из RBT Admin Mobile. Без этого обработчика просмотр устройств и остальные операции продолжат работать, но команда открытия двери завершится ошибкой API.

## RFID

Перед отправкой ID ключа нормализуется до 7 байт: разделители удаляются, hex-символы переводятся в верхний регистр, короткое значение дополняется нулями слева. Дополненное значение не показывается пользователю в форме.
