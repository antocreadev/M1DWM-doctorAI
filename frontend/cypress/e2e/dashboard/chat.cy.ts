describe('Chat Feature Test', () => {
  beforeEach(() => {
    // Se connecter en définissant un token
    cy.setAuthToken();
    cy.visit('/dashboard/new-chat');
  });

  it('should display the new chat interface', () => {
    cy.contains('Nouvelle conversation').should('be.visible');
    cy.get('textarea').should('exist');
  });

  it('should allow sending a message', () => {
    const testMessage = 'Ceci est un message de test';
    cy.get('textarea').type(testMessage);
    cy.contains('Envoyer').click();
    
    // Vérifie que le message a été envoyé et affiché
    cy.contains(testMessage).should('be.visible');
  });
});
