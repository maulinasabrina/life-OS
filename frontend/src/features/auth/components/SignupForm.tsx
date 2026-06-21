import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUpWithEmail } from '@/features/auth/services/authService';
import { GoogleAuthButton } from '@/features/auth/components/GoogleAuthButton';
import { TextField } from '@/shared/components/TextField';
import { Button } from '@/shared/components/Button';
import { OrDivider } from '@/shared/components/OrDivider';

export function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { session, error: signUpError } = await signUpWithEmail(
      email,
      password
    );

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    // If email confirmation is required in the Supabase project settings,
    // signUp succeeds but returns no session until the user confirms.
    if (!session) {
      setConfirmationSent(true);
      setIsLoading(false);
      return;
    }

    navigate('/dashboard', { replace: true });
  }

  if (confirmationSent) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-3 text-center">
        <h1 className="font-(family-name:--font-display) text-2xl font-semibold text-(--color-ink)">
          Check your inbox
        </h1>
        <p className="text-(--color-ink-soft)">
          We sent a confirmation link to <strong>{email}</strong>. Open it to
          activate your account, then sign in.
        </p>
        <Link
          to="/login"
          className="mt-2 font-medium text-(--color-ink) underline underline-offset-2"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-(family-name:--font-display) text-3xl font-semibold text-(--color-ink)">
          Create your account
        </h1>
        <p className="text-(--color-ink-soft)">
          One place to plan your life and preserve your moments.
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
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p role="alert" className="text-sm text-(--color-error)">
            {error}
          </p>
        )}

        <Button type="submit" isLoading={isLoading} className="mt-1">
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-(--color-ink-soft)">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-(--color-ink) underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
