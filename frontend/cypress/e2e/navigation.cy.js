// cypress/e2e/navigation.cy.js

describe('Navigation entre les pages d\'authentification', () => {
  it('navigue de l\'accueil vers la page de connexion', () => {
    cy.visit('/')
    // Supposons qu'il y a un lien ou un bouton "Se connecter" sur la page d'accueil
    // Ajustez ce sélecteur en fonction de votre implémentation réelle
    cy.get('a[href="/auth/login"]').click()
    cy.url().should('include', '/auth/login')
  })

  it('navigue de l\'accueil vers la page d\'inscription', () => {
    cy.visit('/')
    // Supposons qu'il y a un lien ou un bouton "S'inscrire" sur la page d'accueil
    // Ajustez ce sélecteur en fonction de votre implémentation réelle
    cy.get('a[href="/auth/register"]').click()
    cy.url().should('include', '/auth/register')
  })

  it('navigating de la page de connexion vers la page d\'inscription', () => {
    cy.visit('/auth/login')
    cy.contains("S'inscrire").click()
    cy.url().should('include', '/auth/register')
  })

  it('navigating de la page d\'inscription vers la page de connexion', () => {
    cy.visit('/auth/register')
    cy.contains('Se connecter').click()
    cy.url().should('include', '/auth/login')
  })

  it('permet de revenir à l\'accueil depuis la page de connexion', () => {
    cy.visit('/auth/login')
    cy.contains('Retour à l\'accueil').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('permet de revenir à l\'accueil depuis la page d\'inscription', () => {
    cy.visit('/auth/register')
    cy.contains('Retour à l\'accueil').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})