// Unified locale hook — delegates to i18next (src/core/config/i18n.config.ts)
import { useTranslation } from 'react-i18next';

export function useLocale() {
  const { i18n } = useTranslation();
  const locale = (i18n.language?.startsWith('ar') ? 'ar' : 'en') as 'en' | 'ar';
  const isRTL = locale === 'ar';

  const setLocale = (lang: 'en' | 'ar') => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  return { locale, isRTL, setLocale };
}

export function useLabsT() {
  const { t } = useTranslation('labs');
  return t;
}
