import traceback
from flask import (
    Flask,
    request,
    jsonify,
    send_from_directory,
    json,
    send_file,
    after_this_request,
)
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
import os
from flasgger import Swagger
from datetime import datetime, timedelta
import random
import string
import uuid
from werkzeug.utils import secure_filename
from flask_cors import CORS
from PyPDF2 import PdfReader
import requests
import logging
import tempfile
from google.cloud import storage


# Configuration de base
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*", "headers": ["Authorization"]}})

# Configuration de la base de données PostgreSQL avec Render.com
DB_USER = "doctorai_a7k3_user"
DB_PASS = "1aMtKSIUISaEIhutbx41MXohsXglXXyF"
DB_NAME = "doctorai_a7k3"
DB_HOST = "dpg-d0hpkk15pdvs739c3640-a.oregon-postgres.render.com"
DB_PORT = "5432"

# Configuration JWT et dossier d'upload
app.config["JWT_SECRET_KEY"] = os.environ.get(
    "JWT_SECRET_KEY", "ydEyUGomyWUgtelwRYPFOxQfLCN4EBgQGAepKMzRBXg="
)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=365 * 10)

app.config["UPLOAD_FOLDER"] = os.environ.get("UPLOAD_FOLDER", "uploads")
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# Configuration de la connexion à la base de données
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Configuration du logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration de Cloud Storage
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "mediassist-prod")
BUCKET_NAME = os.environ.get("STORAGE_BUCKET", "mediassist-prod-files")
storage_client = storage.Client(project=PROJECT_ID)
bucket = storage_client.bucket(BUCKET_NAME)

LOGGING_URL = "https://script.google.com/macros/s/AKfycbwWRptq7mZQ2yXqg0PBr-FNpCdVCU8NYIQZhzCtc92VDM4xzjI7vLtpquIkF8cmK1zP/exec"


def log_to_google_sheets(
    endpoint,
    method,
    status_code,
    user_id=None,
    request_data=None,
    response_data=None,
    ip_address=None,
):
    log_data = {
        "endpoint": endpoint,
        "method": method,
        "status_code": status_code,
        "user_id": user_id,
        "request_data": request_data,
        "response_data": response_data,
        "ip_address": ip_address or request.remote_addr if request else None,
    }

    logger.info(f"[LOG] {method} {endpoint} - Status {status_code} - User: {user_id}")
    logger.debug(f"Requête: {request_data} | Réponse: {response_data}")

    try:
        response = requests.post(LOGGING_URL, json=log_data)
        return response.status_code == 200
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi du log à Google Sheets: {e}")
        return False


# Rendre l'hôte Ollama configurable via variable d'environnement
ollama_host = os.environ.get(
    "OLLAMA_HOST", "https://ollama-gemma-bv5bumqn3a-ew.a.run.app"
)
OLLAMA_API_URL = ollama_host + "/api/chat"
model_name = os.environ.get("MODEL_NAME", "tinyllama")

# Variables pour indiquer si Ollama est disponible
ollama_available = False

# Essayons de connecter Ollama
try:
    print(f"Tentative de connexion à Ollama sur {ollama_host}...")

    # Utiliser requests pour envoyer une requête POST
    pull_url = f"{ollama_host}/api/pull"
    pull_data = {"name": model_name}

    print(f"Téléchargement du modèle '{model_name}'...")

    response = requests.post(pull_url, json=pull_data)
    response.raise_for_status()  # Lever une exception si la réponse n'est pas 2xx
    print(response)
    print(response.raise_for_status())
    print("✅ Modèle téléchargé :", response.json())
    ollama_available = True

except Exception as e:
    print(f"⚠️ Impossible d'initialiser Ollama: {e}")
    print("L'application continuera sans les fonctionnalités d'IA...")


import os
import sys
import requests
import json
import time
import logging

# Configuration du logging pour plus de détails
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# Rendre l'hôte Ollama configurable via variable d'environnement
ollama_host = os.environ.get(
    "OLLAMA_HOST", "https://ollama-gemma-bv5bumqn3a-ew.a.run.app"
)

# Définition des URL correctes pour l'API
# Si nous avons une réponse à la racine, mais 404 sur /api/status,
# c'est que l'API est probablement exposée directement
OLLAMA_API_URL = ollama_host + "/api/chat"
OLLAMA_STATUS_URL = ollama_host + "/api/status"
OLLAMA_PULL_URL = ollama_host + "/api/pull"

# URL alternatives à essayer si les URL standards échouent
OLLAMA_API_URLS_ALTERNATIVES = [
    ollama_host + "/chat",  # Sans préfixe /api
    ollama_host + "/v1/chat/completions",  # Format OpenAI compatible
]

OLLAMA_STATUS_URLS_ALTERNATIVES = [
    ollama_host + "/health",
    ollama_host + "/status",
    ollama_host,  # Simplement la racine, elle peut retourner un statut
]


# Variable pour indiquer si Ollama est disponible
ollama_available = False

# Nombre maximum de tentatives de connexion
MAX_RETRIES = 3
RETRY_DELAY = 2  # secondes


