import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/api';
import { getLocalProducts } from '@/data/localCatalog';
import { getSkincareProducts } from '@/data/skincareCatalog';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const product = useMemo(() => {
    if (!id) {
      return null;
    }

    const localProducts = getLocalProducts();
    const skincareProducts = getSkincareProducts();
    const catalog = [...localProducts, ...skincareProducts];

    return catalog.find(item => item.id === id) ?? null;
  }, [id]);

  const galleryImages = product ? [product.image, ...(product.gallery || [])] : [];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    toast({
      title: 'Ajouté au panier',
      description: `${product.name} a été ajouté à votre panier`,
    });
  };

  const handleGoBack = () => {
    const canNavigateBack = typeof window !== 'undefined' && window.history.length > 1;
    if (canNavigateBack) {
      navigate(-1);
      return;
    }
    navigate('/parfums');
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="container mx-auto px-4">
          {!product ? (
            <div className="text-center">
              <h1 className="font-display text-3xl md:text-4xl font-semibold mb-4 text-gold">
                Produit introuvable
              </h1>
              <p className="text-muted-foreground mb-8">
                Le parfum que vous recherchez n&apos;existe pas ou n&apos;est plus disponible.
              </p>
              <Button onClick={() => navigate('/parfums')} className="bg-burgundy hover:bg-burgundy-light">
                Retour à la collection
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-4">
                <div className="bg-card p-6 rounded-2xl shadow-xl border border-border/50 flex items-center justify-center">
                  <img
                    src={getImageUrl(galleryImages[activeImageIndex] || product.image)}
                    alt={product.name}
                    className="w-full max-w-xl h-auto object-cover rounded-xl shadow-lg"
                  />
                </div>
                {galleryImages.length > 1 && (
                  <div className="flex flex-wrap gap-4">
                    {galleryImages.map((img, index) => (
                      <button
                        key={img}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-20 h-20 rounded-lg overflow-hidden border transition ${
                          activeImageIndex === index ? 'border-gold' : 'border-transparent'
                        }`}
                        aria-label={`Voir la photo ${index + 1}`}
                      >
                        <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <p className="uppercase text-sm tracking-[0.3em] text-muted-foreground mb-3">
                    Collection {product.category}
                  </p>
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                    {product.name}
                  </h1>
                  <p className="text-2xl font-semibold text-gold">
                    {product.price.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed">
                  {product.description || 'Description à venir très bientôt.'}
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={handleAddToCart}
                    className="bg-burgundy hover:bg-burgundy-light text-foreground font-semibold px-8 py-6 text-lg"
                  >
                    Ajouter au panier
                  </Button>

                  <Button
                    onClick={handleGoBack}
                    variant="outline"
                    className="border-gold/60 text-gold hover:bg-gold/10 px-8 py-6 text-lg"
                  >
                    Retour
                  </Button>
                </div>

                <div className="pt-6 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    Besoin de conseils personnalisés ?{' '}
                    <Link to="/contact" className="text-gold hover:underline">
                      Contactez notre équipe
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;

