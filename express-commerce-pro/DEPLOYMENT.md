# Руководство по развертыванию приложения на VPS

Данное руководство содержит пошаговую инструкцию по размещению и бесперебойному запуску вашего интернет-магазина на любом сервере Linux (VPS/VDS) под управлением Ubuntu/Debian.

---

## Требования к серверу
- **ОС**: Ubuntu 20.04 LTS / 22.04 LTS (или Debian 11+)
- **Ресурсы**: Минимум 1 vCPU, 1 GB RAM (для сборки лучше иметь 2 GB или настроить Swap).
- **Стек**: Node.js v18+, Nginx, PM2.

---

## Шаг 1: Подготовка сервера и установка Node.js

Подключитесь к вашему VPS по SSH:
```bash
ssh root@your_vps_ip
```

Обновите пакеты системы:
```bash
sudo apt update && sudo apt upgrade -y
```

Установите Node.js (рекомендуется LTS версия via NodeSource):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Проверьте установку Node.js и npm:
```bash
node -v
npm -v
```

Установите PM2 (глобальный менеджер процессов для Node.js):
```bash
sudo npm install --global pm2
```

---

## Шаг 2: Клонирование и настройка приложения

Перенесите файлы вашего проекта на сервер (в директорию `/var/www/my-store`):

```bash
sudo mkdir -p /var/www/my-store
sudo chown -R $USER:$USER /var/www/my-store
cd /var/www/my-store
```

После переноса файлов проекта выполните установку зависимостей:
```bash
npm install
```

### Настройка файла `.env`
Создайте рабочий конфигурационный файл `.env`:
```bash
cp .env.example .env
nano .env
```

Заполните значения:
```env
PORT=3000
HOST=127.0.0.1
NODE_ENV=production
JWT_SECRET=ОченьДлинныйИНадежныйСекретныйКлючДляJWT123!
DATA_DIR=/var/www/my-store/data
```
> **Важно**: Обязательно замените `JWT_SECRET` на уникальный случайный набор символов для защиты сессий пользователей!

---

## Шаг 3: Сборка проекта

Запустите оптимизированный процесс сборки. Скрипт соберет клиентскую статическую часть (Vite) и объединит серверный файл в `dist/server.cjs`:
```bash
npm run build
```

Все финальные файлы для развертывания будут созданы в папке `dist/`.

---

## Шаг 4: Настройка фонового запуска через PM2

Для обеспечения непрерывного выполнения сервера в фоне при сбоях или перезагрузке серверах используйте PM2:

```bash
pm2 start dist/server.cjs --name "my-store"
```

### Настройка автозапуска при перезагрузке VPS:
```bash
pm2 startup
```
*PM2 выведет команду, которую нужно скопировать и запустить от root для завершения настройки.*

После чего сохраните активный список процессов:
```bash
pm2 save
```

### Полезные команды PM2:
- Просмотр логов: `pm2 logs my-store`
- Мониторинг процессов: `pm2 monit`
- Перезапуск сервиса: `pm2 restart my-store`
- Статус процессов: `pm2 status`

---

## Шаг 5: Настройка Nginx в качестве Reverse Proxy

Установите веб-сервер Nginx:
```bash
sudo apt install nginx -y
```

Создайте конфигурационный файл для вашего сайта:
```bash
sudo nano /etc/nginx/sites-available/my-store
```

Вставьте следующее содержимое, заменив `your_domain.com` на реальный домен вашего сайта (или IP-адрес сервера):

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    # Сжатие gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    location / {
        proxy_pass http://127.0.0.1:3000; # Наш бэкенд на Node.js
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Локальное кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|otf)$ {
        root /var/www/my-store/dist;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        try_files $uri @backend;
    }

    location @backend {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Активируйте домен в Nginx и удалите конфигурацию по умолчанию:
```bash
sudo ln -s /etc/nginx/sites-available/my-store /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
```

Проверьте корректность конфигурации Nginx:
```bash
sudo nginx -t
```

Перезапустите Nginx:
```bash
sudo systemctl restart nginx
```

---

## Шаг 6: Настройка бесплатного SSL (HTTPS)

Для защиты паролей пользователей необходимо настроить безопасное HTTPS соединение с помощью Certbot (Let's Encrypt).

Установите Certbot и плагин для Nginx:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

Автоматически выпустите и примените SSL-сертификаты к вашему домену:
```bash
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```
*Certbot задаст вопрос, нужно ли перенаправлять HTTP трафик на HTTPS. Выберите вариант **Redirect** (перенаправление).*

Сертификат работает бесплатно 90 дней и автоматически продлевается системным таймером cron.

---

## Резервное копирование базы данных

Ваша база данных сохраняется в формате JSON в директории `data/db.json` (или по пути `DATA_DIR` из файла `.env`).

Для создания резервной копии достаточно скопировать этот файл:
```bash
cp /var/www/my-store/data/db.json /backup/my-store/db_$(date +%F_%T).json
```
Рекомендуется настроить автоматический cron-скрипт регулярного бэкапа.
