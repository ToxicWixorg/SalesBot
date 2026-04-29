# 🚀 راه‌اندازی سریع Docker روی سرور

## نصب Docker (اگر نصب نیست)

### Ubuntu/Debian:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker  # یا logout/login کنید
```

### نصب Docker Compose:
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## راه‌اندازی سریع

### روش 1: استفاده از اسکریپت خودکار
```bash
chmod +x deploy-server.sh
./deploy-server.sh
```

### روش 2: دستورات دستی

```bash
# 1. راه‌اندازی Redis و PostgreSQL
docker-compose up -d postgres redis

# 2. راه‌اندازی Bot
docker-compose up -d bot

# 3. مشاهده لاگ‌ها
docker-compose logs -f
```

## دستورات مهم

```bash
# مشاهده وضعیت کانتینرها
docker ps

# مشاهده لاگ‌های زنده
docker-compose logs -f

# توقف همه
docker-compose down

# ریستارت
docker-compose restart

# بروزرسانی و rebuild
docker-compose up -d --build
```

## اتصال به دیتابیس

### PostgreSQL:
```bash
docker exec -it bot-postgres psql -U bot -d bot
```

### Redis:
```bash
docker exec -it bot-redis redis-cli
```

## عیب‌یابی

```bash
# بررسی لاگ‌ها
docker-compose logs postgres
docker-compose logs redis
docker-compose logs bot

# بررسی وضعیت
docker ps -a

# حذف کامل و شروع دوباره
docker-compose down -v
docker-compose up -d
```

## ⚠️ نکات مهم

1. **قبل از اجرا:** اطمینان حاصل کنید که فایل `.env.production` وجود دارد
2. **امنیت:** پسورد PostgreSQL را در production تغییر دهید
3. **فایروال:** اگر نیاز به دسترسی خارجی دارید، پورت‌ها را باز کنید
4. **Backup:** منظماً از دیتابیس backup بگیرید

---

📖 برای راهنمای کامل: [DOCKER_GUIDE.md](DOCKER_GUIDE.md)
