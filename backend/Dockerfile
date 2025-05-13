FROM python:3.10-slim

WORKDIR /app

# Installer les dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install gunicorn

# Copier le code source
COPY . .

# Créer un répertoire pour les uploads
RUN mkdir -p uploads

# Variable d'environnement pour WSGI
ENV GUNICORN_CMD_ARGS="--bind=0.0.0.0:8080 --workers=3 --threads=3 --timeout=0"

# Exposer le port
EXPOSE 8080

# Lancer l'application
CMD ["gunicorn", "app:app"]