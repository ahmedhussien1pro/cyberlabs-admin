import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/core/api/services';
import { useAuthStore } from '@/core/store/auth.store';
import { ROUTES } from '@/shared/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Cookies from 'js-cookie';
import { Loader2, AlertCircle } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Store token in cookie (7 days expiry)
      Cookies.set('access_token', data.access_token, { 
        expires: 7,
        sameSite: 'strict',
        secure: window.location.protocol === 'https:'
      });
      
      // Update auth store (will persist to localStorage)
      setUser(data.user);
      
      // Small delay to ensure state is persisted
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD, { replace: true });
      }, 100);
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Invalid email or password';
      setError(message);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setError('');
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@cyberlabs.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              disabled={loginMutation.isPending}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              disabled={loginMutation.isPending}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="mt-6 w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </div>
    </form>
  );
}
