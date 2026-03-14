// src/features/auth/components/login-form.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Mail, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

import { authService }      from '@/core/api/services';
import { useAuthStore }     from '@/core/store/auth.store';
import { ROUTES }           from '@/shared/constants';
import { Button }           from '@/components/ui/button';
import { Input }            from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authTokenService } from '../services/auth-tokens.service';
import type { LoginFormData } from '../types';

export function LoginForm() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginFormData) => {
      const data = await authService.login(credentials);

      // Normalise token field (backend may use different keys)
      const token = data.accessToken ?? (data as any).access_token ?? (data as any).token;
      if (!token) throw new Error('Authentication failed — no token received');

      // ✅ Security: tokens stored via centralised service (SameSite=strict, secure in prod)
      authTokenService.save(token, data.refreshToken);

      // Verify the user actually has admin access before proceeding
      try {
        await authService.verifyAdminHealth();
      } catch {
        authTokenService.clear();
        throw new Error(t('login.error.notAdmin', 'Access denied: Admin role required'));
      }

      return data;
    },

    onSuccess: (data) => {
      setUser(data.user);
      navigate(ROUTES.DASHBOARD, { replace: true });
    },

    onError: (err: any) => {
      setError(
        err.message ??
        err.response?.data?.message ??
        t('login.error.invalidCredentials', 'Invalid email or password'),
      );
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setError('');
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>

      {/* Email */}
      <div>
        <div className='auth-form__input-box'>
          <Input
            id='email'
            type='email'
            placeholder={t('login.emailPlaceholder', 'admin@cyberlabs.com')}
            autoComplete='email'
            className='auth-form__input'
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            disabled={loginMutation.isPending}
          />
          <Mail className='auth-form__input-icon' size={18} aria-hidden='true' />
        </div>
        {errors.email && (
          <span id='email-error' className='auth-form__error' role='alert'>
            {errors.email.message}
          </span>
        )}
      </div>

      {/* Password */}
      <div>
        <div className='auth-form__input-box'>
          <Input
            id='password'
            type={showPassword ? 'text' : 'password'}
            placeholder={t('login.passwordPlaceholder', '••••••••')}
            autoComplete='current-password'
            className='auth-form__input'
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
            disabled={loginMutation.isPending}
          />
          <button
            type='button'
            className='auth-form__input-icon-btn'
            onClick={() => setShowPassword((p) => !p)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <span id='password-error' className='auth-form__error' role='alert'>
            {errors.password.message}
          </span>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant='destructive' role='alert'>
          <AlertCircle className='h-4 w-4' aria-hidden='true' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit */}
      <Button
        type='submit'
        className='auth-form__submit-btn'
        disabled={loginMutation.isPending}
        aria-busy={loginMutation.isPending}>
        {loginMutation.isPending ? (
          <span className='flex items-center gap-2'>
            <Loader2 className='h-4 w-4 animate-spin' aria-hidden='true' />
            {t('login.loading', 'Signing in...')}
          </span>
        ) : (
          t('login.submit', 'Sign In')
        )}
      </Button>
    </form>
  );
}
