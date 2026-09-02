# Minimal E-Commerce Monolith

This is a Django Modular Monolith implementing the E-Commerce minimal architecture.

## Requirements
- Python 3.10+
- PostgreSQL 16+ (or Docker to run it)

## Setup Instructions

1. **Start the database** (if using Docker):
   ```bash
   docker-compose up -d
   ```

2. **Set up Python virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   A `.env` file has been provided with default settings connecting to the Docker database. Modify it if your database credentials differ.

4. **Run Migrations**:
   ```bash
   python manage.py migrate
   ```

5. **Create Superuser** (for Admin panel):
   ```bash
   python manage.py createsuperuser
   ```

6. **Run Development Server**:
   ```bash
   python manage.py runserver
   ```
   
Access the site at `http://127.0.0.1:8000/` and the admin panel at `http://127.0.0.1:8000/admin/`.
