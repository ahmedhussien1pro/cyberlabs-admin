import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { ThemeToggle } from '@/shared/components/common/theme-toggle';
import { LanguageSwitcher } from '@/shared/components/common/language-switcher';
import { Logo } from '@/shared/components/common/Logo';
// import { Preloader } from '@/shared/components/common/preloader';
import { LoginForm } from '../components/login-form';
import '../styles/auth.css';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t } = useTranslation('auth');

  return (
    <>
      {/* Top-right controls */}
      <div className='fixed top-4 right-4 z-50 flex items-center gap-1'>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <section className='auth-form'>
        <motion.div
          className='relative w-full max-w-4xl overflow-hidden rounded-3xl shadow-2xl bg-card flex'
          style={{ minHeight: '600px' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}>
          {/* ── Left Panel — Branding (desktop only) ── */}
          <div
            className='hidden md:flex w-1/2 flex-col items-center justify-center p-10 text-primary-foreground'
            style={{
              background:
                'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.75) 100%)',
            }}>
            <Logo
              size='lg'
              showBadge={false}
              className='pointer-events-none mb-8'
            />

            <div className='text-center space-y-4'>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}>
                <Shield className='w-16 h-16 mx-auto opacity-90' />
              </motion.div>

              <h2 className='text-2xl font-bold'>
                {t('login.panelTitle', 'Admin Portal')}
              </h2>
              <p className='text-sm opacity-80 max-w-xs leading-relaxed'>
                {t(
                  'login.panelSubtitle',
                  'Manage users, courses, labs, and platform settings from one secure place.',
                )}
              </p>

              <div className='flex gap-2 justify-center mt-6 flex-wrap'>
                {['Users', 'Courses', 'Labs', 'Analytics'].map((item) => (
                  <span
                    key={item}
                    className='px-3 py-1 rounded-full text-xs font-medium border border-primary-foreground/40 bg-primary-foreground/10 backdrop-blur-sm'>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Panel — Login Form ── */}
          <div className='w-full md:w-1/2 flex items-center justify-center p-8'>
            <div className='auth-form__form'>
              {/* Logo visible only on mobile */}
              <div className='md:hidden flex justify-center mb-2'>
                <Logo size='md' showBadge />
              </div>

              <h1 className='auth-form__heading'>
                {t('login.title', 'Admin Login')}
              </h1>
              <p className='text-sm text-muted-foreground text-center -mt-2 mb-4'>
                {t('login.subtitle', 'Sign in to access the control panel')}
              </p>

              <LoginForm />
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
