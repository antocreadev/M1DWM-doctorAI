// cypress/support/e2e.ts
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      register(firstName: string, lastName: string, email: string, password: string): Chainable<void>;
      setAuthToken(token?: string): Chainable<void>;
      completeOnboarding(): Chainable<void>;
    }
  }
}

// Commande pour se connecter
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/auth/login');
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=login-button]').click();
});

// Commande pour s'inscrire
Cypress.Commands.add('register', (firstName, lastName, email, password) => {
  cy.visit('/auth/register');
  cy.get('[data-cy=firstName-input]').type(firstName);
  cy.get('[data-cy=lastName-input]').type(lastName);
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=confirmPassword-input]').type(password);
  cy.get('[data-cy=register-button]').click();
});

// Commande pour définir un token d'authentification
Cypress.Commands.add('setAuthToken', (token = 'fake-test-token') => {
  cy.window().then((win) => {
    win.localStorage.setItem('token', token);
  });
});

// Commande pour compléter le processus d'onboarding
Cypress.Commands.add('completeOnboarding', () => {
  cy.visit('/onboarding/step-1');
  cy.contains('Continuer').click();
  
  cy.url().should('include', '/onboarding/step-2');
  cy.contains('Continuer').click();
  
  cy.url().should('include', '/onboarding/step-3');
  cy.contains('Continuer').click();
  
  cy.url().should('include', '/onboarding/step-4');
  cy.contains('Commencer').click();
});

export {};
