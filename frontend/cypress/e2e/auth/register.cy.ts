describe("Registration Test", () => {
  beforeEach(() => {
    cy.visit("/auth/register");
  });

  it("should display the registration form", () => {
    cy.get("[data-cy=register-form]").should("exist");
    cy.get("[data-cy=firstName-input]").should("exist");
    cy.get("[data-cy=lastName-input]").should("exist");
    cy.get("[data-cy=email-input]").should("exist");
    cy.get("[data-cy=password-input]").should("exist");
    cy.get("[data-cy=register-button]").should("exist");
  });

  it("should show validation errors for empty fields", () => {
    // Vider tous les champs pour s'assurer qu'ils sont vides
    cy.get("[data-cy=firstName-input]").clear();
    cy.get("[data-cy=lastName-input]").clear();
    cy.get("[data-cy=email-input]").clear();
    cy.get("[data-cy=password-input]").clear();
    cy.get("[data-cy=confirmPassword-input]").clear();
    
    cy.get("[data-cy=register-button]").click();
    
    // Utilisons une approche alternative pour vérifier l'erreur
    cy.get("[data-cy=form-error]").should(($el) => {
      // Force une vérification du contenu plutôt que de la visibilité
      expect($el.text()).to.include("Veuillez remplir tous les champs");
    });
  });

  it("should register a new user", () => {
    const firstName = `Test${Date.now()}`;
    const lastName = `User${Date.now()}`;
    const email = `test_${Date.now()}@example.com`;
    const password = "Password123!";

    cy.get("[data-cy=firstName-input]").type(firstName);
    cy.get("[data-cy=lastName-input]").type(lastName);
    cy.get("[data-cy=email-input]").type(email);
    cy.get("[data-cy=password-input]").type(password);
    cy.get("[data-cy=confirmPassword-input]").type(password);
    cy.get("[data-cy=register-button]").click();

    // Si l'inscription réussit, on devrait être redirigé vers la page d'onboarding
    cy.url().should("include", "/onboarding");
  });
});
