import chromadb
import os

class VectorStore:
    def __init__(self):
        # Pour la production, utilisez le client HTTP pour se connecter au serveur ChromaDB sur Cloud Run
        if os.environ.get("ENVIRONMENT", "development") == "production":
            chromadb_url = os.environ.get("CHROMADB_URL", "http://chromadb:8000")
            self.client = chromadb.HttpClient(host=chromadb_url.split("://")[1].split(":")[0], port=8000)
        else:
            # Pour le développement, utilisez un client en mémoire
            self.client = chromadb.Client()
        
        # Créer une collection pour les documents médicaux
        self.documents_collection = self.client.get_or_create_collection(
            name="medical_documents",
            metadata={"hnsw:space": "cosine"}
        )
    
    def add_document(self, document_id, document_text, metadata=None):
        self.documents_collection.add(
            documents=[document_text],
            metadatas=[metadata or {}],
            ids=[str(document_id)]
        )
    
    def search_documents(self, query, limit=5):
        results = self.documents_collection.query(
            query_texts=[query],
            n_results=limit
        )
        return results

# Singleton pour accéder au magasin de vecteurs
vector_store = VectorStore()