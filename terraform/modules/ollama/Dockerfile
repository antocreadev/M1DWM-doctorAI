FROM ollama/ollama:0.3.6

# Écoute sur toutes les interfaces, port 8080
ENV OLLAMA_HOST 0.0.0.0:8080

# Stocke les fichiers de poids de modèle dans /models
ENV OLLAMA_MODELS /models

# Réduit la verbosité des logs
ENV OLLAMA_DEBUG false

# Ne jamais décharger les poids du modèle du GPU
ENV OLLAMA_KEEP_ALIVE -1 

# Stocke les poids du modèle dans l'image du conteneur
ENV MODEL gemma2:9b
RUN ollama serve & sleep 5 && ollama pull $MODEL 

# Démarre Ollama
ENTRYPOINT ["ollama", "serve"]
