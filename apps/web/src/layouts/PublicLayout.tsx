import { Button } from 'primereact/button';
import { Link, Outlet, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '../components/LanguageSwitcher';

export function PublicLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <header className='border-b border-border bg-surface'>
        <nav className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6'>
          <Link
            to='/'
            className='text-xl font-semibold tracking-tight text-foreground'
          >
            FlowPilot
          </Link>

          <div className='flex items-center gap-4'>
            <Button
              type='button'
              onClick={() => navigate('/login')}
              className='min-w-28 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover'
            >
              {t('auth.login')}
            </Button>
            <LanguageSwitcher />
          </div>
        </nav>
      </header>

      <Outlet />
    </div>
  );
}
