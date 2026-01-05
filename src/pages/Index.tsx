import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductSlider } from '@/components/ProductSlider';
import { Footer } from '@/components/Footer';
import { useProducts } from '@/hooks/useProducts';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logoWatermark from '@/assets/logo-watermark.png';
import { getImageUrl } from '@/lib/api';
import { getLocalProducts, getLocalCoverImage } from '@/data/localCatalog';
import { getSkincareProducts } from '@/data/skincareCatalog';

const Index = () => {
  const { data: allProducts = [], isLoading } = useProducts({ featured: true, limit: 6 });
  const { data: hommeProducts = [] } = useProducts({ category: 'homme', limit: 3 });
  const { data: femmeProducts = [] } = useProducts({ category: 'femme', limit: 3 });
  const { data: skincareProducts = [] } = useProducts({ category: 'skincare', limit: 1 });

  // Charger les produits skincare locaux
  const localSkincareProducts = getSkincareProducts();

  // Normaliser les produits pour avoir un id cohérent
  const bestSellers = allProducts.map(p => ({ ...p, id: p._id || p.id }));
  const parfumsHomme = hommeProducts.map(p => ({ ...p, id: p._id || p.id }));
  const parfumsFemme = femmeProducts.map(p => ({ ...p, id: p._id || p.id }));
  const skincare = skincareProducts.map(p => ({ ...p, id: p._id || p.id }));
  // TOUJOURS utiliser les produits locaux en priorité (images des dossiers)
  const localCatalogProducts = getLocalProducts();
  const localHommeProducts = localCatalogProducts.filter(p => p.category === 'homme');
  const localFemmeProducts = localCatalogProducts.filter(p => p.category === 'femme');

  // Utiliser les produits locaux si disponibles, sinon les produits distants
  const displayBestSellers = localCatalogProducts.length > 0
    ? localCatalogProducts.slice(0, 6)
    : bestSellers;

  const hommeCoverImage = localHommeProducts[0]
    ? getImageUrl(localHommeProducts[0].image)
    : (parfumsHomme[0] ? getImageUrl(parfumsHomme[0].image) : getLocalCoverImage('homme'));

  const femmeCoverImage = localFemmeProducts[0]
    ? getImageUrl(localFemmeProducts[0].image)
    : (parfumsFemme[0] ? getImageUrl(parfumsFemme[0].image) : getLocalCoverImage('femme'));

  console.log(`[Index] Produits locaux utilisés:`, {
    total: localCatalogProducts.length,
    homme: localHommeProducts.length,
    femme: localFemmeProducts.length,
  });
  return <>
    <Header />
    <Hero />

    {/* Best Sellers Section */}
    <section id="bestsellers" className="relative bg-background overflow-hidden">

      <ProductSlider products={displayBestSellers} title="Best-Sellers" />
    </section>

    {/* Categories Section */}
    <section className="relative py-20 bg-gradient-to-b from-background to-card/50 overflow-hidden">


      <div className="container mx-auto px-4 relative z-10">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-16 text-gold">
          Nos Collections
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Link to="/parfums" className="group relative aspect-square rounded-lg overflow-hidden hover-glow">
            <img src={hommeCoverImage} alt="Parfums Homme" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex items-end justify-center pb-8">
              <h3 className="font-display text-3xl font-bold text-gold">
                Parfums Homme
              </h3>
            </div>
          </Link>

          <Link to="/parfums" className="group relative aspect-square rounded-lg overflow-hidden hover-glow">
            <img src={femmeCoverImage} alt="Parfums Femme" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex items-end justify-center pb-8">
              <h3 className="font-display text-3xl font-bold text-gold">
                Parfums Femme
              </h3>
            </div>
          </Link>

          <Link to="/skincare" className="group relative aspect-square rounded-lg overflow-hidden hover-glow">
            <img
              src={
                localSkincareProducts[0]
                  ? getImageUrl(localSkincareProducts[0].image)
                  : (skincare[0] ? getImageUrl(skincare[0].image) : '/placeholder.svg')
              }
              alt="Skincare"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex items-end justify-center pb-8">
              <h3 className="font-display text-3xl font-bold text-gold">
                Skincare Premium
              </h3>
            </div>
          </Link>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section id="about" className="relative py-20 bg-card overflow-hidden">


      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gold mb-6">
            Pourquoi nous ?
          </h2>
          <p className="text-muted-foreground text-lg mb-12">
            Votre destination premium pour les parfums de luxe et soins de la peau au Bénin
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 bg-background/80 backdrop-blur-sm rounded-lg border border-burgundy/20 hover:border-burgundy/40 transition-colors">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-display font-semibold text-burgundy-light mb-2">
                100% Authentique
              </h3>
              <p className="text-sm text-muted-foreground">
                Certificat d'authenticité fourni
              </p>
            </div>

            <div className="p-6 bg-background/80 backdrop-blur-sm rounded-lg border border-burgundy/20 hover:border-burgundy/40 transition-colors">
              <div className="text-4xl mb-3">🚚</div>
              <h3 className="font-display font-semibold text-burgundy-light mb-2">
                Livraison Rapide
              </h3>
              <p className="text-sm text-muted-foreground">
                24-48h dans tout le Bénin
              </p>
            </div>

            <div className="p-6 bg-background/80 backdrop-blur-sm rounded-lg border border-burgundy/20 hover:border-burgundy/40 transition-colors">
              <div className="text-4xl mb-3">💝</div>
              <h3 className="font-display font-semibold text-burgundy-light mb-2">
                Cadeaux Premium
              </h3>
              <p className="text-sm text-muted-foreground">
                Emballage luxueux offert
              </p>
            </div>

            <div className="p-6 bg-background/80 backdrop-blur-sm rounded-lg border border-burgundy/20 hover:border-burgundy/40 transition-colors">
              <div className="text-4xl mb-3">🔄</div>
              <h3 className="font-display font-semibold text-burgundy-light mb-2">
                Retour Facile
              </h3>
              <p className="text-sm text-muted-foreground">
                Sous 7 jours
              </p>
            </div>
          </div>

          <div className="mt-12">
            <Link to="/about">
              <Button className="bg-burgundy hover:bg-burgundy-light text-foreground font-semibold">
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </>;
};
export default Index;