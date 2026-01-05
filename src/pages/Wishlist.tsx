import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { ProductCard } from '@/components/ProductCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

const Wishlist = () => {
  const { isAuthenticated, isAuthEnabled } = useAuth();
  const navigate = useNavigate();
  const { data: wishlist = [], isLoading } = useWishlist(isAuthEnabled && isAuthenticated);

  useEffect(() => {
    if (!isAuthEnabled) {
      return;
    }
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isAuthEnabled, navigate]);

  if (!isAuthEnabled) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
          <div className="max-w-xl text-center px-4">
            <h1 className="font-display text-4xl font-bold text-gold mb-4">Favoris désactivés</h1>
            <p className="text-muted-foreground">
              Cette version vitrine ne propose pas de compte client ni de liste de favoris. Contactez-nous
              directement pour réserver vos produits préférés.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Normaliser les produits pour avoir un id cohérent
  const products = wishlist.map(p => ({ ...p, id: p._id || p.id }));

  return (
    <>
      <Header />
      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gold mb-4">
            Mes Favoris
          </h1>
          <p className="text-muted-foreground mb-12">
            Retrouvez tous vos produits préférés
          </p>

          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Chargement de vos favoris...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-8">
                Vous n'avez pas encore de favoris
              </p>
              <Link to="/">
                <Button className="bg-gold hover:bg-gold-light text-primary">
                  Découvrir nos produits
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;
