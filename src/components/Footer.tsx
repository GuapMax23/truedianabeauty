import { Instagram, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-gold/20 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex flex-col items-start mb-4">
              <h3 className="font-display text-3xl font-bold text-gold">Diana</h3>
              <p className="font-display text-sm tracking-[0.3em] text-gold/80">BEAUTY</p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Votre destination premium pour les parfums de luxe et les soins de la peau au Bénin.
              Authenticité garantie, livraison rapide.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/dianabeauty"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-gold hover:text-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:dianeatchokossi@gmail.com"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-gold hover:text-primary transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/2290197096208?text=Bonjour%20!%20Je%20viens%20de%20visiter%20Diana%20Beauty%20et%20j'aimerais%20des%20conseils%20sur%20vos%20produits."
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-gold hover:text-primary transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-gold mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/parfums" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  Parfums
                </Link>
              </li>
              <li>
                <Link to="/skincare" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  Skincare
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  À Propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-semibold text-gold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Cotonou, Bénin</li>
              <li>
                <a href="tel:+2290197096208" className="hover:text-gold transition-colors">
                  +229 01 97 09 62 08
                </a>
              </li>
              <li>
                <a href="mailto:dianeatchokossi@gmail.com" className="hover:text-gold transition-colors">
                  dianeatchokossi@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/20 mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Diana Beauty. Tous droits réservés. | Produits 100% Authentiques
          </p>
        </div>
      </div>
    </footer>
  );
};
