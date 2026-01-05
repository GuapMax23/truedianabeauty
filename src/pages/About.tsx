import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Award, Package, Shield, Truck } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Shield,
      title: 'Authenticité Garantie',
      description: 'Tous nos produits sont 100% authentiques avec certificat d\'authenticité',
    },
    {
      icon: Truck,
      title: 'Livraison Rapide',
      description: 'Livraison express dans tout le Bénin sous 24-48h',
    },
    {
      icon: Package,
      title: 'Emballage Premium',
      description: 'Vos produits soigneusement emballés dans un packaging luxueux',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Une sélection rigoureuse des meilleures marques de luxe',
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="font-display text-5xl md:text-6xl font-bold text-gold mb-6">
              Diana Beauty
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Votre destination premium pour les parfums de luxe et les soins de la peau au Bénin
            </p>
          </div>

          {/* Story Section */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="bg-card rounded-lg p-8 md:p-12 border border-gold/20">
              <h2 className="font-display text-3xl font-bold text-gold mb-6">
                Notre Histoire
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Diana Beauty est née d'une passion pour l'excellence et le raffinement.
                  Notre mission est de rendre accessible au Bénin les plus grandes marques
                  de parfums et de soins de la peau du monde entier.
                </p>
                <p>
                  Nous croyons que chaque personne mérite de se sentir unique et spéciale.
                  C'est pourquoi nous sélectionnons avec soin chaque produit de notre
                  collection, garantissant authenticité et qualité premium.
                </p>
                <p>
                  Avec Diana Beauty, découvrez une expérience shopping luxueuse, un service
                  client exceptionnel et des produits qui subliment votre beauté naturelle.
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="text-center p-6 bg-card rounded-lg border border-gold/20 hover-glow transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-display font-semibold text-gold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Values Section */}
          <div className="bg-card rounded-lg p-8 md:p-12 border border-gold/20">
            <h2 className="font-display text-3xl font-bold text-gold mb-8 text-center">
              Nos Valeurs
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-display font-semibold text-xl mb-3">
                  🌟 Excellence
                </h3>
                <p className="text-muted-foreground text-sm">
                  Nous ne proposons que le meilleur, des produits rigoureusement
                  sélectionnés pour leur qualité exceptionnelle.
                </p>
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl mb-3">
                  💎 Authenticité
                </h3>
                <p className="text-muted-foreground text-sm">
                  Chaque produit est garanti 100% authentique, avec certificat à l'appui.
                  Zéro contrefaçon.
                </p>
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl mb-3">
                  ❤️ Passion
                </h3>
                <p className="text-muted-foreground text-sm">
                  Notre passion pour la beauté et le luxe nous pousse à vous offrir une
                  expérience unique.
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

export default About;
