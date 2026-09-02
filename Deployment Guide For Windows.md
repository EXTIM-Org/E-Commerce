# 🚀 Docker‑Based Deployment Guide

This guide lives side‑by‑side with the project’s main `Dockerfile` and explains how to spin up the **E‑Commerce Minimal** application using Docker Compose.

---

## 1️⃣ Prerequisites

- **Docker Desktop** (Windows) – installed and running.
- **Git** (optional) – if you clone the repository.
- **PowerShell** (or any terminal) – for the commands below.

---

## 2️⃣ Create the environment file

```powershell
# From the project root
Copy-Item .env.example .env -Force
```

Edit the newly created `.env` and set the appropriate values. The default development values are already suitable:

```dotenv
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=postgres://postgres:yourpassword@db:5432/yourdbname
ALLOWED_HOSTS=localhost,127.0.0.1
REDIS_URL=redis://redis:6379/1
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

---

## 3️⃣ Build Docker images

```powershell
docker compose build
```

This compiles the image that will be used for both the **web** (Gunicorn) and **celery** services.

---

## 4️⃣ Start the stack

```powershell
docker compose up -d
```

The following containers will be launched:

- `db` – PostgreSQL
- `redis` – Redis
- `web` – Gunicorn serving the Django app
- `celery` – Celery worker

All containers are set with `restart: unless-stopped` so Docker will automatically revive them if they crash.

---

## 5️⃣ Run Django migrations & create a super‑user

```powershell
# Apply DB migrations
docker compose exec web python manage.py migrate

# Create an admin account (you’ll be prompted for username/email/password)
docker compose exec web python manage.py createsuperuser

# Collect static files (required for Whitenoise)
docker compose exec web python manage.py collectstatic --noinput
```

---

## 6️⃣ (Optional) Enable advanced Celery features

If you plan to use scheduled tasks or want to inspect task results, add the following apps to `INSTALLED_APPS` in `settings.py`:

```python
INSTALLED_APPS += [
    "django_celery_beat",    # periodic / cron‑style tasks
    "django_celery_results", # stores task results in the DB
]
```

After updating `settings.py`, run migrations again:

```powershell
docker compose exec web python manage.py migrate
```

---

## 7️⃣ Access the application

- **Web site**: <http://localhost:8000>
- **Django admin**: <http://localhost:8000/admin/> (login with the super‑user you created)

---

## 8️⃣ View logs (helpful for debugging)

```powershell
# Web server logs (Gunicorn)
docker compose logs -f web

# Celery worker logs
docker compose logs -f celery
```

Press `Ctrl+C` to stop tailing.

---

## 9️⃣ Stop the stack

```powershell
docker compose down
```

This shuts down and removes the containers (volumes persist, so your database data is retained).

---

## 📦 Quick one‑liner (for developers who love shortcuts)

```powershell
Copy-Item .env.example .env -Force; docker compose build; docker compose up -d; docker compose exec web python manage.py migrate; docker compose exec web python manage.py createsuperuser; docker compose exec web python manage.py collectstatic --noinput
```

---

*Happy coding! 🎉*
