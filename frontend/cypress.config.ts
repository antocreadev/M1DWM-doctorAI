import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // Augmenter les délais pour rendre les tests plus stables
    defaultCommandTimeout: 10000, // 10 secondes au lieu des 4 par défaut
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false, // Désactiver les vidéos pour accélérer les tests
  },
});
