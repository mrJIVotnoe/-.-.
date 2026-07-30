# ⚓ Руководство по самостоятельному развёртыванию и бесшовной миграции (Self-Hosting & Cloud Migration Guide)

Данное руководство содержит пошаговую инструкцию по автономному запуску платформы **JIV Fleet Владивосток** на собственном сервере (Bare-Metal / VPS / Dedicated), а также готовые скрипты для бесшовной миграции в российские облака **Яндекс Облако (Yandex.Cloud)** и **Сбер Cloud.ru** после достижения критической массы пользователей.

---

## 🛠️ Архитектура автономного развёртывания (Bare-Metal)

Платформа спроектирована по стандарту **12-Factor App** и упакована в изолированные Docker-контейнеры:

- **Web & API Server**: Express.js + Vite CJS Bundle (Node 22 Alpine)
- **Database**: PostgreSQL 16 Alpine
- **Cache**: Redis 7 Alpine
- **Reverse Proxy**: NGINX with Gzip, Security Headers & Rate Limiting

---

## 🚀 Быстрый старт на собственном сервере (Docker Compose)

### 1. Требования к серверу
- **ОС**: Ubuntu 22.04 LTS / Debian 12 / RedHat / AlmaLinux
- **Минимальные ресурсы**: 1 vCPU, 2 ГБ RAM, 20 ГБ SSD
- **Рекомендуемые ресурсы**: 2-4 vCPU, 4-8 ГБ RAM, NVMe SSD
- **Установленное ПО**: Docker 24+ и Docker Compose v2+

### 2. Клонирование и настройка окружения
```bash
# Клонирование репозитория на ваш сервер
git clone https://github.com/your-org/jiv-vladivostok-fleet.git /opt/jiv-vladivostok-fleet
cd /opt/jiv-vladivostok-fleet

# Создание конфигурационного файла .env из шаблона
cp .env.example .env

# Отредактируйте .env и укажите ваш домен и API ключи
nano .env
```

### 3. Запуск сервисов
```bash
# Сборка контейнеров и запуск в фоновом режиме
docker compose up -d --build

# Проверка статуса контейнеров
docker compose ps

# Проверка логов приложения
docker compose logs -f app
```

Платформа станет доступна по адресу `http://<IP-вашего-сервера>`.

---

## 🔒 Настройка SSL / TLS сертификатов (HTTPS)

Для включения бесплатного SSL-сертификата от Let's Encrypt:

```bash
# Установка Certbot на хост-системе
sudo apt update && sudo apt install -y certbot

# Получение сертификата
sudo certbot certonly --standalone -d fleet.your-domain.ru

# Обновите конфигурацию NGINX в deploy/nginx/conf.d/app.conf для раскомментирования порта 443
```

---

## ⚙️ Управление через Systemd (Автозапуск)

Для автоматического запуска сервиса при перезагрузке сервера:

```bash
# Копирование юнита systemd
sudo cp deploy/systemd/jiv-fleet.service /etc/systemd/system/

# Активация и запуск службы
sudo systemctl daemon-reload
sudo systemctl enable jiv-fleet
sudo systemctl start jiv-fleet

# Проверка статуса
sudo systemctl status jiv-fleet
```

---

## 💾 Резервное копирование (Backups)

Скрипт `deploy/scripts/backup.sh` выполняет автоматический дамп базы данных PostgreSQL, сохраняет `.env` конфигурацию и выгружает состояние платформы в единый сжатый архив:

```bash
# Сделать скрипт исполняемым
chmod +x deploy/scripts/backup.sh

# Запуск ручного бэкапа
./deploy/scripts/backup.sh /var/backups/jiv-fleet

# Добавление в CRON (запуск каждую ночь в 03:00)
crontab -e
# Добавить строку:
# 0 3 * * * /opt/jiv-vladivostok-fleet/deploy/scripts/backup.sh /var/backups/jiv-fleet > /dev/null 2>&1
```

---

## ☁️ Бесшовная миграция в облака (Яндекс Облако / Сбер Cloud.ru)

Когда трафик платформы вырастет и потребуется масштабирование, миграция выполняется в 1 клик без изменения кода:

### Вариант А: Миграция в Yandex.Cloud (Яндекс Облако)
1. Создайте реестр в **Yandex Container Registry (YCR)** и базу в **Managed Service for PostgreSQL**.
2. Укажите `YANDEX_REGISTRY_ID` в вашем файле `.env`.
3. Запустите скрипт миграции:
```bash
chmod +x deploy/scripts/migrate-to-yandex-cloud.sh
./deploy/scripts/migrate-to-yandex-cloud.sh
```

### Вариант Б: Миграция в Сбер Cloud.ru
1. Создайте реестр в **Sber Software Repository (SWR)**.
2. Запустите скрипт миграции:
```bash
chmod +x deploy/scripts/migrate-to-sbercloud.sh
./deploy/scripts/migrate-to-sbercloud.sh
```

---

## 🔍 Мониторинг и проверка здоровья (Health Checks)

Платформа предоставляет готовые REST API эндпоинты для мониторинга (Prometheus / Zabbix / Grafana):

- `GET /api/health` — Возвращает статус приложения, память, аптайм и версию.
- `GET /api/status` — Возвращает текущее окружение, состояние БД и готовность к миграции.
- `GET /api/v1/export-data` — Экспорт системных данных для миграции.
