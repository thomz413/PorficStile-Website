import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: ['es'],
    translations: {
      es: {
          "HomePage.header.title": "Hola {name}",
          "HomePage.header.subtitle": "Bienvenido a tu panel de administración",
          "HomePage.addWidget.title": "Agregar Widget",
          "HomePage.addWidget.button": "Agregar Widget",
          "global.home": "Pagina Principal",
          "global.content-manager": "Gestor de contenido",
      }
    }
    // Remove translations from here if they didn't work
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};