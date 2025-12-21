FROM python:3.13-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend ./backend
COPY data ./data

# ========== GCP CONFIGURATION ==========
# For local development:
#   - Docker reads OPENAI_API_KEY from .env.local
#
# For GCP Cloud Run (production):
#   - Set environment variable: GOOGLE_CLOUD_PROJECT
#   - Example: gcloud run deploy --set-env-vars GOOGLE_CLOUD_PROJECT=your-project-id
#   - Service account must have secret viewer permission

EXPOSE 8080

CMD ["uvicorn", "backend.api:app", "--host", "0.0.0.0", "--port", "8080"]