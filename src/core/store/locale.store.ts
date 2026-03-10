import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Locale = 'en' | 'ar';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isRTL: boolean;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      isRTL: false,
      setLocale: (locale) => {
        const isRTL = locale === 'ar';
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = locale;
        set({ locale, isRTL });
      },
    }),
    {
      name: 'locale-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.dir = state.isRTL ? 'rtl' : 'ltr';
          document.documentElement.lang = state.locale;
        }
      },
    },
  ),
);
