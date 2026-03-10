import { useLocaleStore } from '@/core/store/locale.store';
import { labsI18n } from '@/i18n/labs';

export function useLocale() {
  const { locale, isRTL, setLocale } = useLocaleStore();
  return { locale, isRTL, setLocale };
}

export function useLabsT() {
  const { locale } = useLocaleStore();
  return labsI18n[locale] ?? labsI18n.en;
}
