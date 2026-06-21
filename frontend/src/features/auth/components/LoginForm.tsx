import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmail } from '@/features/auth/services/authService';
import { GoogleAuthButton } from '@/features/auth/components/GoogleAuthButton';
import { TextField } from '@/shared/components/TextField';
import { Button } from '@/shared/components/Button';
import { OrDivider } from '@/shared/components/OrDivider';

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: signInError } = await signInWithEmail(email, password);

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-(family-name:--font-display) text-3xl font-semibold text-(--color-ink)">
          Welcome back
        </h1>
        <p className="text-(--color-ink-soft)">
          Sign in to keep planning, tracking, and preserving your days.
        </p>
      </div>

      <GoogleAuthButton onError={setError} />
      <OrDivider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p role="alert" className="text-sm text-(--color-error)">
            {error}
          </p>
        )}

        <Button type="submit" isLoading={isLoading} className="mt-1">
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-(--color-ink-soft)">
        New to Life OS?{' '}
        <Link
          to="/signup"
          className="font-medium text-(--color-ink) underline underline-offset-2"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
