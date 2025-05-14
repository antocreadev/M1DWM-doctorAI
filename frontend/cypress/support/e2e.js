// cypress/support/e2e.js

// Import des commandes personnalisées
import './commands'

// Désactiver les logs de requêtes XHR pour une meilleur lisibilité
// Décommentez si nécessaire
// const app = window.top;
// if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
//   const style = app.document.createElement('style');
//   style.innerHTML =
//     '.command-name-request, .command-name-xhr { display: none }';
//   style.setAttribute('data-hide-command-log-request', '');
//   app.document.head.appendChild(style);
// }

// Personnaliser la façon dont Cypress affiche les captures d'écran lorsqu'un test échoue
Cypress.Screenshot.defaults({
  screenshotOnRunFailure: true,
})