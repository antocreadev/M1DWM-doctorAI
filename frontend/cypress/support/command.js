// cypress/support/commands.js

// Commande personnalisée pour la connexion
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/auth/login')
  cy.get('input[id="email"]').type(email)
  cy.get('input[id="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

// Commande personnalisée pour l'inscription
Cypress.Commands.add('register', (firstName, lastName, email, password) => {
  cy.visit('/auth/register')
  cy.get('input[id="firstName"]').type(firstName)
  cy.get('input[id="lastName"]').type(lastName)
  cy.get('input[id="email"]').type(email)
  cy.get('input[id="password"]').type(password)
  cy.get('input[id="confirmPassword"]').type(password)
  cy.get('button[type="submit"]').click()
})