def find_working_api_endpoint():
    """Essaie de découvrir l'URL d'API qui fonctionne"""
    global OLLAMA_API_URL, OLLAMA_STATUS_URL

    print(f"Test de l'URL de base: {ollama_host}")
    try:
        response = requests.get(ollama_host, timeout=5)
        print(
            f"Réponse de l'URL de base: Code {response.status_code}, Contenu: '{response.text[:100]}'"
        )
    except Exception as e:
        print(f"Erreur lors du test de l'URL de base: {e}")

    # Essai des URL de statut alternatives
    for url in [OLLAMA_STATUS_URL] + OLLAMA_STATUS_URLS_ALTERNATIVES:
        try:
            print(f"Test de l'URL de statut: {url}")
            response = requests.get(url, timeout=5)
            print(
                f"Réponse de {url}: Code {response.status_code}, Contenu: '{response.text[:100]}'"
            )

            if response.status_code == 200:
                OLLAMA_STATUS_URL = url
                print(f"URL de statut trouvée: {OLLAMA_STATUS_URL}")
                break
        except Exception as e:
            print(f"Erreur lors du test de {url}: {e}")

    # Test simple d'une requête pour identifier une API fonctionnelle
    test_message = {"role": "user", "content": "Hello"}

    for url in [OLLAMA_API_URL] + OLLAMA_API_URLS_ALTERNATIVES:
        try:
            print(f"Test de l'URL API: {url}")

            # On essaie différentes structures de payload
            payloads = [
                {
                    "model": model_name,
                    "messages": [test_message],
                },  # Format standard Ollama
                {"model": model_name, "prompt": "Hello"},  # Format simplifié
                {
                    "model": model_name,
                    "messages": [test_message],
                    "stream": False,
                },  # Avec stream=False
                {"messages": [test_message]},  # Sans spécifier le modèle
            ]

            for payload in payloads:
                try:
                    print(f"Test de l'URL {url} avec payload: {payload}")
                    response = requests.post(url, json=payload, timeout=10)
                    print(
                        f"Réponse de {url}: Code {response.status_code}, Début contenu: '{response.text[:100]}'"
                    )

                    if response.status_code == 200:
                        OLLAMA_API_URL = url
                        print(
                            f"✅ URL API fonctionnelle trouvée: {OLLAMA_API_URL} avec payload: {payload}"
                        )
                        return True

                    # Si 400 ou autre erreur similaire, l'endpoint existe mais le format est incorrect
                    elif 400 <= response.status_code < 500:
                        print(
                            f"⚠️ L'endpoint existe mais a retourné une erreur {response.status_code}"
                        )
                except Exception as e:
                    print(f"Erreur spécifique au payload pour {url}: {e}")

        except Exception as e:
            print(f"Erreur lors du test de {url}: {e}")

    return False


def check_ollama_status():
    """Vérifier si le serveur Ollama est en ligne"""
    try:
        print(f"Vérification du statut d'Ollama sur {OLLAMA_STATUS_URL}...")
        response = requests.get(OLLAMA_STATUS_URL, timeout=5)
        if response.status_code == 200:
            print(f"✅ Le serveur Ollama est en ligne: {response.text}")
            return True
        else:
            print(
                f"❌ Le serveur Ollama a répondu avec le code {response.status_code}: {response.text}"
            )

            # Si on a un 404 sur l'URL de statut standard, essayons de trouver la bonne URL
            if response.status_code == 404:
                print("Tentative de détection automatique des endpoints...")
                if find_working_api_endpoint():
                    return True
            return False
    except requests.exceptions.ConnectionError:
        print(
            f"❌ Erreur de connexion: impossible de se connecter à {OLLAMA_STATUS_URL}"
        )
        return False
    except requests.exceptions.Timeout:
        print(f"❌ Délai d'attente dépassé lors de la connexion à {OLLAMA_STATUS_URL}")
        return False
    except Exception as e:
        print(f"❌ Erreur lors de la vérification du statut d'Ollama: {e}")
        return False


def pull_model(model_name):
    """Télécharger le modèle depuis Ollama avec gestion des erreurs"""
    print(f"Téléchargement du modèle '{model_name}'...")
    pull_url = OLLAMA_PULL_URL
    pull_data = {"name": model_name}

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"Tentative #{attempt} de téléchargement du modèle via {pull_url}...")
            response = requests.post(pull_url, json=pull_data, timeout=30)

            print(f"Réponse brute: {response}")
            print(f"Contenu: {response.text[:200]}...")  # Afficher le début du contenu

            if response.status_code == 200:
                try:
                    result = response.json()
                    print(
                        f"✅ Modèle téléchargé avec succès: {json.dumps(result, indent=2)}"
                    )
                    return True
                except json.JSONDecodeError as jde:
                    print(f"⚠️ Réponse reçue mais format JSON invalide: {jde}")
                    print(f"Contenu brut: {response.text[:500]}")

                    # Si la réponse est en streaming, elle peut contenir plusieurs lignes JSON
                    # Essayons de traiter chaque ligne séparément
                    success = False
                    try:
                        for line in response.text.strip().split("\n"):
                            if line.strip():
                                line_data = json.loads(line)
                                print(
                                    f"Ligne traitée: {json.dumps(line_data, indent=2)}"
                                )
                                success = True
                    except Exception as line_error:
                        print(
                            f"Erreur lors du traitement ligne par ligne: {line_error}"
                        )

                    return success
            else:
                print(
                    f"⚠️ Échec du téléchargement (code {response.status_code}): {response.text}"
                )

                # Si l'endpoint pull n'existe pas, on considère que le modèle est déjà disponible
                # (certaines implémentations d'Ollama n'ont pas l'endpoint pull)
                if response.status_code == 404:
                    print(
                        "L'endpoint /api/pull n'existe pas. On suppose que le modèle est déjà disponible."
                    )
                    return True

            if attempt < MAX_RETRIES:
                print(f"Nouvelle tentative dans {RETRY_DELAY} secondes...")
                time.sleep(RETRY_DELAY)

        except requests.exceptions.ConnectionError:
            print(f"❌ Erreur de connexion lors de la tentative #{attempt}")
        except requests.exceptions.Timeout:
            print(f"❌ Délai d'attente dépassé lors de la tentative #{attempt}")
        except Exception as e:
            print(f"❌ Erreur inattendue lors de la tentative #{attempt}: {str(e)}")
            print(f"Type d'erreur: {type(e).__name__}")

    print("❌ Échec du téléchargement du modèle après plusieurs tentatives")
    return False


