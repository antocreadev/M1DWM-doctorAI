from flask import Flask, json, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from datetime import datetime
import random
import string
import uuid
import os
from werkzeug.utils import secure_filename

#chatbot
import requests
import fitz  # PyMuPDF
import requests
from PyPDF2 import PdfReader



# Config de base
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///data.db"
app.config["JWT_SECRET_KEY"] = "secret"
app.config["UPLOAD_FOLDER"] = "uploads"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# Extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

CORS(app)
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
    nom = db.Column(db.String(100))  # nom UUID
    chemin = db.Column(db.String(200))  # chemin relatif
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
    user = User.query.get(get_jwt_identity())
    return jsonify(email=user.email, nom=user.nom, prenom=user.prenom)


### UPLOAD FICHIERS ###
@app.route("/upload", methods=["POST"])

def upload_file():
    if "file" not in request.files:
        return jsonify(message="Aucun fichier envoyé"), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify(message="Nom de fichier vide"), 400

    if file:
        ext = os.path.splitext(file.filename)[1]
        filename_uuid = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename_uuid)
        file.save(filepath)

        user_id = get_jwt_identity()
        fichier = File(nom=filename_uuid, chemin=filepath, user_id=user_id)
        db.session.add(fichier)
        db.session.commit()

        return (
            jsonify(message="Fichier téléversé", nom=filename_uuid, chemin=filepath),
            201,
        )


### ROUTE POUR TÉLÉCHARGER UN FICHIER ###
@app.route("/fichiers/<filename>", methods=["GET"])
@jwt_required()
def telecharger_fichier(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


### SUPPRIMER UN FICHIER ###
@app.route("/fichiers/<int:id>", methods=["DELETE"])
@jwt_required()
def supprimer_fichier(id):
    f = File.query.get_or_404(id)
    try:
        os.remove(f.chemin)
    except Exception as e:
        print(f"Erreur lors de la suppression du fichier physique : {e}")
    db.session.delete(f)
    db.session.commit()
    return jsonify(message="Fichier supprimé")


### LISTER LES FICHIERS D’UN UTILISATEUR ###
@app.route("/fichiers", methods=["GET"])
@jwt_required()
def lister_fichiers():
    user_id = get_jwt_identity()
    fichiers = File.query.filter_by(user_id=user_id).all()
    return jsonify([{"id": f.id, "nom": f.nom, "chemin": f.chemin} for f in fichiers])


### CONVERSATIONS ###
@app.route("/conversations", methods=["POST"])
@jwt_required()
def creer_conversation():
    user_id = get_jwt_identity()
    data = request.json
    c = Conversation(titre=data.get("titre", "Nouvelle conversation"), user_id=user_id)
    db.session.add(c)
    db.session.commit()
    return jsonify(id=c.id, titre=c.titre)


@app.route("/conversations/<int:id>/messages", methods=["POST"])
@jwt_required()
def ajouter_message(id):
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
    conv = Conversation.query.get_or_404(id)
    db.session.delete(conv)
    db.session.commit()
    return jsonify(message="Conversation supprimée")


@app.route("/conversations", methods=["GET"])
@jwt_required()
def lister_conversations():
    user_id = get_jwt_identity()
    convs = Conversation.query.filter_by(user_id=user_id).all()
    return jsonify([{"id": c.id, "titre": c.titre} for c in convs])


@app.route("/conversations/<int:id>/messages", methods=["GET"])
@jwt_required()
def lister_messages(id):
    conv = Conversation.query.get_or_404(id)
    return jsonify([{"role": m.role, "contenu": m.contenu} for m in conv.messages])


### INIT DB ###
@app.cli.command("init-db")
def init_db():
    db.create_all()
    print("Base de données initialisée.")



####chatbot

OLLAMA_API_URL = "http://localhost:11434/api/chat"



@app.route("/chat", methods=["POST"])
def upload_pdf():
    data = request.get_json()
    user_message = data.get("text", "")

    # Envoi du message à Ollama
    payload = {
        "model": "tinyllama",  # Modèle TinyLlama
        "messages": [{"role": "user", "content": user_message}]
    }
    
    # Envoyer la requête en mode stream
    response = requests.post(OLLAMA_API_URL, json=payload, stream=True)

    # Liste pour stocker les parties de la réponse
    full_reply = []

    # Lire chaque ligne de la réponse
    for line in response.iter_lines():
        if line:
            try:
                # Décoder chaque ligne JSON
                data = json.loads(line.decode('utf-8'))
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

@app.route("/uploadpdf", methods=["POST"])
def analyze_pdf():
    if "file" not in request.files:
        return jsonify({"error": "Aucun fichier envoyé"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Fichier non sélectionné"}), 400

    # Sauvegarde temporaire du fichier
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(file_path)

    # Extraction du texte du PDF
    try:
        reader = PdfReader(file_path)
        text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
    except Exception as e:
        return jsonify({"error": f"Erreur de lecture du PDF: {str(e)}"}), 500

    # Appel à Ollama avec le texte extrait
    payload = {
        "model": "tinyllama",
        "messages": [{
            "role": "user",
            "content": f"Voici un rapport médical. Donne-moi une synthèse claire pour un patient : {text}"
        }]
    }

    response = requests.post(OLLAMA_API_URL, json=payload, stream=True)

    full_reply = []
    for line in response.iter_lines():
        if line:
            try:
                data = json.loads(line.decode("utf-8"))
                content = data.get("message", {}).get("content", "")
                if content:
                    full_reply.append(content)
            except json.JSONDecodeError:
                continue

    final_summary = " ".join(full_reply)
    return jsonify({"summary": final_summary})





### LANCEMENT ###
if __name__ == "__main__":
    app.run(debug=True)
