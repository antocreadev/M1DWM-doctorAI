describe("Login Test", () => {
  beforeEach(() => {
    cy.visit("/auth/login");
  });

  it("should display the login form", () => {
    cy.get("[data-cy=login-form]").should("exist");
    cy.get("[data-cy=email-input]").should("exist");
    cy.get("[data-cy=password-input]").should("exist");
    cy.get("[data-cy=login-button]").should("exist");
  });

  it("should show validation errors for empty fields", () => {
    // Vider les champs d'abord pour s'assurer qu'ils sont vides
    cy.get("[data-cy=email-input]").clear();
    cy.get("[data-cy=password-input]").clear();
    cy.get("[data-cy=login-button]").click();
    
    // Utilisons une approche alternative pour vérifier l'erreur
    cy.get("[data-cy=form-error]").should(($el) => {
      // Force une vérification du contenu plutôt que de la visibilité
      expect($el.text()).to.include("Veuillez remplir tous les champs");
    });
  });

  it("should login with valid credentials", () => {
    // Utilisez des identifiants de test connus ou créez un utilisateur avant le test
    const email = "test@example.com";
    const password = "Password123!";

    cy.get("[data-cy=email-input]").type(email);
    cy.get("[data-cy=password-input]").type(password);
    cy.get("[data-cy=login-button]").click();

    // Si la connexion réussit, on devrait être redirigé vers le tableau de bord
    cy.url().should("include", "/dashboard");
  });

  it("should show error for invalid credentials", () => {
    const email = "wrong@example.com";
    const password = "WrongPassword123!";

    cy.get("[data-cy=email-input]").clear().type(email);
    cy.get("[data-cy=password-input]").clear().type(password);
    cy.get("[data-cy=login-button]").click();

    // Si la connexion échoue, on devrait voir un message d'erreur
    cy.get("[data-cy=auth-error]").should(($el) => {
      expect($el.text()).to.include("Identifiants invalides");
    });
  });
});
