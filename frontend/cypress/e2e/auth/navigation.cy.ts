describe("Auth Navigation Test", () => {
  it("should navigate from login to register page", () => {
    cy.visit("/auth/login");
    cy.contains("S'inscrire").click();
    cy.url().should("include", "/auth/register");
    cy.get("[data-cy=register-form]").should("exist");
  });

  it("should navigate from register to login page", () => {
    cy.visit("/auth/register");
    cy.contains("Se connecter").click();
    cy.url().should("include", "/auth/login");
    cy.get("[data-cy=login-form]").should("exist");
  });
});
