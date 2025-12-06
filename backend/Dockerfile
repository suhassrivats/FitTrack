FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install gunicorn for production (if not in requirements.txt)
RUN pip install --no-cache-dir gunicorn || true

# Copy application code
COPY . .

# Create instance directory for SQLite database (for local dev)
RUN mkdir -p instance

# Expose port (Fly.io uses 8080 by default)
EXPOSE 8080

# Use gunicorn for production, fallback to Flask dev server
# Fly.io/Railway/Render will set PORT environment variable
CMD gunicorn --bind 0.0.0.0:${PORT:-8080} --workers 2 --threads 2 --timeout 60 app:app

