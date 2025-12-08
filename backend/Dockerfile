FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
# Use requirements-prod.txt for production (excludes test dependencies)
COPY requirements-prod.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code (excluding files in .dockerignore)
COPY . .

# Create instance directory for SQLite database
# Make it writable for SQLite database file
RUN mkdir -p instance && chmod 777 instance

# Expose port (Fly.io uses 8080 by default)
EXPOSE 8080

# Use gunicorn for production, fallback to Flask dev server
# Fly.io/Railway/Render will set PORT environment variable
CMD gunicorn --bind 0.0.0.0:${PORT:-8080} --workers 2 --threads 2 --timeout 60 app:app

