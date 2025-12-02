import { useEffect, useState } from 'react';
import { translations, type Language } from './translations';
import { getSettings, type AppSettings } from '@/lib/services/settings';

export function useTranslation() {
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  async function loadLanguage() {
    try {
      const settings = await getSettings();
      setLanguage(settings.language as Language);
    } catch (error) {
      console.error('Failed to load language:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const t = translations[language];

  return { t, language, isLoading, setLanguage };
}
