@echo off
set DATABASE_URL=postgres://postgres:postgrespassword@127.0.0.1:5432/shop
set REDIS_URL=redis://127.0.0.1:6379/1
set CELERY_BROKER_URL=redis://127.0.0.1:6379/0
set CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/0

echo =========================================================
echo Starting Local Django Server (Connected to Docker DB/Redis)
echo =========================================================
python manage.py runserver
