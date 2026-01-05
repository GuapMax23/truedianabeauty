import type { Product } from '@/contexts/CartContext';
import { imagePaths } from './imagePaths';
import { getCustomProducts, getHiddenProductIds, getRuntimeCustomProducts } from './products';

export type SkincareSubcategory = 
  | 'cremes hydratantes'
  | 'masques visage'
  | 'nettoyants'
  | 'traitements';

export type SkincareSubSubcategory =
  | 'Crèmes visage'
  | 'Gels hydratants'
  | 'Huiles visage'
  | 'Masques de nuit'
  | 'Masques exfoliants'
  | 'Masques tissu'
  | 'Baumes démaquillants'
  | 'Eaux micellaires'
  | 'Huiles nettoyantes'
  | 'Lingettes nettoyantes & Démaquillants'
  | 'Nettoyants à base d\'eau'
  | 'Ampoules'
  | 'Essences'
  | 'Sérums'
  | 'Traitements des boutons';

interface SkincareImageInfo {
  path: string;
  subcategory: SkincareSubcategory;
  subSubcategory?: SkincareSubSubcategory;
}

// Parser les chemins d'images pour extraire les catégories
const parseImagePaths = (): SkincareImageInfo[] => {
  const skincareImages = imagePaths.skincare || [];
  
  return skincareImages.map(path => {
    // Format: "images/skincare/{subcategory}/{subSubcategory}/..."
    const parts = path.split('/');
    
    if (parts.length < 4) {
      // Pas de sous-catégorie ou sous-sous-catégorie
      return {
        path: '/' + path.replace(/\\/g, '/'),
        subcategory: 'cremes hydratantes', // Default
      };
    }
    
    const subcategory = parts[2] as SkincareSubcategory;
    const subSubcategory = parts[3] as SkincareSubSubcategory;
    
    return {
      path: '/' + path.replace(/\\/g, '/'),
      subcategory,
      subSubcategory,
    };
  });
};

// Créer des produits à partir des images
const buildSkincareProducts = (images: SkincareImageInfo[]): Product[] => {
  return images.map((img, index) => {
    const id = `skincare-${img.subcategory}-${img.subSubcategory || 'default'}-${index + 1}`;
    
    // Générer un nom basé sur la catégorie
    let name = 'Produit Skincare';
    if (img.subSubcategory) {
      name = `${img.subSubcategory} ${index + 1}`;
    } else if (img.subcategory) {
      name = `${img.subcategory} ${index + 1}`;
    }
    
    return {
      id,
      name,
      price: 0,
      image: img.path,
      category: 'skincare' as const,
      description: `Produit de soin de la peau - ${img.subcategory}${img.subSubcategory ? ` - ${img.subSubcategory}` : ''}`,
      subcategory: img.subcategory,
      subSubcategory: img.subSubcategory,
    };
  });
};

// Images parsées et produits
const parsedImages = parseImagePaths();
const hiddenProductIds = new Set(getHiddenProductIds());
const baseSkincareProducts = buildSkincareProducts(parsedImages).filter(
  product => !hiddenProductIds.has(product.id)
);
const runtimeCustomSkincare = getRuntimeCustomProducts().filter(
  product => product.category === 'skincare' && !hiddenProductIds.has(product.id)
);
const customSkincareProducts = getCustomProducts()
  .filter(product => product.category === 'skincare' && !hiddenProductIds.has(product.id))
  .concat(runtimeCustomSkincare);
const allSkincareProducts = [...customSkincareProducts, ...baseSkincareProducts];

console.log(`[SkincareCatalog] Images parsées: ${parsedImages.length}`);
console.log(`[SkincareCatalog] Produits créés: ${allSkincareProducts.length}`);

// Fonction principale pour obtenir les produits skincare
export const getSkincareProducts = (
  subcategory?: SkincareSubcategory,
  subSubcategory?: SkincareSubSubcategory
): Product[] => {
  let filtered = allSkincareProducts;
  
  if (subcategory) {
    filtered = filtered.filter(p => p.subcategory === subcategory);
  }
  
  if (subSubcategory) {
    filtered = filtered.filter(p => p.subSubcategory === subSubcategory);
  }
  
  return filtered;
};

// Obtenir toutes les sous-catégories disponibles
export const getSkincareSubcategories = (): SkincareSubcategory[] => {
  const subcategories = new Set<SkincareSubcategory>();
  parsedImages.forEach(img => {
    if (img.subcategory) {
      subcategories.add(img.subcategory);
    }
  });
  return Array.from(subcategories);
};

// Obtenir toutes les sous-sous-catégories disponibles
export const getSkincareSubSubcategories = (
  subcategory?: SkincareSubcategory
): SkincareSubSubcategory[] => {
  const subSubcategories = new Set<SkincareSubSubcategory>();
  
  parsedImages.forEach(img => {
    if (img.subSubcategory) {
      if (!subcategory || img.subcategory === subcategory) {
        subSubcategories.add(img.subSubcategory);
      }
    }
  });
  
  return Array.from(subSubcategories);
};
