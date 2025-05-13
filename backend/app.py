from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
import config
import os
from flasgger import Swagger
from datetime import datetime
import random
import string
import uuid
from werkzeug.utils import secure_filename
from ollama import pull, chat, ResponseError


# Configuration de base
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = config.SQLALCHEMY_DATABASE_URI
app.config["JWT_SECRET_KEY"] = config.JWT_SECRET_KEY
app.config["UPLOAD_FOLDER"] = config.UPLOAD_FOLDER
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
model_name = "tinyllama"
# Pull du modèle
try:
    print(f"Téléchargement du modèle '{model_name}'...")
    pull(model_name)
    print("✅ Modèle téléchargé avec succès.")
except ResponseError as e:
    print(f"❌ Erreur lors du téléchargement : {e.error}")
    exit(1)

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
    fichiers = db.relationship("File", backref="user", lazy=True)
    conversations = db.relationship("Conversation", backref="user", lazy=True)


class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100))
    chemin = db.Column(db.String(200))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)


class Conversation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titre = db.Column(db.String(100))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    messages = db.relationship("Message", backref="conversation", lazy=True)


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    contenu = db.Column(db.Text)
    role = db.Column(db.String(10))  # 'user' ou 'ai'
    conversation_id = db.Column(
        db.Integer, db.ForeignKey("conversation.id"), nullable=False
    )


### ROUTES AUTH ###


@app.route("/register", methods=["POST"])
def register():
    """
    Enregistrement d'un nouvel utilisateur
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: utilisateur
        schema:
          type: object
          required: [prenom, nom, email, password, date_naissance, genre, adresse, ville, code_postal, telephone, profession, terms, data]
          properties:
            prenom: {type: string}
            nom: {type: string}
            email: {type: string}
            password: {type: string}
            date_naissance: {type: string, format: date}
            genre: {type: string}
            adresse: {type: string}
            ville: {type: string}
            code_postal: {type: string}
            telephone: {type: string}
            profession: {type: string}
            terms: {type: boolean}
            data: {type: boolean}
            antecedents: {type: string}
            medicaments: {type: string}
            allergies: {type: string}
    responses:
      201:
        description: Utilisateur enregistré
      400:
        description: Erreur de validation
    """
    data = request.json
    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    user = User(
        prenom=data["prenom"],
        nom=data["nom"],
        email=data["email"],
        password=hashed_pw,
        date_naissance=datetime.strptime(data["date_naissance"], "%Y-%m-%d"),
        genre=data["genre"],
        adresse=data["adresse"],
        ville=data["ville"],
        code_postal=data["code_postal"],
        telephone=data["telephone"],
        profession=data["profession"],
        terms=data["terms"],
        data=data["data"],
        antecedents=data.get("antecedents"),
        medicaments=data.get("medicaments"),
        allergies=data.get("allergies"),
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(message="Utilisateur enregistré"), 201


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
        access_token = create_access_token(identity=user.id)
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
    return jsonify(email=user.email, nom=user.nom, prenom=user.prenom)


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
    message_ai = Message(
        contenu="".join(random.choices(string.ascii_letters, k=40)),
        role="ai",
        conversation_id=id,
    )
    db.session.add_all([message_user, message_ai])
    db.session.commit()
    return jsonify(message="Message ajouté avec réponse IA")


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


### INIT DB ###


@app.cli.command("init-db")
def init_db():
    db.create_all()
    print("Base de données initialisée.")


### LANCEMENT ###

if __name__ == "__main__":
    app.run(debug=True)
