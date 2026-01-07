import { useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { getLocalProducts } from '@/data/localCatalog';

const Parfums = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'homme' | 'femme' | 'mixte'>('all');

  const categories = [
    { value: 'all' as const, label: 'Tous' },
    { value: 'homme' as const, label: 'Homme' },
    { value: 'femme' as const, label: 'Femme' },
    { value: 'mixte' as const, label: 'Mixte' },
  ];

  const { data: allProducts = [], isLoading } = useProducts(
    selectedCategory === 'all' ? undefined : { category: selectedCategory }
  );

  const remoteProducts = allProducts
    .filter(p => p.category !== 'skincare')
    .map(p => ({ ...p, id: p._id || p.id }));

  // TOUJOURS utiliser les produits locaux en priorité (images du dossier Parfum Homme/Femme)
  const localProducts = useMemo(() => {
    // On ne veut que les parfums ici, donc on exclut explicitement le skincare
    const products = getLocalProducts().filter(p => p.category !== 'skincare');
    console.log(`[Parfums] Produits locaux chargés: ${products.length}`, {
      homme: products.filter(p => p.category === 'homme').length,
      femme: products.filter(p => p.category === 'femme').length,
    });
    return products;
  }, []);

  // Utiliser les produits locaux en priorité, fallback sur les produits distants si disponibles
  const dataSource = localProducts.length > 0 ? localProducts : remoteProducts;

  const filteredProducts =
    selectedCategory === 'all'
      ? dataSource
      : dataSource.filter(p => p.category === selectedCategory);

  console.log(`[Parfums] Produits affichés: ${filteredProducts.length}`, {
    selectedCategory,
    source: localProducts.length > 0 ? 'local' : 'remote',
  });

  return (
    <>
      <Header />
      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gold mb-4">
              Collection Parfums
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez notre sélection exclusive de parfums de luxe pour homme, femme et mixte
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map(cat => (
              <Button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                className={
                  selectedCategory === cat.value
                    ? 'bg-gold hover:bg-gold-light text-primary'
                    : 'border-gold/50 hover:bg-gold/10'
                }
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Parfums;