# Programme principal - Initialisation d'Ollama
try:
    print("=" * 50)
    print(f"INITIALISATION D'OLLAMA")
    print(f"Hôte: {ollama_host}")
    print(f"URL API (initiale): {OLLAMA_API_URL}")
    print(f"URL Statut (initiale): {OLLAMA_STATUS_URL}")
    print(f"Modèle: {model_name}")
    print("=" * 50)

    # Vérifier si Ollama est accessible (cela peut aussi détecter les bonnes URL)
    if not check_ollama_status():
        # Si l'API n'est pas accessible via les URL standard, essayer la détection automatique
        print("Tentative de détection automatique des URL d'API...")
        if not find_working_api_endpoint():
            print(
                "⚠️ Le serveur Ollama n'est pas accessible, même après détection automatique"
            )
            raise ConnectionError("Impossible de se connecter au serveur Ollama")

    # Si on arrive ici, on a au moins établi une connexion
    print(f"URL API (finale): {OLLAMA_API_URL}")
    print(f"URL Statut (finale): {OLLAMA_STATUS_URL}")

    # On peut considérer qu'Ollama est disponible même sans modèle téléchargé
    ollama_available = True

    # Télécharger le modèle (optionnel selon l'implémentation)
    try:
        if pull_model(model_name):
            print(f"✅ Téléchargement du modèle '{model_name}' réussi")
        else:
            print(
                f"⚠️ Échec du téléchargement du modèle '{model_name}', mais l'API est accessible"
            )
    except Exception as model_error:
        print(f"⚠️ Erreur lors du téléchargement du modèle: {model_error}")
        print("L'API reste accessible malgré l'échec du téléchargement")

    print(f"✅ Initialisation d'Ollama réussie")

except Exception as e:
    print(f"⚠️ Erreur lors de l'initialisation d'Ollama: {e}")
    print(f"Détails de l'erreur: {type(e).__name__}")
    print(f"L'application continuera sans les fonctionnalités d'IA...")

    # Afficher la trace complète pour le débogage
    import traceback

    print("Trace d'erreur complète:")
    traceback.print_exc()

finally:
    print(
        f"État final d'Ollama: {'DISPONIBLE' if ollama_available else 'INDISPONIBLE'}"
    )
    print("=" * 50)


# Fonction pour essayer une requête de chat
def test_chat_query():
    if not ollama_available:
        print("❌ Ollama n'est pas disponible, impossible de tester le chat")
        return

    try:
        print("\nTest d'une requête de chat simple...")

        # Trois formats courants pour les requêtes chat
        formats = [
            # Format standard Ollama
            {
                "model": model_name,
                "messages": [{"role": "user", "content": "Bonjour, comment ça va?"}],
                "stream": False,
            },
            # Format OpenAI compatible
            {
                "model": model_name,
                "messages": [{"role": "user", "content": "Bonjour, comment ça va?"}],
            },
            # Format simplifié
            {"model": model_name, "prompt": "Bonjour, comment ça va?"},
        ]

        success = False
        for idx, chat_data in enumerate(formats):
            try:
                print(f"\nEssai du format #{idx+1}: {json.dumps(chat_data, indent=2)}")
                response = requests.post(OLLAMA_API_URL, json=chat_data, timeout=30)

                print(f"Statut de réponse: {response.status_code}")
                if response.status_code == 200:
                    try:
                        # Essayer de traiter comme un JSON unique
                        result = response.json()
                        print(
                            f"✅ Réponse du modèle reçue: {json.dumps(result, indent=2)[:500]}"
                        )
                        success = True
                        break
                    except json.JSONDecodeError:
                        # La réponse pourrait être un flux de JSONs ligne par ligne
                        print("Tentative de traitement ligne par ligne...")
                        lines = response.text.strip().split("\n")
                        if lines:
                            for i, line in enumerate(
                                lines[:5]
                            ):  # Afficher les 5 premières lignes
                                try:
                                    if line.strip():
                                        line_data = json.loads(line)
                                        print(
                                            f"Ligne {i+1}: {json.dumps(line_data, indent=2)}"
                                        )
                                        success = True
                                except json.JSONDecodeError:
                                    print(
                                        f"Ligne {i+1} n'est pas un JSON valide: {line[:100]}"
                                    )
                            if success:
                                break
                        else:
                            print(f"Réponse brute: {response.text[:500]}")
                else:
                    print(
                        f"❌ Erreur lors de la requête de chat (code {response.status_code}): {response.text[:500]}"
                    )
            except Exception as format_error:
                print(f"❌ Erreur avec le format #{idx+1}: {format_error}")

        if success:
            print("\n✅ Test de chat réussi avec au moins un format!")
        else:
            print("\n❌ Tous les formats de requête ont échoué")

    except Exception as e:
        print(f"❌ Erreur lors du test de chat: {e}")


# Exécuter le test de chat si Ollama est disponible
if ollama_available:
    test_chat_query()

import chromadb

chroma_client = chromadb.Client()
collection = chroma_client.create_collection(name="my_collection")

# Swagger
swagger = Swagger(
    app,
    template={
        "swagger": "2.0",
        "info": {
            "title": "API Utilisateurs & Conversations",
            "description": "API Flask avec authentification, gestion de fichiers et conversations.",
            "version": "1.0.0",
        },
        "basePath": "/",
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "JWT Authorization header using the Bearer scheme. Exemple : 'Authorization: Bearer {token}'",
            }
        },
    },
)

# Extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


### MODELES ###


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    prenom = db.Column(db.String(50))
    nom = db.Column(db.String(50))
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(128))
    date_naissance = db.Column(db.Date)
    genre = db.Column(db.String(10))
    adresse = db.Column(db.String(200))
    ville = db.Column(db.String(100))
    code_postal = db.Column(db.String(10))
    telephone = db.Column(db.String(20))
    profession = db.Column(db.String(100))
    terms = db.Column(db.Boolean)
    data = db.Column(db.Boolean)
    antecedents = db.Column(db.String(500), nullable=True)
    medicaments = db.Column(db.String(500), nullable=True)
    allergies = db.Column(db.String(500), nullable=True)
    fichiers = db.relationship(
        "File", backref="user", lazy=True, cascade="all, delete-orphan"
    )
    conversations = db.relationship(
        "Conversation", backref="user", lazy=True, cascade="all, delete-orphan"
    )


