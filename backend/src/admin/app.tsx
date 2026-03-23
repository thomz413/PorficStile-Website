import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: ['es'],
    // Remove translations from here if they didn't work
  },
  // Try placing it here
  translations: {
    es: {
      "app.components.HomePage.welcome.title": "¡Hola!",
      "app.components.HomePage.welcome.subtitle": "Bienvenido al panel de administración",
      "global.last-edited-entries": "Entradas editadas recientemente",
      "app.components.LeftMenu.navbrand.title": "Panel de Atlantis",
    },
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};