// cypress/e2e/auth/register.cy.js

describe('Page d\'inscription', () => {
  beforeEach(() => {
    // Visiter la page d'inscription avant chaque test
    cy.visit('/auth/register')
    
    // Chargement des fixtures
    cy.fixture('users').as('userData')
  })

  it('affiche correctement la page d\'inscription', () => {
    // Vérifier que les éléments principaux sont présents
    cy.get('h2').contains('Créer un compte').should('be.visible')
    cy.contains('Inscrivez-vous pour commencer votre analyse médicale').should('be.visible')
    
    // Vérifier la présence des champs de formulaire
    cy.get('input[id="firstName"]').should('be.visible')
    cy.get('input[id="lastName"]').should('be.visible')
    cy.get('input[id="email"]').should('be.visible')
    cy.get('input[id="password"]').should('be.visible')
    cy.get('input[id="confirmPassword"]').should('be.visible')
    
    // Vérifier la présence du bouton d'inscription
    cy.get('button[type="submit"]').contains('S\'inscrire').should('be.visible')
    
    // Vérifier la présence du lien de connexion
    cy.contains('Vous avez déjà un compte?').should('be.visible')
    cy.contains('Se connecter').should('be.visible')
  })

  it('affiche un état de chargement pendant la soumission du formulaire', function() {
    // Utilisation des données de test
    const { validUser } = this.userData
    
    // Générer un email unique pour éviter les conflits
    const uniqueEmail = `test-${Date.now()}@example.com`
    
    // Remplir et soumettre le formulaire
    cy.get('input[id="firstName"]').type(validUser.firstName)
    cy.get('input[id="lastName"]').type(validUser.lastName)
    cy.get('input[id="email"]').type(uniqueEmail)
    cy.get('input[id="password"]').type(validUser.password)
    cy.get('input[id="confirmPassword"]').type(validUser.password)
    cy.get('button[type="submit"]').click()
    
    // Vérifier que le bouton montre l'état de chargement
    cy.contains('Création en cours...').should('be.visible')
    
    // Attendre la redirection (dans ce cas vers l'onboarding)
    cy.url().should('include', '/onboarding/step-1', { timeout: 10000 })
  })

  it('vérifie que les mots de passe correspondent', function() {
    // Cette fonctionnalité dépend de l'implémentation de la validation côté client
    const { validUser } = this.userData
    
    // Remplir le formulaire avec des mots de passe différents
    cy.get('input[id="firstName"]').type(validUser.firstName)
    cy.get('input[id="lastName"]').type(validUser.lastName)
    cy.get('input[id="email"]').type(validUser.email)
    cy.get('input[id="password"]').type(validUser.password)
    cy.get('input[id="confirmPassword"]').type('DifferentPassword123!')
    
    // Note: Ce test suppose que vous avez une validation qui vérifie les mots de passe
    // Si ce n'est pas le cas, ce test échouera ou devra être adapté
    
    // Soumettre le formulaire
    cy.get('button[type="submit"]').click()
    
    // Vérifier que nous ne sommes pas redirigés
    cy.url().should('include', '/auth/register')
  })

  it('permet de naviguer vers la page de connexion', () => {
    // Cliquer sur le lien de connexion
    cy.contains('Se connecter').click()
    
    // Vérifier que l'URL a changé
    cy.url().should('include', '/auth/login')
  })

  it('permet de revenir à l\'accueil', () => {
    // Cliquer sur le bouton de retour
    cy.contains('Retour à l\'accueil').click()
    
    // Vérifier que l'URL a changé
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  // Test utilisant la commande personnalisée
  it('s\'inscrit avec succès en utilisant la commande personnalisée', function() {
    const { validUser } = this.userData
    // Générer un email unique
    const uniqueEmail = `test-${Date.now()}@example.com`
    
    cy.register(validUser.firstName, validUser.lastName, uniqueEmail, validUser.password)
    cy.url().should('include', '/onboarding/step-1')
  })
})