class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100))
    chemin = db.Column(db.String(200))
    user_id = db.Column(
        db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False
    )


class Conversation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titre = db.Column(db.String(100))
    user_id = db.Column(
        db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False
    )
    messages = db.relationship(
        "Message", backref="conversation", lazy=True, cascade="all, delete-orphan"
    )


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    contenu = db.Column(db.Text)
    role = db.Column(db.String(10))  # 'user' ou 'ai'
    conversation_id = db.Column(
        db.Integer, db.ForeignKey("conversation.id", ondelete="CASCADE"), nullable=False
    )


### ROUTES AUTH ###


@app.route("/register", methods=["POST"])
def register():
    data = request.json
    logger.info("Tentative d'enregistrement utilisateur")
    logger.debug(f"Données reçues: {data}")

    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        logger.warning(f"Échec inscription: Email {data['email']} déjà utilisé.")
        log_to_google_sheets(
            "/register",
            "POST",
            400,
            request_data=data,
            response_data={"error": "Email déjà utilisé"},
        )
        return jsonify(error="Cet email est déjà utilisé."), 400

    try:
        hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
        terms = data["terms"] == "on" or data["terms"] is True
        data_processing = data.get("data") == "on" or data.get("data") is True

        user = User(
            prenom=data["prenom"],
            nom=data["nom"],
            email=data["email"],
            password=hashed_pw,
            date_naissance=datetime.fromisoformat(
                data["date_naissance"].replace("Z", "+00:00")
            ),
            genre=data["genre"],
            adresse=data["adresse"],
            ville=data["ville"],
            code_postal=data["code_postal"],
            telephone=data["telephone"],
            profession=data["profession"],
            terms=terms,
            data=data_processing,
            antecedents=data.get("antecedents"),
            medicaments=data.get("medicaments"),
            allergies=data.get("allergies"),
        )

        db.session.add(user)
        db.session.commit()

        logger.info(f"Utilisateur {user.email} enregistré avec succès")
        log_to_google_sheets(
            "/register",
            "POST",
            201,
            user_id=user.id,
            request_data=data,
            response_data={"message": "Utilisateur enregistré"},
        )
        return jsonify(message="Utilisateur enregistré"), 201

    except Exception as e:
        db.session.rollback()
        logger.exception("Erreur serveur pendant l'inscription")
        log_to_google_sheets(
            "/register", "POST", 500, request_data=data, response_data={"error": str(e)}
        )
        return jsonify(error=f"Erreur interne : {str(e)}"), 500


@app.route("/login", methods=["POST"])
def login():
    """
    Connexion utilisateur
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: credentials
        schema:
          type: object
          required: [email, password]
          properties:
            email: {type: string}
            password: {type: string}
    responses:
      200:
        description: Connexion réussie
        schema:
          type: object
          properties:
            token: {type: string}
      401:
        description: Identifiants invalides
    """
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()
    if user and bcrypt.check_password_hash(user.password, data["password"]):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(token=access_token)
    return jsonify(message="Identifiants invalides"), 401


### ROUTES UTILISATEUR ###


@app.route("/me", methods=["GET"])
@jwt_required()
def me():
    """
    Récupérer les informations du profil utilisateur connecté
    ---
    tags:
      - Utilisateur
    security:
      - Bearer: []
    responses:
      200:
        description: Infos utilisateur
        schema:
          type: object
          properties:
            email: {type: string}
            nom: {type: string}
            prenom: {type: string}
    """
    user = User.query.get(get_jwt_identity())
    # renvoie toutes les informations
    if not user:
        print("Utilisateur non trouvé")
        return jsonify(message="Utilisateur non trouvé"), 404
    return jsonify(
        id=user.id,
        prenom=user.prenom,
        nom=user.nom,
        email=user.email,
        date_naissance=user.date_naissance.isoformat(),
        genre=user.genre,
        adresse=user.adresse,
        ville=user.ville,
        code_postal=user.code_postal,
        telephone=user.telephone,
        profession=user.profession,
        terms=user.terms,
        data=user.data,
        antecedents=user.antecedents,
        medicaments=user.medicaments,
        allergies=user.allergies,
        conversations=[{"id": c.id, "titre": c.titre} for c in user.conversations],
        fichiers=[
            {"id": f.id, "nom": f.nom, "chemin": f.chemin} for f in user.fichiers
        ],
    )


### UPLOAD FICHIERS ###


@app.route("/upload", methods=["POST"])
def upload_file():
    """
    Télécharger un fichier vers Cloud Storage
    ---
    tags:
      - Fichiers
    security:
      - Bearer: []
    parameters:
      - in: formData
        name: file
        type: file
        required: true
        description: Fichier à téléverser
    responses:
      201:
        description: Fichier téléversé
        schema:
          type: object
          properties:
            message: {type: string}
            nom: {type: string}
            chemin: {type: string}
      400:
        description: Erreur de validation
    """
    if "file" not in request.files:
        return jsonify(message="Aucun fichier envoyé"), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify(message="Nom de fichier vide"), 400

    # Générer un nom unique pour le fichier
    ext = os.path.splitext(file.filename)[1]
    filename_uuid = f"{uuid.uuid4()}{ext}"

    # Télécharger sur Cloud Storage
    try:
        # Créer un fichier temporaire
        with tempfile.NamedTemporaryFile() as temp:
            file.save(temp.name)
            temp.flush()

            # Télécharger vers Cloud Storage
            blob = bucket.blob(f"uploads/{filename_uuid}")
            blob.upload_from_filename(temp.name)

            # Générer l'URL publique ou signée
            gcs_url = f"gs://{BUCKET_NAME}/uploads/{filename_uuid}"

            # Enregistrer dans la base de données
            user_id = get_jwt_identity()
            fichier = File(nom=filename_uuid, chemin=gcs_url, user_id=user_id)
            db.session.add(fichier)
            db.session.commit()

            return (
                jsonify(message="Fichier téléversé", nom=filename_uuid, chemin=gcs_url),
                201,
            )
    except Exception as e:
        app.logger.error(f"Erreur lors du téléchargement sur GCS: {e}")
        return jsonify(message=f"Erreur: {str(e)}"), 500


