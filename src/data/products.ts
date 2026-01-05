import type { Product } from '@/contexts/CartContext';

export interface CategoryConfig {
  id: string;
  label: string;
  description?: string;
  isDefault?: boolean;
}

export interface CustomProductRecord {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  coverImage: string;
  gallery: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductDataFile {
  categories: CategoryConfig[];
  customProducts: CustomProductRecord[];
  hiddenProductIds: string[];
}

export const LOCAL_OVERRIDES_STORAGE_KEY = 'diana-product-overrides';

export const productData: ProductDataFile = /*PRODUCT_DATA*/{
  "categories": [
    {
      "id": "homme",
      "label": "Parfums Homme",
      "isDefault": true
    },
    {
      "id": "femme",
      "label": "Parfums Femme",
      "isDefault": true
    },
    {
      "id": "mixte",
      "label": "Parfums Mixte",
      "isDefault": true
    },
    {
      "id": "skincare",
      "label": "Skincare",
      "isDefault": true
    }
  ],
  "customProducts": [],
  "hiddenProductIds": []
}/*END_PRODUCT_DATA*/;

export const mapCustomRecordToProduct = (record: CustomProductRecord): Product => ({
  id: record.id,
  name: record.name,
  price: record.price,
  image: record.coverImage,
  category: record.category,
  description: record.description,
  gallery: record.gallery,
  isCustom: true,
  sourceImage: record.coverImage.replace(/^\//, ''),
});

export const getCustomProducts = (): Product[] =>
  productData.customProducts.map(mapCustomRecordToProduct);

export const getHiddenProductIds = (): string[] => productData.hiddenProductIds;

export const getCategoriesConfig = (): CategoryConfig[] => productData.categories;

export const findCustomProductRecord = (productId: string) =>
  productData.customProducts.find(product => product.id === productId);

export const loadOverridesFromStorage = (): ProductDataFile | null => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_OVERRIDES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      customProducts: Array.isArray(parsed.customProducts) ? parsed.customProducts : [],
      hiddenProductIds: Array.isArray(parsed.hiddenProductIds) ? parsed.hiddenProductIds : [],
    };
  } catch {
    return null;
  }
};

export const getRuntimeCustomProducts = (): Product[] => {
  const overrides = loadOverridesFromStorage();
  if (!overrides || !Array.isArray(overrides.customProducts)) return [];
  return overrides.customProducts.map(mapCustomRecordToProduct);
};
