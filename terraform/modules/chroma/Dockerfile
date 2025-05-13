FROM chromadb/chroma:latest

# Configuration pour persister les données
ENV CHROMA_DB_IMPL=duckdb
ENV CHROMA_PERSISTENCE_DIRECTORY=/chroma/data

# Exposer le port par défaut
EXPOSE 8000

# Commande par défaut
CMD ["uvicorn", "chromadb.app:app", "--host", "0.0.0.0", "--port", "8000"]