@app.route("/fichiers/<filename>", methods=["GET"])
def telecharger_fichier(filename):
    """
    Télécharger un fichier depuis Cloud Storage
    ---
    tags:
      - Fichiers
    security:
      - Bearer: []
    parameters:
      - in: path
        name: filename
        type: string
        required: true
        description: Nom du fichier à télécharger
    responses:
      200:
        description: Fichier téléchargé
      404:
        description: Fichier non trouvé
    """
    # Trouver le fichier dans la base de données
    fichier = File.query.filter_by(nom=filename).first()
    if not fichier:
        return jsonify(message="Fichier non trouvé"), 404

    try:
        # Extraire le nom du blob depuis le chemin GCS (format: gs://bucket/path/to/file)
        gcs_path = fichier.chemin.replace(f"gs://{BUCKET_NAME}/", "")
        blob = bucket.blob(gcs_path)

        # Vérifier si le blob existe
        if not blob.exists():
            return jsonify(message="Fichier non trouvé sur le stockage"), 404

        # Créer un fichier temporaire pour stocker le contenu
        with tempfile.NamedTemporaryFile(delete=False) as temp:
            blob.download_to_filename(temp.name)
            temp_path = temp.name

        # Envoyer le fichier en réponse
        return send_file(
            temp_path,
            as_attachment=True,
            download_name=filename,
            mimetype=blob.content_type,
            # Nettoyer le fichier temporaire après l'envoi
            after_this_request=lambda _: os.remove(temp_path) or None,
        )
    except Exception as e:
        app.logger.error(f"Erreur lors du téléchargement depuis GCS: {e}")
        return jsonify(message=f"Erreur: {str(e)}"), 500


@app.route("/fichiers/<int:id>", methods=["DELETE"])
def supprimer_fichier(id):
    """
    Supprimer un fichier
    ---
    tags:
      - Fichiers
    security:
      - Bearer: []
    parameters:
      - in: path
        name: id
        type: integer
        required: true
        description: ID du fichier à supprimer
    responses:
      200:
        description: Fichier supprimé
      404:
        description: Fichier non trouvé
    """
    f = File.query.get_or_404(id)
    try:
        # Extraire le nom du blob depuis le chemin GCS
        gcs_path = f.chemin.replace(f"gs://{BUCKET_NAME}/", "")
        blob = bucket.blob(gcs_path)

        # Supprimer de Cloud Storage
        if blob.exists():
            blob.delete()

        # Supprimer de la base de données
        db.session.delete(f)
        db.session.commit()
        return jsonify(message="Fichier supprimé")
    except Exception as e:
        app.logger.error(f"Erreur lors de la suppression du fichier: {e}")
        return jsonify(message=f"Erreur: {str(e)}"), 500


@app.route("/fichiers", methods=["GET"])
def lister_fichiers():
    """
    Lister les fichiers de l'utilisateur
    ---
    tags:
      - Fichiers
    security:
      - Bearer: []
    responses:
      200:
        description: Liste des fichiers
        schema:
          type: array
          items:
            type: object
            properties:
              id: {type: integer}
              nom: {type: string}
              chemin: {type: string}
    """
    user_id = get_jwt_identity()
    fichiers = File.query.filter_by(user_id=user_id).all()
    return jsonify([{"id": f.id, "nom": f.nom, "chemin": f.chemin} for f in fichiers])


### CONVERSATIONS ###


@app.route("/conversations", methods=["POST"])
@jwt_required()
def creer_conversation():
    """
    Créer une nouvelle conversation
    ---
    tags:
      - Conversations
    security:
      - Bearer: []
    parameters:
      - in: body
        name: conversation
        schema:
          type: object
          properties:
            titre: {type: string}
    responses:
      201:
        description: Conversation créée
        schema:
          type: object
          properties:
            id: {type: integer}
            titre: {type: string}
    """
    user_id = get_jwt_identity()
    data = request.json
    c = Conversation(titre=data.get("titre", "Nouvelle conversation"), user_id=user_id)
    db.session.add(c)
    db.session.commit()
    return jsonify(id=c.id, titre=c.titre)


