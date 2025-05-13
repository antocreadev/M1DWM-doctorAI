import os
from google.cloud import secretmanager

def access_secret_version(project_id, secret_id, version_id="latest"):
    """Accès aux secrets avec gestion d'erreur."""
    try:
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8")
    except Exception as e:
        print(f"⚠️ Impossible d'accéder au secret {secret_id}: {e}")
        return None

# Configuration de l'environnement
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "mediassist-prod")

# Configuration d'Ollama
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")

if ENVIRONMENT == "production":
    # Récupération des variables - priorité aux variables d'environnement
    DB_USER = os.environ.get("DB_USER") or access_secret_version(PROJECT_ID, "DB_USER") or "postgres"
    DB_PASS = os.environ.get("DB_PASS") or access_secret_version(PROJECT_ID, "DB_PASSWORD") or "mediassist123"
    DB_NAME = os.environ.get("DB_NAME") or access_secret_version(PROJECT_ID, "DB_NAME") or "mediassist"
    
    # Format spécifique pour Cloud SQL avec socket Unix
    INSTANCE_CONNECTION_NAME = os.environ.get("INSTANCE_CONNECTION_NAME", f"{PROJECT_ID}:europe-west1:mediassist-db")
    
    # Configuration pour Cloud SQL via socket Unix (méthode recommandée pour Cloud Run)
    SQLALCHEMY_DATABASE_URI = f"postgresql+pg8000://{DB_USER}:{DB_PASS}@/{DB_NAME}?unix_sock=/cloudsql/{INSTANCE_CONNECTION_NAME}/.s.PGSQL.5432"
    
    # Clé JWT
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or access_secret_version(PROJECT_ID, "JWT_SECRET") or "ydEyUGomyWUgtelwRYPFOxQfLCN4EBgQGAepKMzRBXg="
else:
    # Configuration pour le développement local (SQLite)
    SQLALCHEMY_DATABASE_URI = "sqlite:///data.db"
    JWT_SECRET_KEY = "dev-secret-key"

# Configuration commune
UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", "uploads")

# Configuration supplémentaire
SQLALCHEMY_TRACK_MODIFICATIONS = False