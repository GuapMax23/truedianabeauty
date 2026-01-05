import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const handleWhatsAppCheckout = () => {
    const phoneNumber = '2290197096208';
    const items = cart
      .map(
        item =>
          `${item.name} x${item.quantity} - ${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA`
      )
      .join('%0A');
    const total = getCartTotal().toLocaleString('fr-FR');
    const message = `Bonjour Diana Beauty!%0A%0AJe souhaite commander:%0A${items}%0A%0ATotal: ${total} FCFA`;
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-32 pb-20">
          <div className="container mx-auto px-4">
            <div className="text-center py-20">
              <h1 className="font-display text-4xl font-bold text-gold mb-4">
                Votre panier est vide
              </h1>
              <p className="text-muted-foreground mb-8">
                Découvrez notre collection de parfums et soins de luxe
              </p>
              <Link to="/">
                <Button className="bg-gold hover:bg-gold-light text-primary">
                  Continuer vos achats
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gold mb-12">
            Votre Panier
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map(item => (
                <div
                  key={item.id}
                  className="bg-card rounded-lg p-6 flex gap-6 border border-border hover:border-gold/50 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-semibold mb-2">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <span className="text-lg font-bold text-gold">
                        {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFromCart(item.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-6 border border-gold/20 sticky top-32">
                <h2 className="font-display text-2xl font-bold text-gold mb-6">
                  Récapitulatif
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sous-total</span>
                    <span>{getCartTotal().toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Livraison</span>
                    <span className="text-gold">Gratuite</span>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-gold">
                        {getCartTotal().toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleWhatsAppCheckout}
                  className="w-full bg-gold hover:bg-gold-light text-primary font-semibold mb-3"
                >
                  Commander via WhatsApp
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-gold/50 hover:bg-gold/10"
                    >
                      Vider le panier
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-gold/20 bg-card text-foreground">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-gold font-display text-2xl">
                        Êtes-vous sûr ?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        Cette action est irréversible. Votre panier sera vidé de tous ses articles.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-gold/20 hover:bg-gold/10 hover:text-gold">
                        Annuler
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={clearCart}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Vider le panier
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                  <p className="font-semibold mb-2">🚚 Livraison rapide au Bénin</p>
                  <p>✅ Produits 100% authentiques</p>
                  <p>🔄 Retour possible sous 7 jours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
