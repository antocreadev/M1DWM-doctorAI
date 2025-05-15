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
https://mediassist-backend-with-sql-bv5bumqn3a-ew.a.run.app/apidocs/
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

# Lancer les tests
```bash
# Ouvrir l'interface Cypress
npx cypress open
# Exécuter tous les tests
npx cypress run
# Exécuter uniquement certains tests
npx cypress run --spec 'cypress/e2e/auth/**/*.cy.ts,cypress/e2e/dashboard/**/*.cy.ts'
```



