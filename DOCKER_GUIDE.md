# راهنمای نصب و راه‌اندازی Docker

این راهنما برای راه‌اندازی Redis و PostgreSQL با استفاده از Docker است.

## ✅ پیش‌نیازها

### نصب Docker

#### روی سرور Linux:
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# نصب Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### روی Windows:
1. دانلود Docker Desktop از: https://docs.docker.com/desktop/install/windows-install/
2. نصب و راه‌اندازی Docker Desktop

## 🚀 راه‌اندازی سریع

### گزینه 1: استفاده از اسکریپت (توصیه می‌شود)

**روی Linux/Mac:**
```bash
chmod +x start-docker.sh
./start-docker.sh
```

**روی Windows:**
```cmd
start-docker.bat
```

### گزینه 2: دستورات دستی

#### راه‌اندازی فقط Redis و PostgreSQL:
```bash
docker-compose up -d postgres redis
```

#### راه‌اندازی کامل (شامل Bot):
```bash
docker-compose up -d
```

## 📊 دستورات مفید Docker

### مشاهده وضعیت کانتینرها:
```bash
docker ps
# یا برای مشاهده همه (حتی متوقف‌شده‌ها):
docker ps -a
```

### مشاهده لاگ‌ها:
```bash
# همه سرویس‌ها:
docker-compose logs -f

# فقط Redis:
docker-compose logs -f redis

# فقط PostgreSQL:
docker-compose logs -f postgres

# فقط Bot:
docker-compose logs -f bot
```

### توقف کانتینرها:
```bash
# توقف همه:
docker-compose down

# توقف و حذف volumes (دیتا پاک می‌شود!):
docker-compose down -v
```

### ریستارت کانتینرها:
```bash
docker-compose restart
```

### مشاهده استفاده منابع:
```bash
docker stats
```

## 🔧 استفاده در محیط Development

برای محیط توسعه با پورت‌های expose شده:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

این فایل شامل:
- PostgreSQL روی پورت `5433`
- Redis روی پورت `6379`
- Healthcheck برای هر دو سرویس
- شبکه جداگانه `botnet`

## 🗄️ دسترسی به دیتابیس

### PostgreSQL:
```bash
# اتصال به PostgreSQL از درون کانتینر:
docker exec -it bot-postgres psql -U bot -d bot

# یا از خارج (اگر پورت expose شده باشد):
psql -h localhost -p 5433 -U bot -d bot
# پسورد: 991fa522db6ddb9935c7d9b1
```

### Redis:
```bash
# اتصال به Redis CLI:
docker exec -it bot-redis redis-cli

# تست اتصال:
docker exec -it bot-redis redis-cli ping
# باید PONG برگرداند
```

## 🔐 تنظیمات Environment Variables

### برای محیط Production (داخل Docker):
فایل `.env.production` باید حاوی:
```env
BOT_TOKEN=your_bot_token
DATABASE_URL="postgresql://bot:991fa522db6ddb9935c7d9b1@bot-postgres:5432/bot"
REDIS_HOST=bot-redis
REDIS_PORT=6379
LOCK_STORE=redis
```

### برای محیط Development (خارج از Docker):
فایل `.env` باید حاوی:
```env
BOT_TOKEN=your_bot_token
DATABASE_URL="postgresql://bot:991fa522db6ddb9935c7d9b1@localhost:5433/bot"
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🐛 عیب‌یابی

### کانتینر شروع نمی‌شود:
```bash
# بررسی لاگ‌ها:
docker-compose logs

# بررسی وضعیت:
docker ps -a

# حذف و شروع دوباره:
docker-compose down -v
docker-compose up -d
```

### پورت قبلاً استفاده می‌شود:
```bash
# پیدا کردن پروسس روی پورت (Linux/Mac):
sudo lsof -i :5432
sudo lsof -i :6379

# پیدا کردن پروسس روی پورت (Windows):
netstat -ano | findstr :5432
netstat -ano | findstr :6379
```

### مشکل اتصال به دیتابیس:
1. بررسی کنید که کانتینر در حال اجرا است: `docker ps`
2. بررسی healthcheck: `docker inspect bot-postgres`
3. بررسی لاگ‌ها: `docker-compose logs postgres`
4. اطمینان از درست بودن CONNECTION_STRING

## 🔄 بروزرسانی و Rebuild

```bash
# بروزرسانی ایمیج‌ها:
docker-compose pull

# Rebuild کانتینر bot:
docker-compose build bot

# Restart با ایمیج جدید:
docker-compose up -d --build
```

## 📦 نگهداری Volume‌ها

### Backup دیتابیس:
```bash
# Backup PostgreSQL:
docker exec bot-postgres pg_dump -U bot bot > backup.sql

# Restore:
docker exec -i bot-postgres psql -U bot bot < backup.sql
```

### Backup Redis:
```bash
docker exec bot-redis redis-cli SAVE
docker cp bot-redis:/data/dump.rdb ./redis-backup.rdb
```

## ⚙️ تنظیمات پیشرفته

### محدود کردن منابع Redis:
در `docker-compose.yml`:
```yaml
redis:
  command: ["redis-server", "--maxmemory", "256mb", "--maxmemory-policy", "allkeys-lru"]
```

### محدود کردن CPU و Memory:
```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
```

## 📚 منابع بیشتر

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Redis Docker Image](https://hub.docker.com/_/redis)

---

✨ **نکته:** برای production، حتماً پسورد دیتابیس را تغییر دهید و از متغیرهای محیطی امن استفاده کنید.
