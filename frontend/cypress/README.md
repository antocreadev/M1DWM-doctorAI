# Tests Cypress pour MediAssist

Ce dossier contient les tests E2E avec Cypress pour l'application MediAssist.

## Structure des tests

- `/auth` : Tests pour les fonctionnalités d'authentification
  - `login.cy.ts` - Tests du formulaire de connexion et validation
  - `register.cy.ts` - Tests du formulaire d'inscription et validation
  - `navigation.cy.ts` - Tests de navigation entre les pages d'authentification
- `/dashboard` : Tests pour le tableau de bord et ses fonctionnalités
  - `dashboard.cy.ts` - Tests de navigation et composants du tableau de bord
  - `chat.cy.ts` - Tests de la fonctionnalité de chat avec l'assistant
- `e2e-flow.cy.ts` : Test de bout en bout qui simule un parcours utilisateur complet (inscription → onboarding → connexion → utilisation)

> **Note**: Le test e2e-flow.cy.ts est actuellement en cours de développement et n'est pas inclus dans le pipeline CI/CD car il nécessite des améliorations pour gérer correctement le flux d'onboarding.

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

## État des tests

- **Tests passants**: 13/14 tests passent avec succès
- **Tests en développement**: Le test e2e-flow.cy.ts est en cours de développement pour gérer le flux d'onboarding complexe

## Bonnes pratiques implémentées

1. Utilisation d'attributs `data-cy` pour tous les éléments importants de l'interface
2. Tests indépendants qui peuvent s'exécuter dans n'importe quel ordre
3. Gestion robuste de l'authentification pour les tests du tableau de bord
4. Génération de données de test dynamiques pour éviter les conflits
5. Tests qui vérifient à la fois l'interface et les fonctionnalités

## Intégration CI/CD

Les tests Cypress sont intégrés dans le pipeline CI/CD dans le fichier `/.github/workflows/frontend.yml`:
- Les tests d'authentification s'exécutent en premier
- Les tests du tableau de bord s'exécutent ensuite
- Les tests sont exécutés en mode headless avec le navigateur Chrome
