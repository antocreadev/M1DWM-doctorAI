from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
import random
import string

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['JWT_SECRET_KEY'] = 'secret'

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
    fichiers = db.relationship('File', backref='user', lazy=True)
    conversations = db.relationship('Conversation', backref='user', lazy=True)

class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Conversation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titre = db.Column(db.String(100))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    messages = db.relationship('Message', backref='conversation', lazy=True)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    contenu = db.Column(db.Text)
    role = db.Column(db.String(10))  # 'user' ou 'ai'
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversation.id'), nullable=False)

### ROUTES AUTH ###

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(
        prenom=data['prenom'],
        nom=data['nom'],
        email=data['email'],
        password=hashed_pw,
        date_naissance=datetime.strptime(data['date_naissance'], "%Y-%m-%d"),
        genre=data['genre'],
        adresse=data['adresse'],
        ville=data['ville'],
        code_postal=data['code_postal'],
        telephone=data['telephone'],
        profession=data['profession'],
        terms=data['terms'],
        data=data['data'],
        antecedents=data.get('antecedents'),
        medicaments=data.get('medicaments'),
        allergies=data.get('allergies')
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(message="Utilisateur enregistré"), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify(token=access_token)
    return jsonify(message="Identifiants invalides"), 401

### ROUTES UTILISATEUR ###
@app.route('/me', methods=['GET'])
@jwt_required()
def me():
    user = User.query.get(get_jwt_identity())
    return jsonify(email=user.email, nom=user.nom, prenom=user.prenom)

### FICHIERS ###
@app.route('/fichiers', methods=['POST'])
@jwt_required()
def ajouter_fichier():
    user_id = get_jwt_identity()
    data = request.json
    f = File(nom=data['nom'], user_id=user_id)
    db.session.add(f)
    db.session.commit()
    return jsonify(message="Fichier ajouté"), 201

@app.route('/fichiers/<int:id>', methods=['DELETE'])
@jwt_required()
def supprimer_fichier(id):
    f = File.query.get_or_404(id)
    db.session.delete(f)
    db.session.commit()
    return jsonify(message="Fichier supprimé")

### CONVERSATIONS ###
@app.route('/conversations', methods=['POST'])
@jwt_required()
def creer_conversation():
    user_id = get_jwt_identity()
    data = request.json
    c = Conversation(titre=data.get('titre', 'Nouvelle conversation'), user_id=user_id)
    db.session.add(c)
    db.session.commit()
    return jsonify(id=c.id, titre=c.titre)

@app.route('/conversations/<int:id>/messages', methods=['POST'])
@jwt_required()
def ajouter_message(id):
    data = request.json
    message_user = Message(contenu=data['contenu'], role='user', conversation_id=id)
    message_ai = Message(contenu=''.join(random.choices(string.ascii_letters, k=40)), role='ai', conversation_id=id)
    db.session.add_all([message_user, message_ai])
    db.session.commit()
    return jsonify(message="Message ajouté avec réponse IA")

@app.route('/conversations/<int:id>', methods=['DELETE'])
@jwt_required()
def supprimer_conversation(id):
    conv = Conversation.query.get_or_404(id)
    db.session.delete(conv)
    db.session.commit()
    return jsonify(message="Conversation supprimée")

@app.route('/conversations', methods=['GET'])
@jwt_required()
def lister_conversations():
    user_id = get_jwt_identity()
    convs = Conversation.query.filter_by(user_id=user_id).all()
    return jsonify([{'id': c.id, 'titre': c.titre} for c in convs])

@app.route('/conversations/<int:id>/messages', methods=['GET'])
@jwt_required()
def lister_messages(id):
    conv = Conversation.query.get_or_404(id)
    return jsonify([
        {'role': m.role, 'contenu': m.contenu}
        for m in conv.messages
    ])

### INIT DB ###
@app.cli.command("init-db")
def init_db():
    db.create_all()
    print("Base de données initialisée.")

### LANCEMENT ###
if __name__ == '__main__':
    app.run(debug=True)
