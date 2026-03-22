import type { Schema, Struct } from '@strapi/strapi';

export interface HeroEstadistica extends Struct.ComponentSchema {
  collectionName: 'components_hero_estadisticas';
  info: {
    displayName: 'Estadistica';
    icon: 'eye';
  };
  attributes: {
    textoAbajo: Schema.Attribute.String;
    textoArriba: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'hero.estadistica': HeroEstadistica;
    }
  }
}
