describe("Chat Feature Test", () => {
  beforeEach(() => {
    // Visiter d'abord la page login pour charger l'application
    cy.visit('/auth/login');
    
    // Simuler un utilisateur connecté
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'test-token-for-cypress');
    });
    
    // Naviguer vers la page de chat
    cy.visit("/dashboard/new-chat");
    
    // Gérer la redirection possible vers la page de login
    cy.url().then(url => {
      if (url.includes('/auth/login')) {
        // Si redirection vers login, se connecter
        cy.get('[data-cy=email-input]').type('test@example.com');
        cy.get('[data-cy=password-input]').type('Password123!');
        cy.get('[data-cy=login-button]').click();
        
        // Après connexion, revenir à la page de chat
        cy.visit("/dashboard/new-chat");
      }
    });
  });

  it("should display the new chat interface", () => {
    // Vérifier que nous sommes sur la bonne page
    cy.url().should('include', '/dashboard');
    
    // Vérifier la présence du titre de la page
    cy.contains("Nouvelle analyse").should("exist");
    
    // Vérifier la présence du formulaire d'envoi de messages
    cy.get("form").should("exist");
    cy.get("input").should("exist");
  });

  it("should allow sending a message", () => {
    const testMessage = "Ceci est un message de test";
    
    // Utiliser Input car c'est ce que le composant utilise
    cy.get("input[placeholder*='question']").type(testMessage);
    
    // Cliquer sur le bouton d'envoi qui contient l'icône Send
    cy.get("button[type='submit']").click();
    
    // Vérifier que le message a bien été ajouté à la conversation
    cy.contains(testMessage).should("exist");
  });
});
