import os
from google.cloud import secretmanager

def access_secret_version(project_id, secret_id, version_id="latest"):
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode("UTF-8")

# Déterminer si nous sommes en environnement de développement ou production
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "mediassist-prod")

if ENVIRONMENT == "production":
    # Configuration pour la production (Cloud SQL)
    DB_USER = access_secret_version(PROJECT_ID, "DB_USER")
    DB_PASS = access_secret_version(PROJECT_ID, "DB_PASSWORD")
    DB_NAME = access_secret_version(PROJECT_ID, "DB_NAME")
    DB_HOST = access_secret_version(PROJECT_ID, "DB_HOST")
    
    # Format: postgresql+psycopg2://USER:PASSWORD@HOST/DATABASE
    SQLALCHEMY_DATABASE_URI = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"
    JWT_SECRET_KEY = access_secret_version(PROJECT_ID, "JWT_SECRET")
else:
    # Configuration pour le développement local (SQLite)
    SQLALCHEMY_DATABASE_URI = "sqlite:///data.db"
    JWT_SECRET_KEY = "dev-secret-key"

# Configuration commune
UPLOAD_FOLDER = "uploads"