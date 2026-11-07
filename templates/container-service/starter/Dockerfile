# Example image: replace the base, build steps and command with your own.
# Keep: listen on 8080, run as a non-root user, write only to /tmp.
FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=8080
WORKDIR /app
COPY app/ .
USER 10001:10001
EXPOSE 8080
CMD ["python", "server.py"]