# -----
@app.route("/conversations/<int:id>/messages", methods=["POST"])
@jwt_required()
def ajouter_message(id):
    """
    Ajouter un message à une conversation
    ---
    tags:
      - Conversations
    security:
      - Bearer: []
    parameters:
      - in: path
        name: id
        type: integer
        required: true
        description: ID de la conversation
      - in: body
        name: message
        schema:
          type: object
          required: [contenu]
          properties:
            contenu: {type: string}
            include_files: {type: boolean}
            file_ids: {type: array, items: {type: integer}}
    responses:
      200:
        description: Message ajouté avec réponse IA
      500:
        description: Erreur lors de la génération de la réponse
    """
    try:
        print("Ajouter un message à la conversation")
        print(request.json)

        # Vérification que la requête contient des données JSON
        if not request.json:
            return jsonify(error="Requête JSON invalide"), 400

        # Vérification que le contenu du message est présent
        if "contenu" not in request.json:
            return jsonify(error="Le contenu du message est requis"), 400

        user_id = get_jwt_identity()
        data = request.json

        # Vérifier si la conversation existe et appartient à l'utilisateur
        conversation = Conversation.query.filter_by(id=id, user_id=user_id).first()
        if not conversation:
            return jsonify(error="Conversation non trouvée ou accès non autorisé"), 404

        # Récupérer les informations de l'utilisateur
        user = User.query.get(user_id)
        if not user:
            return jsonify(error="Utilisateur non trouvé"), 404

        # Ajout du message utilisateur - uniquement le contenu original sans les infos user
        message_user = Message(contenu=data["contenu"], role="user", conversation_id=id)
        db.session.add(message_user)

        try:
            db.session.commit()
            print(f"Message utilisateur ajouté avec ID: {message_user.id}")
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Erreur lors de l'ajout du message utilisateur: {str(e)}")
            return jsonify(error=f"Erreur de base de données: {str(e)}"), 500

        # Initialisation de la réponse IA
        ai_response = ""
        error_details = None

        # Vérifier si Ollama est disponible
        print(f"Ollama disponible: {ollama_available}")
        if not ollama_available:
            ai_response = (
                "Service IA temporairement indisponible. Veuillez réessayer plus tard."
            )
            error_details = "Ollama n'est pas configuré ou disponible"
        else:
            try:
                # Construction du prompt en commençant par les informations utilisateur
                # Préparation des informations utilisateur pour le contexte
                user_info = f"""
                User Information:
                - Last Name: {user.nom}
                - First Name: {user.prenom}
                - Email: {user.email}
                - Date of Birth: {user.date_naissance.isoformat() if user.date_naissance else "Not specified"}
                - Gender: {user.genre if user.genre else "Not specified"}
                - Profession: {user.profession if user.profession else "Not specified"}
                - Medical History: {user.antecedents if user.antecedents else "None"}
                - Medications: {user.medicaments if user.medicaments else "None"}
                - Allergies: {user.allergies if user.allergies else "None"}
                """

                # Message original de l'utilisateur
                user_message = data["contenu"]

                # Construction du prompt avec les fichiers si demandé
                fichiers_inclus = []

                # Vérifier si nous devons inclure les fichiers
                if data.get("include_files", False):
                    file_ids = data.get("file_ids", [])
                    print(f"Inclusion de fichiers demandée. IDs: {file_ids}")

                    # Récupérer les fichiers
                    if not file_ids:
                        fichiers = File.query.filter_by(user_id=user_id).all()
                        print(
                            f"Récupération de tous les fichiers de l'utilisateur: {len(fichiers)} fichiers trouvés"
                        )
                    else:
                        fichiers = File.query.filter(
                            File.id.in_(file_ids), File.user_id == user_id
                        ).all()
                        print(
                            f"Récupération des fichiers spécifiés: {len(fichiers)}/{len(file_ids)} fichiers trouvés"
                        )

                    # Traitement des fichiers
                    if fichiers:
                        fichiers_content = []

                        for fichier in fichiers:
                            try:
                                print(f"Traitement du fichier: {fichier.nom}")
                                # Extraire le chemin du blob depuis le chemin GCS
                                gcs_path = fichier.chemin.replace(
                                    f"gs://{BUCKET_NAME}/", ""
                                )
                                blob = bucket.blob(gcs_path)

                                # Vérifier si le blob existe
                                if not blob.exists():
                                    print(
                                        f"Le fichier n'existe pas dans le bucket: {gcs_path}"
                                    )
                                    continue

                                # Créer un fichier temporaire pour stocker le contenu
                                with tempfile.NamedTemporaryFile() as temp:
                                    blob.download_to_filename(temp.name)
                                    fichiers_inclus.append(fichier.nom)

                                    # Lire le contenu du fichier
                                    file_content = ""

                                    # Si c'est un PDF, extraire le texte
                                    if fichier.nom.lower().endswith(".pdf"):
                                        try:
                                            with open(temp.name, "rb") as pdf_file:
                                                pdf_reader = PdfReader(pdf_file)
                                                for page in pdf_reader.pages:
                                                    page_text = page.extract_text()
                                                    if page_text:
                                                        file_content += page_text + "\n"
                                            print(
                                                f"Texte extrait du PDF: {len(file_content)} caractères"
                                            )
                                        except Exception as pdf_err:
                                            print(
                                                f"Erreur lors de l'extraction du texte du PDF: {str(pdf_err)}"
                                            )
                                            file_content = f"[Erreur lors de l'extraction du texte du PDF: {str(pdf_err)}]"
                                    else:
                                        # Pour les autres types de fichiers, essayer de lire comme texte
                                        try:
                                            with open(
                                                temp.name, "r", encoding="utf-8"
                                            ) as text_file:
                                                file_content = text_file.read()
                                            print(
                                                f"Texte lu: {len(file_content)} caractères"
                                            )
                                        except UnicodeDecodeError:
                                            print(
                                                f"Contenu binaire non lisible pour {fichier.nom}"
                                            )
                                            file_content = f"[Contenu binaire non lisible pour {fichier.nom}]"
                                        except Exception as file_err:
                                            print(
                                                f"Erreur lors de la lecture du fichier: {str(file_err)}"
                                            )
                                            file_content = f"[Erreur lors de la lecture du fichier: {str(file_err)}]"

                                    # Ajouter au contenu des fichiers
                                    if file_content:
                                        fichiers_content.append(
                                            f">>> FICHIER: {fichier.nom}\n{file_content}\n<<<"
                                        )
                            except Exception as e:
                                error_msg = f"Erreur lors de la lecture du fichier {fichier.nom}: {str(e)}"
                                print(error_msg)
                                logger.error(error_msg)
                                continue

                        # Si des contenus de fichiers ont été extraits, les ajouter au prompt
                        if fichiers_content:
                            file_context = "\n\n".join(fichiers_content)
                            print(
                                f"Contenu des fichiers extrait: {len(file_context)} caractères"
                            )

                            # Construire le prompt complet avec les informations contextuelles
                            prompt = f"""
                            You are a medical assistant.
                            
                            {user_info}

                            The user has sent you several files that you need to analyze:

                            {file_context}

                            Here is the user's question:
                            {user_message}
                            """
                            print(
                                "Prompt contextualisé avec fichiers et informations utilisateur créé"
                            )
                        else:
                            print(
                                "Aucun contenu de fichier extrait. Utilisation du prompt avec informations utilisateur."
                            )
                            # Si aucun contenu de fichier n'a pu être extrait
                            prompt = f"""
                            You are a medical assistant.
                            
                            {user_info}
                            
                            Here is the user's question:
                            {user_message}
                            """
                    else:
                        print(
                            "Aucun fichier trouvé. Utilisation du prompt avec informations utilisateur."
                        )
                        # Si aucun fichier n'est trouvé
                        prompt = f"""
                        You are a medical assistant.
                        
                        {user_info}
                        
                        Here is the user's question:
                        {user_message}
                        """
                else:
                    # Utiliser simplement le message de l'utilisateur comme prompt avec les infos utilisateur
                    print(
                        "Pas d'inclusion de fichiers demandée. Utilisation du prompt avec informations utilisateur."
                    )
                    prompt = f"""
                    You are a medical assistant.
                    
                    {user_info}
                    
                    Here is the user's question:
                    {user_message}
                    """

                # Préparation de la requête à Ollama
                print(f"API Ollama URL: {OLLAMA_API_URL}")
                print(f"Modèle utilisé: {model_name}")
                payload = {
                    "model": model_name,
                    "messages": [{"role": "user", "content": prompt}],
                }

                # Envoi à l'API de chat
                print("Envoi de la requête à Ollama...")
                try:
                    response = requests.post(
                        OLLAMA_API_URL,
                        json=payload,
                        stream=True,
                        timeout=60,  # Timeout de 60 secondes
                    )

                    print(f"Statut de la réponse: {response.status_code}")

                    if response.status_code != 200:
                        error_content = response.text
                        error_msg = f"Erreur API Ollama (HTTP {response.status_code}): {error_content}"
                        print(error_msg)
                        raise Exception(error_msg)

                    full_reply = []

                    # Compteur pour le débogage
                    line_count = 0

                    for line in response.iter_lines():
                        line_count += 1
                        if line:
                            try:
                                line_str = line.decode("utf-8")
                                print(
                                    f"Ligne {line_count} reçue: {line_str[:100]}..."
                                )  # Afficher le début de la ligne

                                data_json = json.loads(line_str)

                                # Vérifier le format de la réponse selon la documentation Ollama
                                if (
                                    "message" in data_json
                                    and "content" in data_json["message"]
                                ):
                                    bot_reply = data_json["message"]["content"]
                                    if bot_reply:
                                        full_reply.append(bot_reply)
                                        print(
                                            f"Fragment de réponse ajouté: {bot_reply[:50]}..."
                                        )  # Afficher le début
                                else:
                                    # Format alternatif possible selon la version d'Ollama
                                    bot_reply = data_json.get("response", "")
                                    if bot_reply:
                                        full_reply.append(bot_reply)
                                        print(
                                            f"Fragment de réponse (format alt) ajouté: {bot_reply[:50]}..."
                                        )
                            except json.JSONDecodeError as jde:
                                error_msg = f"Erreur lors du décodage du JSON ligne {line_count}: {str(jde)}"
                                print(error_msg)
                                print(f"Contenu problématique: {line}")
                            except Exception as e:
                                error_msg = f"Erreur lors du traitement de la ligne {line_count}: {str(e)}"
                                print(error_msg)

                    print(f"Nombre total de lignes traitées: {line_count}")

                    # Fusion des fragments de réponse
                    ai_response = "".join(
                        full_reply
                    )  # Pas d'espace entre les fragments

                    # Vérifier si la réponse est vide
                    if not ai_response:
                        print("Réponse vide reçue d'Ollama")
                        if line_count == 0:
                            error_details = "Aucune donnée reçue d'Ollama"
                        else:
                            error_details = f"{line_count} lignes reçues mais aucun contenu exploitable"
                    else:
                        print(f"Réponse complète: {len(ai_response)} caractères")
                        print(f"Début de la réponse: {ai_response[:100]}...")

                except requests.exceptions.Timeout:
                    error_msg = "Timeout lors de la communication avec Ollama (60s)"
                    print(error_msg)
                    error_details = error_msg
                    ai_response = "Je suis désolé, le service IA met trop de temps à répondre. Veuillez réessayer plus tard."

                except requests.exceptions.ConnectionError:
                    error_msg = (
                        f"Impossible de se connecter à Ollama à l'URL: {OLLAMA_API_URL}"
                    )
                    print(error_msg)
                    error_details = error_msg
                    ai_response = "Je suis désolé, le service IA est actuellement inaccessible. Veuillez réessayer plus tard."

                except requests.exceptions.RequestException as e:
                    error_msg = f"Erreur lors de la communication avec Ollama: {str(e)}"
                    print(error_msg)
                    error_details = error_msg
                    ai_response = "Je suis désolé, je ne peux pas répondre pour le moment en raison d'une erreur de communication avec le service IA."

            except Exception as e:
                error_msg = f"Erreur inattendue: {str(e)}"
                print(error_msg)
                logger.error(error_msg)
                error_details = str(e)
                ai_response = f"Une erreur s'est produite: {str(e)}"

        # Si la réponse est toujours vide après toutes les tentatives, utiliser un message par défaut
        if not ai_response:
            print("La réponse finale est vide, utilisation du message par défaut")
            ai_response = "Je suis désolé, je n'ai pas pu générer une réponse valide."
            if not error_details:
                error_details = "Réponse vide après traitement"

        # Ajout de la réponse IA à la base de données
        message_ai = Message(contenu=ai_response, role="ai", conversation_id=id)

        # Essayer d'ajouter et persister la réponse AI
        try:
            db.session.add(message_ai)
            db.session.commit()
            print(f"Message AI ajouté avec ID: {message_ai.id}")
        except SQLAlchemyError as e:
            db.session.rollback()
            error_msg = f"Erreur lors de l'ajout du message AI: {str(e)}"
            print(error_msg)
            return jsonify(error=error_msg), 500

        # Préparer la réponse
        response_data = {
            "message": "Message ajouté avec réponse IA",
            "ai_response": ai_response,
        }

        # Ajouter les détails de l'erreur en mode debug
        if error_details and app.debug:
            response_data["debug_error"] = error_details

        # Ajouter les informations sur les fichiers traités en mode debug
        if app.debug and data.get("include_files", False):
            response_data["processed_files"] = fichiers_inclus

        return jsonify(response_data)

    except Exception as e:
        # Gestion des erreurs globales
        error_msg = f"Erreur globale dans ajouter_message: {str(e)}"
        print(error_msg)
        logger.error(error_msg)
        traceback.print_exc()  # Afficher la pile d'appel pour le débogage
        return jsonify(error=error_msg), 500


