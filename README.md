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
