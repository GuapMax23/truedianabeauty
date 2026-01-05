import { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product, useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAddToWishlist, useRemoveFromWishlist, useCheckWishlist } from '@/hooks/useWishlist';
import { getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isAuthenticated, isAuthEnabled } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const productId = product.id;
  const canUseWishlist = isAuthEnabled && isAuthenticated;
  const { data: isInWishlist = false } = useCheckWishlist(canUseWishlist ? productId : undefined);
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: 'Ajouté au panier',
      description: `${product.name} a été ajouté à votre panier`,
    });
  };

  const handleOpenDetail = () => {
    navigate(`/product/${product.id}`);
  };

  const handleWishlist = async () => {
    if (!isAuthEnabled) {
      toast({
        title: 'Fonctionnalité désactivée',
        description: 'Les favoris sont inactifs sur cette version vitrine.',
      });
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour ajouter des favoris',
      });
      return;
    }

    try {
      if (isInWishlist) {
        await removeFromWishlistMutation.mutateAsync(productId);
        toast({
          title: 'Retiré des favoris',
          description: `${product.name} a été retiré de vos favoris`,
        });
      } else {
        await addToWishlistMutation.mutateAsync(productId);
        toast({
          title: 'Ajouté aux favoris',
          description: `${product.name} a été ajouté à vos favoris`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden border border-border hover:border-foreground/20 transition-all duration-500">
      {/* Image Container */}
      <div
        className="relative aspect-square overflow-hidden bg-muted cursor-pointer"
        onClick={handleOpenDetail}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleOpenDetail();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Voir ${product.name}`}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={getImageUrl(product.image)}
          alt={product.name || 'Produit skincare'}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => {
            setImageLoaded(true);
            setImageError(false);
            console.log(`[ProductCard] Image chargée avec succès:`, {
              productName: product.name,
              imageUrl: getImageUrl(product.image),
              productId: product.id,
            });
          }}
          onError={(e) => {
            console.error(`[ProductCard] Erreur de chargement d'image pour ${product.name}:`, {
              imageUrl: getImageUrl(product.image),
              originalImage: product.image,
              productId: product.id,
              imageType: typeof product.image,
            });
            setImageError(true);
            setImageLoaded(false);
            // Afficher une image placeholder en cas d'erreur
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        
        {/* Wishlist Button */}
        {isAuthEnabled && (
          <button
            onClick={event => {
              event.stopPropagation();
              handleWishlist();
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-background hover:scale-110"
            aria-label="Ajouter aux favoris"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isInWishlist ? 'fill-gold text-gold' : 'text-foreground/60'
              }`}
            />
          </button>
        )}

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
          <Button
            onClick={event => {
              event.stopPropagation();
              handleAddToCart();
            }}
            className="font-semibold gap-2 bg-burgundy hover:bg-burgundy-light text-foreground"
          >
            <ShoppingCart className="w-4 h-4" />
            Ajouter au panier
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold mb-2 text-foreground transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-foreground">
            {product.price.toLocaleString('fr-FR')} FCFA
          </span>
        </div>
      </div>
    </div>
  );
};
