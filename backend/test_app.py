import unittest
import json
import os
import tempfile
from datetime import datetime
from app import app, db, User, Conversation, Message, File, bcrypt

class FlaskAppTestCase(unittest.TestCase):
    """Tests de base pour l'application Flask"""

    def setUp(self):
        """Configuration avant chaque test"""
        # Configurer l'application pour les tests
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['JWT_SECRET_KEY'] = 'test-key'
        self.temp_folder = tempfile.mkdtemp()
        app.config['UPLOAD_FOLDER'] = self.temp_folder
        
        # Créer un client de test
        self.app = app.test_client()
        
        # Créer toutes les tables dans la base de données en mémoire
        with app.app_context():
            db.create_all()
            
            # Créer un utilisateur de test
            hashed_password = bcrypt.generate_password_hash('password123').decode('utf-8')
            test_user = User(
                prenom='Test',
                nom='User',
                email='test@example.com',
                password=hashed_password,
                date_naissance=datetime.strptime('1990-01-01', '%Y-%m-%d'),
                genre='Homme',
                adresse='123 Test St',
                ville='Test City',
                code_postal='12345',
                telephone='0123456789',
                profession='Testeur',
                terms=True,
                data=True
            )
            db.session.add(test_user)
            db.session.commit()
    
    def tearDown(self):
        """Nettoyage après chaque test"""
        with app.app_context():
            db.session.remove()
            db.drop_all()
    
    def test_register(self):
        """Test d'enregistrement d'un nouvel utilisateur"""
        response = self.app.post(
            '/register',
            data=json.dumps({
                'prenom': 'Nouveau',
                'nom': 'Utilisateur',
                'email': 'nouveau@example.com',
                'password': 'motdepasse123',
                'date_naissance': '1995-05-05',
                'genre': 'Femme',
                'adresse': '456 Nouvelle Rue',
                'ville': 'Nouvelle Ville',
                'code_postal': '54321',
                'telephone': '9876543210',
                'profession': 'Développeur',
                'terms': True,
                'data': True
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('Utilisateur enregistré', data['message'])
    
    def test_login(self):
        """Test de connexion"""
        response = self.app.post(
            '/login',
            data=json.dumps({
                'email': 'test@example.com',
                'password': 'password123'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('token', data)
        
        return data['token']
    
    def test_profile(self):
        """Test de récupération du profil utilisateur"""
        # D'abord se connecter
        token = self.test_login()
        
        # Accéder au profil - CORRECTION: Format correct du header Bearer
        response = self.app.get(
            '/me',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['email'], 'test@example.com')
        self.assertEqual(data['prenom'], 'Test')
        self.assertEqual(data['nom'], 'User')
    
    def test_conversation_workflow(self):
        """Test du flux complet pour les conversations"""
        # D'abord se connecter
        token = self.test_login()
        # CORRECTION: Format correct du header Bearer
        headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
        
        # 1. Créer une conversation
        create_response = self.app.post(
            '/conversations',
            headers=headers,
            data=json.dumps({'titre': 'Test Conversation'})
        )
        
        self.assertEqual(create_response.status_code, 200)
        create_data = json.loads(create_response.data)
        conversation_id = create_data['id']
        
        # 2. Ajouter un message
        message_response = self.app.post(
            f'/conversations/{conversation_id}/messages',
            headers=headers,
            data=json.dumps({'contenu': 'Ceci est un message de test'})
        )
        
        self.assertEqual(message_response.status_code, 200)
        
        # 3. Lister les messages
        list_response = self.app.get(
            f'/conversations/{conversation_id}/messages',
            headers=headers
        )
        
        self.assertEqual(list_response.status_code, 200)
        messages = json.loads(list_response.data)
        self.assertEqual(len(messages), 2)  # Un message utilisateur + un message IA
        self.assertEqual(messages[0]['role'], 'user')
        self.assertEqual(messages[0]['contenu'], 'Ceci est un message de test')
        
        # 4. Supprimer la conversation
        delete_response = self.app.delete(
            f'/conversations/{conversation_id}',
            headers=headers
        )
        
        self.assertEqual(delete_response.status_code, 200)
    
    def test_file_upload(self):
        """Test d'upload et de gestion de fichiers"""
        # D'abord se connecter
        token = self.test_login()
        # CORRECTION: Format correct du header Bearer
        headers = {'Authorization': f'Bearer {token}'}
        
        # Créer un fichier temporaire
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as temp:
            temp_path = temp.name
            temp.write(b'Contenu de test pour le fichier')
        
        try:
            # 1. Upload du fichier
            with open(temp_path, 'rb') as f:
                upload_response = self.app.post(
                    '/upload',
                    headers=headers,
                    data={'file': (f, 'test_file.txt')}
                )
            
            self.assertEqual(upload_response.status_code, 201)
            upload_data = json.loads(upload_response.data)
            self.assertIn('nom', upload_data)
            filename = upload_data['nom']
            
            # 2. Lister les fichiers
            list_response = self.app.get(
                '/fichiers',
                headers=headers
            )
            
            self.assertEqual(list_response.status_code, 200)
            files = json.loads(list_response.data)
            self.assertEqual(len(files), 1)
            file_id = files[0]['id']
            
            # 3. Télécharger le fichier
            download_response = self.app.get(
                f'/fichiers/{filename}',
                headers=headers
            )
            
            self.assertEqual(download_response.status_code, 200)
            
            # 4. Supprimer le fichier
            delete_response = self.app.delete(
                f'/fichiers/{file_id}',
                headers=headers
            )
            
            self.assertEqual(delete_response.status_code, 200)
            
            # Vérifier que le fichier a été supprimé
            list_response = self.app.get(
                '/fichiers',
                headers=headers
            )
            files = json.loads(list_response.data)
            self.assertEqual(len(files), 0)
            
        finally:
            # Supprimer le fichier temporaire
            if os.path.exists(temp_path):
                os.remove(temp_path)


if __name__ == '__main__':
    unittest.main()