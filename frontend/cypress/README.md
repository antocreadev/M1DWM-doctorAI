# Tests Cypress pour MediAssist

Ce dossier contient les tests E2E avec Cypress pour l'application MediAssist.

## Structure des tests

- `/auth` : Tests pour les fonctionnalités d'authentification (connexion/inscription)
- `/dashboard` : Tests pour le tableau de bord et ses fonctionnalités
- `e2e-flow.cy.ts` : Test de bout en bout qui simule un parcours utilisateur complet

## Exécuter les tests

### Ouvrir l'interface Cypress

```bash
bun run cypress
```

### Exécuter tous les tests

```bash
bun test
```

### Exécuter uniquement les tests d'authentification

```bash
bun test:auth
```

### Exécuter uniquement les tests du tableau de bord

```bash
bun test:dashboard
```

### Exécuter le test de bout en bout

```bash
bun test:e2e
```

### Exécuter les tests avec serveur de développement

```bash
bun test:dev
```

## Comment ajouter de nouveaux tests

1. Créez un nouveau fichier dans le dossier approprié dans `/cypress/e2e/`
2. Nommez votre fichier avec le suffixe `.cy.ts`
3. Utilisez la structure de base:

```typescript
describe("Nom du test", () => {
  beforeEach(() => {
    // Code d'initialisation
  });

  it("devrait faire quelque chose", () => {
    // Votre test
  });
});
```

## Commandes personnalisées

Des commandes personnalisées sont disponibles dans `/cypress/support/e2e.ts`:

- `cy.login(email, password)` - Se connecter avec un compte
- `cy.register(firstName, lastName, email, password)` - Créer un nouveau compte
- `cy.setAuthToken(token)` - Définir un token d'authentification simulé
- `cy.completeOnboarding()` - Compléter le processus d'onboarding