@app.route("/conversations/<int:id>", methods=["DELETE"])
@jwt_required()
def supprimer_conversation(id):
    """
    Supprimer une conversation
    ---
    tags:
      - Conversations
    security:
      - Bearer: []
    parameters:
      - in: path
        name: id
        type: integer
        required: true
        description: ID de la conversation à supprimer
    responses:
      200:
        description: Conversation supprimée
      404:
        description: Conversation non trouvée
    """
    conv = Conversation.query.get_or_404(id)
    db.session.delete(conv)
    db.session.commit()
    return jsonify(message="Conversation supprimée")


@app.route("/conversations", methods=["GET"])
@jwt_required()
def lister_conversations():
    """
    Lister les conversations de l'utilisateur
    ---
    tags:
      - Conversations
    security:
      - Bearer: []
    responses:
      200:
        description: Liste des conversations
        schema:
          type: array
          items:
            type: object
            properties:
              id: {type: integer}
              titre: {type: string}
    """
    user_id = get_jwt_identity()
    convs = Conversation.query.filter_by(user_id=user_id).all()
    return jsonify([{"id": c.id, "titre": c.titre} for c in convs])


@app.route("/conversations/<int:id>/messages", methods=["GET"])
@jwt_required()
def lister_messages(id):
    """
    Lister les messages d'une conversation
    ---
    tags:
      - Conversations
    security:
      - Bearer: []
    parameters:
      - in: path
        name: id
        type: integer
        required: true
        description: ID de la conversation
    responses:
      200:
        description: Liste des messages
        schema:
          type: array
          items:
            type: object
            properties:
              role: {type: string}
              contenu: {type: string}
    """
    conv = Conversation.query.get_or_404(id)
    return jsonify([{"role": m.role, "contenu": m.contenu} for m in conv.messages])


