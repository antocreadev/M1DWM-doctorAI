# Lancer le backend

```bash
cd backend
```

```bash
python -m venv .venv
```

```bash
source .venv/bin/activate
```

```bash
pip install --upgrade pip
```

```bash
pip install --upgrade setuptools
```

```bash
pip install -r requirements.txt
```

```bash
flask init-db
```

```bash
flask run
```

#### Swagger

Ouvrir l'URL suivante dans le navigateur :

```
http://127.0.0.1:5000/apidocs/
```


# Lancer le frontend

```bash
cd frontend
```

```bash
bun i
```


```bash
bun dev
```


# Local 
## Ollama
```bash
docker pull ollama/ollama
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```
## Chroma db 
```bash
docker pull chromadb/chroma
docker run -v ./chroma-data:/data -p 8000:8000 chromadb/chroma
```
