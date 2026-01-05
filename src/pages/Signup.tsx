import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup, isAuthEnabled } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await signup(name, email, password);
      toast({
        title: 'Inscription réussie',
        description: 'Bienvenue sur Diana Beauty!',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Erreur d\'inscription',
        description: error.message || 'Une erreur est survenue',
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
            <h1 className="font-display text-4xl font-bold text-gold mb-4">Inscriptions fermées</h1>
            <p className="text-muted-foreground">
              Le site vitrine présente uniquement nos collections. Pour commander ou créer un compte client,
              merci de nous contacter directement.
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
              Inscription
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              Créez votre compte Diana Beauty
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

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
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Au moins 6 caractères
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold-light text-primary font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Inscription...' : 'S\'inscrire'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-gold hover:underline font-semibold">
                  Se connecter
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

export default Signup;