@app.route("/chat", methods=["POST"])
def chat():
    """
    Envoyer un message à l'IA sans créer de conversation
    ---
    tags:
      - IA
    parameters:
      - in: body
        name: message
        schema:
          type: object
          required: [text]
          properties:
            text: {type: string}
    responses:
      200:
        description: Réponse de l'IA
      500:
        description: Erreur de l'IA
    """
    data = request.get_json()
    user_message = data.get("text", "")

    if not ollama_available:
        return jsonify({"summary": "Service IA non disponible pour le moment."}), 503

    # Envoi du message à Ollama
    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": user_message}],
    }

    try:
        # Envoyer la requête en mode stream
        response = requests.post(OLLAMA_API_URL, json=payload, stream=True)

        # Liste pour stocker les parties de la réponse
        full_reply = []

        # Lire chaque ligne de la réponse
        for line in response.iter_lines():
            if line:
                try:
                    # Décoder chaque ligne JSON
                    data = json.loads(line.decode("utf-8"))
                    # Ajouter le contenu de la réponse du bot à la liste
                    bot_reply = data.get("message", {}).get("content", "")
                    if bot_reply:
                        full_reply.append(bot_reply)
                except json.JSONDecodeError:
                    print("Erreur lors du décodage du JSON:", line)

        # Joindre toutes les parties de la réponse pour obtenir la réponse complète
        final_reply = " ".join(full_reply)

        # Si aucune réponse n'a été trouvée
        if not final_reply:
            return jsonify({"error": "No valid reply from the model"}), 500

        return jsonify({"summary": final_reply})

    except Exception as e:
        return (
            jsonify({"error": f"Erreur lors de la communication avec l'IA: {str(e)}"}),
            500,
        )


# Route pour la santé de l'API
@app.route("/health", methods=["GET"])
def health_check():
    """
    Vérifier l'état de santé de l'API
    ---
    tags:
      - Système
    responses:
      200:
        description: API en bonne santé
        schema:
          type: object
          properties:
            status: {type: string}
            database: {type: string}
            ollama: {type: string}
            gcs: {type: string}
    """
    # Vérifier la base de données
    db_status = "ok"
    try:
        # Exécuter une requête simple pour vérifier la connexion à la base de données
        db.session.execute("SELECT 1")
    except Exception as e:
        db_status = f"error: {str(e)}"

    # Vérifier Cloud Storage
    gcs_status = "ok"
    try:
        # Vérifier si le bucket existe
        bucket.exists()
    except Exception as e:
        gcs_status = f"error: {str(e)}"

    return jsonify(
        {
            "status": "running",
            "database": db_status,
            "ollama": "available" if ollama_available else "unavailable",
            "gcs": gcs_status,
        }
    )


# à l'intérieur d'un contexte d'application
with app.app_context():
    try:
        db.create_all()
        app.logger.info("Base de données initialisée avec succès.")
    except Exception as e:
        app.logger.error(
            f"Erreur lors de l'initialisation de la base de données: {str(e)}"
        )


# Alternativement, créez une route dédiée pour initialiser la base de données
@app.route("/init-db", methods=["GET"])
def init_db():
    try:
        db.create_all()
        return jsonify({"status": "success", "message": "Base de données initialisée."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    # Configuration du logging
    logging.basicConfig(level=logging.INFO)

    # Création des tables avant le démarrage
    with app.app_context():
        db.create_all()
        print("Base de données initialisée.")

    # Démarrage du serveur
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
