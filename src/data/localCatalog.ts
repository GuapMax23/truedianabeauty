import type { Product } from '@/contexts/CartContext';
import { productOverrides } from './productOverrides';
import { imagePaths } from './imagePaths';
import {
  getCustomProducts,
  getHiddenProductIds,
  loadOverridesFromStorage,
  mapCustomRecordToProduct,
} from './products';

type LocalCategory = Product['category'];

const buildProducts = (params: {
  images: string[];
  category: LocalCategory;
  descriptionFallback: string;
}): Product[] => {
  const { images, category, descriptionFallback } = params;

  return images.map((image, index) => {
    const id = `${category}-${index + 1}`;

    const baseProduct: Product = {
      id,
      name: `${category === 'homme' ? 'Parfum Homme' : 'Parfum Femme'} ${index + 1}`,
      price: 0,
      image,
      category,
      description: descriptionFallback,
    };

    const override = productOverrides[id];

    const gallery = Array.isArray(override?.gallery) ? override.gallery : undefined;

    return {
      ...baseProduct,
      ...override,
      name: override?.name ?? baseProduct.name,
      price: override?.price ?? baseProduct.price,
      description: override?.description ?? baseProduct.description,
      gallery,
      sourceImage: override?.sourceImage ?? image.replace(/^\//, ''),
    };
  });
};

// Utiliser les chemins générés par le script
const femmeImages = imagePaths['Parfum Femme'].map(path => '/' + path.replace(/\\/g, '/'));
const hommeImages = imagePaths['Parfum Homme'].map(path => '/' + path.replace(/\\/g, '/'));

console.log(`[LocalCatalog] Images chargées:`, {
  femme: femmeImages.length,
  homme: hommeImages.length,
  total: femmeImages.length + hommeImages.length,
});

export const localCatalog = {
  femme: buildProducts({
    images: femmeImages,
    category: 'femme',
    descriptionFallback: 'Ajoutez une description dans productOverrides.ts',
  }),
  homme: buildProducts({
    images: hommeImages,
    category: 'homme',
    descriptionFallback: 'Ajoutez une description dans productOverrides.ts',
  }),
};

console.log(`[LocalCatalog] Produits créés:`, {
  femme: localCatalog.femme.length,
  homme: localCatalog.homme.length,
  total: localCatalog.femme.length + localCatalog.homme.length,
});

const rawBaseProducts: Product[] = [...localCatalog.homme, ...localCatalog.femme];

const buildCombinedProducts = (): Product[] => {
  const overrides = loadOverridesFromStorage();
  const hiddenIds = new Set([
    ...getHiddenProductIds(),
    ...(overrides?.hiddenProductIds ?? []),
  ]);

  const runtimeCustoms =
    overrides?.customProducts?.map(mapCustomRecordToProduct) ?? [];

  const staticCustoms = getCustomProducts();

  const customProducts = [...runtimeCustoms, ...staticCustoms].filter(
    product => !hiddenIds.has(product.id)
  );

  const baseProducts = rawBaseProducts.filter(product => !hiddenIds.has(product.id));

  return [...customProducts, ...baseProducts];
};

export const getAllBaseProducts = (): Product[] => rawBaseProducts;

export const getLocalProducts = (category?: LocalCategory): Product[] => {
  const combinedProducts = buildCombinedProducts();
  if (!category) return combinedProducts;
  return combinedProducts.filter(product => product.category === category);
};

export const getLocalCoverImage = (category: LocalCategory): string => {
  return getLocalProducts(category)[0]?.image ?? '';
};

