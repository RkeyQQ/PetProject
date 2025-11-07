FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend ./backend
COPY data ./data
EXPOSE 8080
CMD ["uvicorn", "backend.api:app", "--host", "0.0.0.0", "--port", "8080"]