import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Instagram, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Contact = () => {
  const contactMethods = [
    {
      icon: Phone,
      title: 'WhatsApp',
      value: '+229 01 97 09 62 08',
      link: "https://wa.me/2290197096208?text=Bonjour%20!%20Je%20viens%20de%20visiter%20Diana%20Beauty%20et%20j'aimerais%20des%20conseils%20sur%20vos%20produits.",
      description: 'Contactez-nous directement',
    },
    {
      icon: Instagram,
      title: 'Instagram',
      value: '@dianabeauty',
      link: 'https://instagram.com/dianabeauty',
      description: 'Suivez nos nouveautés',
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'dianeatchokossi@gmail.com',
      link: 'mailto:dianeatchokossi@gmail.com',
      description: 'Pour toute question',
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gold mb-4">
              Contactez-Nous
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Notre équipe est à votre écoute pour vous accompagner dans votre expérience Diana Beauty
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {contactMethods.map((method, idx) => (
              <a
                key={idx}
                href={method.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-card rounded-lg p-8 border border-gold/20 hover-glow transition-all text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <method.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">
                  {method.title}
                </h3>
                <p className="text-gold font-semibold mb-2">{method.value}</p>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </a>
            ))}
          </div>

          {/* Info Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg p-8 md:p-12 border border-gold/20">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Location */}
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-xl mb-2">
                        Notre Boutique
                      </h3>
                      <p className="text-muted-foreground">
                        Cotonou, Bénin<br />
                        (Livraison dans tout le pays)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-xl mb-2">
                        Horaires
                      </h3>
                      <p className="text-muted-foreground">
                        Lundi - Samedi: 9h - 19h<br />
                        Dimanche: 10h - 16h
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 pt-8 border-t border-gold/20 text-center">
                <h3 className="font-display text-2xl font-semibold text-gold mb-4">
                  Commandez Maintenant
                </h3>
                <p className="text-muted-foreground mb-6">
                  Contactez-nous via WhatsApp pour passer commande ou pour toute question
                </p>
                <a
                  href="https://wa.me/2290197096208?text=Bonjour%20!%20Je%20viens%20de%20visiter%20Diana%20Beauty%20et%20j'aimerais%20des%20conseils%20sur%20vos%20produits."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-gold hover:bg-gold-light text-primary font-semibold">
                    <Phone className="w-4 h-4 mr-2" />
                    Ouvrir WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* FAQ Preview */}
          <div className="max-w-4xl mx-auto mt-16">
            <h2 className="font-display text-3xl font-bold text-gold mb-8 text-center">
              Questions Fréquentes
            </h2>
            <div className="space-y-4">
              <div className="bg-card rounded-lg p-6 border border-gold/20">
                <h4 className="font-semibold mb-2">
                  🚚 Quels sont les délais de livraison ?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Nous livrons sous 24-48h dans tout le Bénin. Livraison gratuite à partir de 50 000 FCFA.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-gold/20">
                <h4 className="font-semibold mb-2">
                  ✅ Vos produits sont-ils authentiques ?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Oui, 100% ! Chaque produit est accompagné d'un certificat d'authenticité.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-gold/20">
                <h4 className="font-semibold mb-2">
                  🔄 Puis-je retourner un produit ?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Oui, retour possible sous 7 jours si le produit est non ouvert et dans son emballage d'origine.
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

export default Contact;
