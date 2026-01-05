import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthEnabled } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue sur Diana Beauty!',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Erreur de connexion',
        description: error.message || 'Email ou mot de passe incorrect',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthEnabled) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
          <div className="max-w-xl text-center px-4">
            <h1 className="font-display text-4xl font-bold text-gold mb-4">Espace membre inactif</h1>
            <p className="text-muted-foreground">
              Cette version vitrine n&apos;inclut pas de connexion. Toutes les commandes se font via WhatsApp
              ou téléphone.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-gradient-to-b from-background to-card/50">
        <div className="w-full max-w-md px-4">
          <div className="bg-card/80 backdrop-blur-sm border border-gold/20 rounded-lg p-8 shadow-lg">
            <h1 className="font-display text-3xl font-bold text-gold text-center mb-2">
              Connexion
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              Connectez-vous à votre compte Diana Beauty
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold-light text-primary font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Pas encore de compte ?{' '}
                <Link to="/signup" className="text-gold hover:underline font-semibold">
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
