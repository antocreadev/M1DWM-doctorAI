from ollama import pull, chat, ResponseError

model_name = 'tinyllama'

# Étape 1 : Pull du modèle
try:
    print(f"Téléchargement du modèle '{model_name}'...")
    pull(model_name)
    print("✅ Modèle téléchargé avec succès.")
except ResponseError as e:
    print(f"❌ Erreur lors du téléchargement : {e.error}")
    exit(1)

# Étape 2 : Utilisation du modèle pour une conversation
try:
    response = chat(model=model_name, messages=[
        {'role': 'user', 'content': 'Explique-moi la théorie de l’évolution en 2 phrases.'}
    ])
    print("\n🧠 Réponse du modèle :\n")
    print(response.message.content)

except ResponseError as e:
    print(f"❌ Erreur lors de l’appel au modèle : {e.error}")
