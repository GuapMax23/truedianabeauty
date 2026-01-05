import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Menu, X, User, LogOut } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { getCartCount } = useCart();
  const { isAuthenticated, logout, isAdmin, isAuthEnabled } = useAuth();
  const { data: wishlist = [] } = useWishlist(isAuthEnabled && isAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/parfums', label: 'Parfums' },
    { to: '/skincare', label: 'Skincare' },
    { to: '/about', label: 'À Propos' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? 'bg-background/95 backdrop-blur-md shadow-lg shadow-gold/10 py-3'
        : 'bg-transparent py-6'
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group">
            <div className="flex flex-col items-center">
              <img
                src="/images/logo-diana-db.png"
                alt="Diana Beauty"
                className={`transition-all duration-500 object-contain hover:rotate-12 ${scrolled ? 'h-12' : 'h-24'
                  }`}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-gold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gold after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100 ${location.pathname === link.to ? 'text-gold' : 'text-foreground/80'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {isAuthEnabled && isAuthenticated && (
              <Link to="/wishlist" className="relative group">
                <Heart className="w-5 h-5 text-foreground/80 group-hover:text-gold transition-colors" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-gold text-primary text-xs rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            )}

            <Link to="/cart" className="relative group">
              <ShoppingCart className="w-5 h-5 text-foreground/80 group-hover:text-gold transition-colors" />
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-gold text-primary text-xs rounded-full flex items-center justify-center font-bold">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {isAuthEnabled && isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="text-gold">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Déconnexion</span>
                </Button>
              </div>
            ) : isAuthEnabled ? (
              <Link to="/login">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Connexion</span>
                </Button>
              </Link>
            ) : null}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-card border-gold/20">
                <nav className="flex flex-col gap-6 mt-8">
                  {navLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={`text-lg font-medium transition-colors hover:text-gold ${location.pathname === link.to ? 'text-gold' : 'text-foreground/80'
                        }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
