# 🚀 Ubuntu‑Based Deployment Guide

This document explains how to run the **E‑Commerce Minimal** project on an Ubuntu system using Docker Compose.

---

## 📦 Prerequisites on Ubuntu

```bash
# 1️⃣ Update package index
sudo apt update

# 2️⃣ Install required packages
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

### Install Docker Engine (official Docker packages)

```bash
# Add Docker’s official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up the stable repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine and the Compose plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### Enable Docker for your user (no `sudo` needed later)

```bash
sudo usermod -aG docker $USER
newgrp docker   # refresh group membership without logout
```

Verify the installation:

```bash
docker version
docker compose version
```

---

## 📁 Prepare the project

1. **Clone or copy the repository** to a directory, e.g. `~/e-commerce-minimal`.
2. **Create the environment file** from the example:

```bash
cd ~/e-commerce-minimal
cp .env.example .env
```

Edit `.env` if you need custom values (the defaults work for local development).

---

## 🛠️ Build the Docker images

```bash
docker compose build
```

This uses the same `Dockerfile` for both the `web` (Gunicorn) and `celery` services.

---

## ▶️ Start the stack

```bash
docker compose up -d
```

You will see four containers running:
- `db` (PostgreSQL)
- `redis`
- `web` (Gunicorn)
- `celery` (Celery worker)

All containers have `restart: unless-stopped` so they survive crashes.

---

## 🗄️ Database migration & admin user

```bash
# Apply Django migrations
docker compose exec web python manage.py migrate

# Create an admin user (you’ll be prompted for credentials)
docker compose exec web python manage.py createsuperuser

# Collect static files for Whitenoise
docker compose exec web python manage.py collectstatic --noinput
```

---

## 🎯 Optional: Celery Beat & Results

If you want scheduled tasks or to store task results, add the following to `settings.py`:

```python
INSTALLED_APPS += [
    "django_celery_beat",
    "django_celery_results",
]
```

Then run migrations again:

```bash
docker compose exec web python manage.py migrate
```

---

## 🌐 Access the application

- **Web UI**: <http://localhost:8000>
- **Django admin**: <http://localhost:8000/admin/> (login with the super‑user you created)

---

## 📜 View logs (debugging)

```bash
# Follow web container logs
docker compose logs -f web

# Follow Celery worker logs
docker compose logs -f celery
```

Press `Ctrl+C` to stop tailing.

---

## 🛑 Stop & clean up

```bash
docker compose down
```

The PostgreSQL volume (`postgres_data`) persists, so your data remains across restarts.

---

## 📦 One‑liner shortcut (for quick test)

```bash
cp .env.example .env && docker compose build && docker compose up -d && \
 docker compose exec web python manage.py migrate && \
 docker compose exec web python manage.py createsuperuser && \
 docker compose exec web python manage.py collectstatic --noinput
```

---

*Enjoy building your E‑Commerce app on Ubuntu! 🎉*
