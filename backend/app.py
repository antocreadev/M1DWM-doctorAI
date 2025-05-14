from flask import Flask, request, jsonify, send_from_directory, json
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
import os
from flasgger import Swagger
from datetime import datetime
import random
import string
import uuid
from werkzeug.utils import secure_filename
from flask_cors import CORS
from PyPDF2 import PdfReader
import requests
import logging


import chromadb

chroma_client = chromadb.Client()
collection = chroma_client.create_collection(name="my_collection")


# Configuration de base
app = Flask(__name__)

CORS(app)

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

    print("✅ Modèle téléchargé avec succès.")
    ollama_available = True

except Exception as e:
    print(f"⚠️ Impossible d'initialiser Ollama: {e}")
    print("L'application continuera sans les fonctionnalités d'IA...")

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
@jwt_required()
def upload_file():
    """
    Télécharger un fichier
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
    ext = os.path.splitext(file.filename)[1]
    filename_uuid = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename_uuid)
    file.save(filepath)
    user_id = get_jwt_identity()
    fichier = File(nom=filename_uuid, chemin=filepath, user_id=user_id)
    db.session.add(fichier)
    db.session.commit()
    return jsonify(message="Fichier téléversé", nom=filename_uuid, chemin=filepath), 201


@app.route("/fichiers/<filename>", methods=["GET"])
@jwt_required()
def telecharger_fichier(filename):
    """
    Télécharger un fichier
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
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


@app.route("/fichiers/<int:id>", methods=["DELETE"])
@jwt_required()
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
        os.remove(f.chemin)
    except Exception as e:
        print(f"Erreur lors de la suppression du fichier physique : {e}")
    db.session.delete(f)
    db.session.commit()
    return jsonify(message="Fichier supprimé")


@app.route("/fichiers", methods=["GET"])
@jwt_required()
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
    responses:
      200:
        description: Message ajouté avec réponse IA
    """
    data = request.json
    message_user = Message(contenu=data["contenu"], role="user", conversation_id=id)

    # Ajout du message utilisateur
    db.session.add(message_user)
    db.session.commit()

    # Si Ollama est disponible, utiliser l'IA pour la réponse
    ai_response = ""
    if ollama_available:
        try:
            payload = {
                "model": model_name,
                "messages": [{"role": "user", "content": data["contenu"]}],
            }

            response = requests.post(OLLAMA_API_URL, json=payload, stream=True)
            full_reply = []

            for line in response.iter_lines():
                if line:
                    try:
                        data_json = json.loads(line.decode("utf-8"))
                        bot_reply = data_json.get("message", {}).get("content", "")
                        if bot_reply:
                            full_reply.append(bot_reply)
                    except json.JSONDecodeError:
                        print("Erreur lors du décodage du JSON:", line)

            ai_response = " ".join(full_reply)
        except Exception as e:
            print(f"Erreur lors de la communication avec Ollama: {e}")
            ai_response = "Je suis désolé, je ne peux pas répondre pour le moment."
    else:
        # Réponse de repli si Ollama n'est pas disponible
        ai_response = (
            "Service IA temporairement indisponible. Veuillez réessayer plus tard."
        )

    # Si la réponse est vide, utiliser un message par défaut
    if not ai_response:
        ai_response = "Je suis désolé, je n'ai pas pu générer une réponse valide."

    # Ajout de la réponse IA
    message_ai = Message(contenu=ai_response, role="ai", conversation_id=id)
    db.session.add(message_ai)
    db.session.commit()

    return jsonify(message="Message ajouté avec réponse IA", ai_response=ai_response)


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
    """
    # Vérifier la base de données
    db_status = "ok"
    try:
        # Exécuter une requête simple pour vérifier la connexion à la base de données
        db.session.execute("SELECT 1")
    except Exception as e:
        db_status = f"error: {str(e)}"

    return jsonify(
        {
            "status": "running",
            "database": db_status,
            "ollama": "available" if ollama_available else "unavailable",
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
