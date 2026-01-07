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
  'verify-1': {
    name: 'Verification Product',
    price: 100,
    description: 'Testing the fix'
  },
  'verify-complex': {
    name: 'Product with \' Quotes',
    price: 99.99,
    description: 'Description with backslash \\ and single quote \' and double " quote.'
  }
};
