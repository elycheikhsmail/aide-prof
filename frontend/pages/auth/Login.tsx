import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Copy, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Card } from '../../components/ui';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);
  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string, field: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            Assistant d'Évaluation
          </h1>
          <p className="text-gray-600">Connectez-vous à votre compte</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <Input
              data-testid="login-email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@email.com"
              required
              disabled={isSubmitting}
            />

            <div className="relative">
              <Input
                data-testid="login-password"
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isSubmitting}
              />
              <button
                data-testid="toggle-password"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {(localError || authError) && (
              <div data-testid="login-error" className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {localError || authError}
              </div>
            )}

            {import.meta.env.DEV && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                <div className="font-semibold mb-2">Identifiants de test :</div>

                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium">Email:</span> ely@gmail.com
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('ely@gmail.com', 'email')}
                    className="ml-2 p-1.5 hover:bg-blue-100 rounded transition-colors"
                    title="Copier l'email"
                  >
                    {copiedField === 'email' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Mot de passe:</span> 1234
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('1234', 'password')}
                    className="ml-2 p-1.5 hover:bg-blue-100 rounded transition-colors"
                    title="Copier le mot de passe"
                  >
                    {copiedField === 'password' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <Button data-testid="login-submit" type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </Button>

            <p className="text-center text-gray-600 text-sm">
              Pas encore de compte ?{' '}
              <Link data-testid="register-link" to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                S'inscrire
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
