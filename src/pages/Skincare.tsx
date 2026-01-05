import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { 
  getSkincareProducts, 
  getSkincareSubcategories, 
  getSkincareSubSubcategories,
  type SkincareSubcategory,
  type SkincareSubSubcategory 
} from '@/data/skincareCatalog';

// Test immédiat pour voir si le module est chargé
console.log('[Skincare Page] ⚡ Import du module skincareCatalog réussi');
try {
  const testProducts = getSkincareProducts();
  console.log('[Skincare Page] ✅ getSkincareProducts() fonctionne:', testProducts.length, 'produits');
} catch (error) {
  console.error('[Skincare Page] ❌ Erreur avec getSkincareProducts():', error);
}
import { isSupabaseConfigured } from '@/lib/supabase';

const Skincare = () => {
  console.log('[Skincare Component] ⚡ Composant Skincare rendu');
  
  const [selectedSubcategory, setSelectedSubcategory] = useState<SkincareSubcategory | 'all'>('all');
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState<SkincareSubSubcategory | 'all'>('all');

  const { data: remoteProducts = [], isLoading } = useProducts({ 
    category: 'skincare',
    subcategory: selectedSubcategory !== 'all' ? selectedSubcategory : undefined,
    subSubcategory: selectedSubSubcategory !== 'all' ? selectedSubSubcategory : undefined,
  });
  
  // Utiliser les produits locaux si Supabase n'est pas configuré ou si aucun produit distant n'est trouvé
  const localProducts = useMemo(() => {
    console.log('[Skincare] ⚡ useMemo localProducts appelé');
    let products;
    try {
      if (selectedSubcategory === 'all') {
        products = getSkincareProducts();
      } else if (selectedSubSubcategory === 'all') {
        products = getSkincareProducts(selectedSubcategory);
      } else {
        products = getSkincareProducts(selectedSubcategory, selectedSubSubcategory);
      }
      console.log(`[Skincare] ✅ Produits locaux chargés: ${products.length}`, { 
        selectedSubcategory, 
        selectedSubSubcategory,
        firstProduct: products[0] 
      });
    } catch (error) {
      console.error('[Skincare] ❌ Erreur lors du chargement des produits locaux:', error);
      products = [];
    }
    return products;
  }, [selectedSubcategory, selectedSubSubcategory]);

  const products = useMemo(() => {
    // TOUJOURS utiliser les produits locaux du dossier skincare en priorité
    // Les produits locaux contiennent toutes les images du dossier skincare/
    if (localProducts.length > 0) {
      console.log(`[Skincare] Utilisation de ${localProducts.length} produits locaux du dossier skincare`, {
        selectedSubcategory,
        selectedSubSubcategory,
        firstProduct: localProducts[0],
      });
      return localProducts;
    }
    
    // Fallback : si aucun produit local, utiliser les produits distants (si disponibles)
    if (isSupabaseConfigured && remoteProducts.length > 0) {
      const remote = remoteProducts
        .filter(p => {
          if (selectedSubcategory !== 'all' && p.subcategory !== selectedSubcategory) return false;
          if (selectedSubSubcategory !== 'all' && p.subSubcategory !== selectedSubSubcategory) return false;
          return true;
        })
        .map(p => ({ ...p, id: p._id || p.id }));
      
      if (remote.length > 0) {
        console.log(`[Skincare] Fallback: Utilisation de ${remote.length} produits distants`);
        return remote;
      }
    }
    
    console.warn(`[Skincare] Aucun produit trouvé!`, {
      localProductsCount: localProducts.length,
      remoteProductsCount: remoteProducts.length,
    });
    return [];
  }, [remoteProducts, localProducts, selectedSubcategory, selectedSubSubcategory, isSupabaseConfigured]);

  const subcategories = getSkincareSubcategories();
  const availableSubSubcategories = useMemo(() => {
    if (selectedSubcategory === 'all') {
      return getSkincareSubSubcategories();
    }
    return getSkincareSubSubcategories(selectedSubcategory);
  }, [selectedSubcategory]);

  const handleSubcategoryChange = (subcategory: SkincareSubcategory | 'all') => {
    setSelectedSubcategory(subcategory);
    setSelectedSubSubcategory('all'); // Reset sub-subcategory when changing subcategory
  };

  // Log au chargement du composant
  console.log(`[Skincare Component] Composant rendu`, {
    localProductsCount: localProducts.length,
    remoteProductsCount: remoteProducts.length,
    productsCount: products.length,
    selectedSubcategory,
    selectedSubSubcategory,
  });

  return (
    <>
      <Header />
      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gold mb-4">
              Collection Skincare
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Des soins de luxe pour sublimer votre peau avec des actifs naturels puissants
            </p>
            {/* Message de débogage visible */}
            {localProducts.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  ⚠️ Aucun produit local chargé. Vérifiez la console (F12) pour les détails.
                </p>
              </div>
            )}
          </div>

          {/* Filtres par sous-catégories */}
          <div className="mb-8 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Sous-catégories</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedSubcategory === 'all' ? 'default' : 'outline'}
                  onClick={() => handleSubcategoryChange('all')}
                  className="capitalize"
                >
                  Toutes
                </Button>
                {subcategories.map((subcat) => (
                  <Button
                    key={subcat}
                    variant={selectedSubcategory === subcat ? 'default' : 'outline'}
                    onClick={() => handleSubcategoryChange(subcat)}
                    className="capitalize"
                  >
                    {subcat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filtres par sous-sous-catégories */}
            {selectedSubcategory !== 'all' && availableSubSubcategories.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Sous-sous-catégories</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedSubSubcategory === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedSubSubcategory('all')}
                  >
                    Toutes
                  </Button>
                  {availableSubSubcategories.map((subSubcat) => (
                    <Button
                      key={subSubcat}
                      variant={selectedSubSubcategory === subSubcat ? 'default' : 'outline'}
                      onClick={() => setSelectedSubSubcategory(subSubcat)}
                    >
                      {subSubcat}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 bg-card rounded-lg border border-gold/20">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="font-display font-semibold text-gold mb-2">
                Résultats Visibles
              </h3>
              <p className="text-sm text-muted-foreground">
                Des actifs concentrés pour une efficacité prouvée
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg border border-gold/20">
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="font-display font-semibold text-gold mb-2">
                Ingrédients Naturels
              </h3>
              <p className="text-sm text-muted-foreground">
                Formules enrichies en extraits botaniques
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg border border-gold/20">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="font-display font-semibold text-gold mb-2">
                Luxe & Qualité
              </h3>
              <p className="text-sm text-muted-foreground">
                Des textures premium pour un rituel beauté d'exception
              </p>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement des produits...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-muted-foreground text-lg">Aucun produit trouvé dans cette catégorie.</p>
              <div className="bg-card p-4 rounded-lg border border-gold/20 max-w-2xl mx-auto text-left">
                <p className="text-sm text-muted-foreground mb-2">Informations de débogage:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Produits locaux: {localProducts.length}</li>
                  <li>• Produits distants: {remoteProducts.length}</li>
                  <li>• Sous-catégorie sélectionnée: {selectedSubcategory}</li>
                  <li>• Sous-sous-catégorie sélectionnée: {selectedSubSubcategory}</li>
                  <li>• Vérifiez la console (F12) pour plus de détails</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
                </p>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            </>
          )}

          {/* Skincare Tips */}
          <div className="mt-20 bg-card rounded-lg p-8 border border-gold/20">
            <h2 className="font-display text-3xl font-bold text-gold mb-6 text-center">
              Conseils Skincare
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  ☀️ Routine du Matin
                </h4>
                <p>
                  Nettoyez, appliquez votre sérum, puis votre crème hydratante.
                  N'oubliez pas la protection solaire.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  🌙 Routine du Soir
                </h4>
                <p>
                  Démaquillez en profondeur, nettoyez, puis appliquez vos soins
                  anti-âge et régénérants.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Skincare;
