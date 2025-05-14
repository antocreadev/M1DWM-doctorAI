describe('Dashboard Test', () => {
  beforeEach(() => {
    // On simule un utilisateur déjà connecté en définissant un token dans localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-test-token');
    });
    cy.visit('/dashboard');
  });

  it('should display dashboard components when logged in', () => {
    // Vérifie que les éléments principaux du tableau de bord sont présents
    cy.get('h1').should('contain', 'Tableau de bord');
    cy.get('nav').should('exist');
  });

  it('should navigate to different dashboard sections', () => {
    // Teste la navigation entre les différentes sections du tableau de bord
    cy.contains('Nouveau chat').click();
    cy.url().should('include', '/dashboard/new-chat');
    
    cy.contains('Documents').click();
    cy.url().should('include', '/dashboard/documents');
    
    cy.contains('Profil').click();
    cy.url().should('include', '/dashboard/profile');
    
    cy.contains('Paramètres').click();
    cy.url().should('include', '/dashboard/settings');
  });
});
