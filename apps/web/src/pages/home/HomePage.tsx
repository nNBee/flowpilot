import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <main className='bg-background'>
      <section className='mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-6 pb-32 pt-16'>
        <div className='max-w-3xl'>
          <p className='mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary'>
            {t('home.eyebrow')}
          </p>

          <h1 className='max-w-3xl text-5xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-6xl'>
            {t('home.title')}
          </h1>

          <p className='mt-6 max-w-2xl text-lg leading-8 text-foreground-secondary'>
            {t('home.description')}
          </p>

          <div className='mt-8 flex flex-wrap items-center gap-3'>
            <button
              type='button'
              onClick={() => navigate('/login')}
              className='inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover'
            >
              {t('home.primaryAction')}
              <ArrowRight size={17} strokeWidth={1.8} />
            </button>

            <button
              type='button'
              className='rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-hover'
            >
              {t('home.secondaryAction')}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
