// cypress.config.js pour un monorepo
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  // Spécifier explicitement les chemins dans un monorepo
  fixturesFolder: 'cypress/fixtures',
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  supportFolder: 'cypress/support',
  
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implémenter des event listeners ici si nécessaire
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
  },
})