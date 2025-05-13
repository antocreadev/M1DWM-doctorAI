import os
import requests

class AIService:
    def __init__(self):
        self.environment = os.environ.get("ENVIRONMENT", "development")
        
        # En production, utilisez l'URL du service Ollama sur Cloud Run
        if self.environment == "production":
            self.api_base = os.environ.get("OLLAMA_URL", "http://ollama-gemma:8080/api")
        else:
            # Pour le développement, utilisez Ollama local
            self.api_base = "http://localhost:11434/api"
    
    def generate_response(self, prompt, context=None):
        try:
            response = requests.post(
                f"{self.api_base}/generate",
                json={
                    "model": "gemma2:9b",
                    "prompt": prompt,
                    "context": context or []
                },
                timeout=60  # timeout plus long pour l'inférence
            )
            
            if response.status_code == 200:
                return response.json().get("response", "")
            
            return f"Erreur: Statut {response.status_code}"
        except Exception as e:
            return f"Erreur lors de la génération de la réponse: {str(e)}"

# Singleton pour accéder au service d'IA
ai_service = AIService()