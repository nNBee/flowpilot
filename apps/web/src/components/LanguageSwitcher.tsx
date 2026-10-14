import { useTranslation } from 'react-i18next';

import { changeLocale, supportedLocales, type Locale } from '../i18n';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  async function handleChange(locale: Locale) {
    await changeLocale(locale);
  }

  return (
    <div
      className='inline-flex rounded-lg border border-border bg-background p-1'
      role='group'
      aria-label={t('languageSwitcher.label')}
    >
      {supportedLocales.map((locale) => {
        const isActive = i18n.resolvedLanguage === locale;

        return (
          <button
            key={locale}
            type='button'
            onClick={() => void handleChange(locale)}
            aria-pressed={isActive}
            className={[
              'rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
              'transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground-secondary hover:bg-surface-hover hover:text-foreground',
            ].join(' ')}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
