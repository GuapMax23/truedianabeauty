import type { Product } from '@/contexts/CartContext';

export interface ProductOverride extends Partial<Product> {
  price?: number;
}

/**
 * Surcharge facultative pour personnaliser les informations produits.
 * - La clé correspond à l'ID généré automatiquement (`homme-1`, `femme-3`, etc.)
 * - Remplissez uniquement les champs que vous souhaitez remplacer.
 */
export const productOverrides: Record<string, ProductOverride> = {
  'homme-1': {
    name: 'Voux Violette - Emir',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-15': {
    name: 'Barakkat Satin Oud - Fragrance World',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-8': {
    name: 'Your Touch Amber - Maison Alhambra',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-2': {
    name: 'Taskeen Lactea Divina - Paris Corner',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-4': {
    name: 'Jean Lowe Maître - Maison Alhambra - Eau de Parfum Mixte 100ml',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-7': {
    name: 'Montaigne Coco - Maison Alhambra',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-5': {
    name: 'Salvo - Maison Alhambra',
    price: 25000,
    description: 'Eau de Parfum Homme 100ml'
  },
  'homme-9': {
    name: 'Lueur d’Espoir Memories of Summer - Emir',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-10': {
    name: 'Fire On Ice – Lattafa',
    price: 25000,
    description: 'Eau de parfum Mixte 110ml'
  },
  'homme-11': {
    name: 'Habik For Men - Lattafa',
    price: 25000,
    description: 'Eau de parfum Homme 100ml'
  },
  'homme-12': {
    name: 'Jean Lowe Vibe - Maison Alhambra',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-13': {
    name: 'Essence De Blanc - French Avenue',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-18': {
    name: 'Marshmallow Blush - Paris Corner',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-20': {
    name: 'Azzure Aoud - French Avenue',
    price: 25000,
    description: 'Eau de Parfum Homme 100ml'
  },
  'homme-21': {
    name: 'Pinnace - French Avenue',
    price: 25000,
    description: 'Eau de Parfum Homme 100ml'
  },
  'homme-22': {
    name: 'Zenith Vanilla - French Avenue',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-23': {
    name: 'Your Touch Amber - Maison Alhambra',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-24': {
    name: 'Mazaaj Infused - Zimaya',
    price: 25000,
    description: 'Eau de Parfum Homme 100ml'
  },
  'homme-25': {
    name: 'Tiramisu Coco - Zimaya',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-27': {
    name: '9 PM Elixir - Afnan',
    price: 25000,
    description: 'Extrait de Parfum Mixte 100ml'
  },
  'homme-29': {
    name: 'Voux Zeste - Emir',
    price: 25000,
    description: 'Eau de Parfum Mixte 100 ml'
  },
  'homme-32': {
    name: ' Lueur d’Espoir Memories of Summer - Emir',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-35': {
    name: 'Mango Punch - Emir',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-37': {
    name: 'Chaos Extrait - French Avenue',
    price: 25000,
    description: 'Extrait de Parfum Mixte 100ml'
  },
  'homme-14': {
    name: 'Dynasty - Lattafa',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-16': {
    name: 'Eclaire Banoffi - Lattafa',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-17': {
    name: 'Eclaire Pistache - Lattafa',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-31': {
    name: 'Mayar Cherry Intense - Lattafa',
    price: 25000,
    description: 'Eau De Parfum Mixte 100ml'
  },
  'homme-38': {
    name: 'Amber Oud Aqua Dubai - Al Haramain - Extrait de Parfum Mixte 75ml',
    price: 20000,
    description: 'Extrait de Parfum Mixte 75ml'
  },
  'homme-39': {
    name: '9 AM Dive - Afnan',
    price: 25000,
    description: 'Eau de Parfum Mixte 100ml'
  },
  'homme-19': {
    name: 'jjyotyi',
    price: 34567,
    description: 'Ajoutez une description dans productOverrides.ts'
  }
};
