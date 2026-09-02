# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project
COPY . /app/

# Collect static files
# We run this during the build process so they are ready for WhiteNoise
RUN python manage.py collectstatic --noinput

# Create a non-root user for security
RUN useradd -m myuser
RUN chown -R myuser:myuser /app
USER myuser

# Expose port
EXPOSE 8000

# The command will be overridden by docker-compose for celery, but defaults to gunicorn for web
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]
