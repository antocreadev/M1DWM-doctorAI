// cypress/e2e/auth/login.cy.js

describe('Page de connexion', () => {
  beforeEach(() => {
    // Visiter la page de connexion avant chaque test
    cy.visit('/auth/login')
    
    // Chargement des fixtures
    cy.fixture('users').as('userData')
  })

  it('affiche correctement la page de connexion', () => {
    // Vérifier que les éléments principaux sont présents
    cy.get('h2').contains('Connexion').should('be.visible')
    cy.contains('Connectez-vous à votre compte MediAssist').should('be.visible')
    cy.get('input[id="email"]').should('be.visible')
    cy.get('input[id="password"]').should('be.visible')
    cy.get('button[type="submit"]').contains('Se connecter').should('be.visible')
    cy.contains('Mot de passe oublié?').should('be.visible')
    cy.contains("Vous n'avez pas de compte?").should('be.visible')
    cy.contains("S'inscrire").should('be.visible')
  })

  it('affiche un état de chargement pendant la soumission du formulaire', function() {
    // Utilisation des données de test
    const { validUser } = this.userData
    
    // Remplir et soumettre le formulaire
    cy.get('input[id="email"]').type(validUser.email)
    cy.get('input[id="password"]').type(validUser.password)
    cy.get('button[type="submit"]').click()
    
    // Vérifier que le bouton montre l'état de chargement
    cy.contains('Connexion en cours...').should('be.visible')
    
    // Attendre la redirection (dans ce cas vers le tableau de bord)
    cy.url().should('include', '/dashboard', { timeout: 10000 })
  })

  it('permet de naviguer vers la page d\'inscription', () => {
    // Cliquer sur le lien d'inscription
    cy.contains("S'inscrire").click()
    
    // Vérifier que l'URL a changé
    cy.url().should('include', '/auth/register')
  })

  it('permet de naviguer vers la page de récupération de mot de passe', () => {
    // Cliquer sur le lien "Mot de passe oublié?"
    cy.contains('Mot de passe oublié?').click()
    
    // Vérifier que l'URL a changé
    cy.url().should('include', '/auth/forgot-password')
  })

  it('permet de revenir à l\'accueil', () => {
    // Cliquer sur le bouton de retour
    cy.contains('Retour à l\'accueil').click()
    
    // Vérifier que l'URL a changé
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  // Test utilisant la commande personnalisée
  it('se connecte avec succès en utilisant la commande personnalisée', function() {
    const { validUser } = this.userData
    cy.login(validUser.email, validUser.password)
    cy.url().should('include', '/dashboard')
  })
})