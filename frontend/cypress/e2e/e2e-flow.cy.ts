describe('End-to-End User Flow', () => {
  const testUser = {
    firstName: `Test${Date.now()}`,
    lastName: `User${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!'
  };

  it('should register, complete onboarding, login and use dashboard', () => {
    // 1. Inscription
    cy.visit('/auth/register');
    cy.get('[data-cy=firstName-input]').type(testUser.firstName);
    cy.get('[data-cy=lastName-input]').type(testUser.lastName);
    cy.get('[data-cy=email-input]').type(testUser.email);
    cy.get('[data-cy=password-input]').type(testUser.password);
    cy.get('[data-cy=confirmPassword-input]').type(testUser.password);
    cy.get('[data-cy=register-button]').click();
    
    // 2. Vérification du redirection vers onboarding
    cy.url().should('include', '/onboarding/step-1');
    
    // 3. Simulation de complétion des étapes d'onboarding
    // (Vous pouvez détailler les actions sur chaque page d'onboarding si nécessaire)
    cy.contains('Continuer').click();
    cy.url().should('include', '/onboarding/step-2');
    
    cy.contains('Continuer').click();
    cy.url().should('include', '/onboarding/step-3');
    
    cy.contains('Continuer').click();
    cy.url().should('include', '/onboarding/step-4');
    
    cy.contains('Commencer').click();
    
    // 4. Déconnexion pour tester la connexion
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
    });
    
    // 5. Connexion avec le compte créé
    cy.visit('/auth/login');
    cy.get('[data-cy=email-input]').type(testUser.email);
    cy.get('[data-cy=password-input]').type(testUser.password);
    cy.get('[data-cy=login-button]').click();
    
    // 6. Vérification accès au tableau de bord
    cy.url().should('include', '/dashboard');
    
    // 7. Test d'utilisation du tableau de bord
    cy.contains('Nouveau chat').click();
    cy.url().should('include', '/dashboard/new-chat');
  });
});
