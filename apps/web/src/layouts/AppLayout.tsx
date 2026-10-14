import { PanelLeftClose, PanelLeftOpen, UserRound } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import { navigationItems } from '../navigation/navigation-data';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleSidebar } from '../store/slices/ui-slice';

export function AppLayout() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);

  const session = useAppSelector((state) => state.auth.session);

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <header className='h-16 border-b border-border bg-surface'>
        <div className='grid h-full grid-cols-[1fr_auto_1fr] items-center px-4'>
          <div className='justify-self-start'>
            <button
              type='button'
              onClick={() => dispatch(toggleSidebar())}
              aria-label={
                sidebarCollapsed
                  ? t('navigation.expandSidebar')
                  : t('navigation.collapseSidebar')
              }
              className='rounded-lg p-2 text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-foreground'
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen size={20} strokeWidth={1.8} />
              ) : (
                <PanelLeftClose size={20} strokeWidth={1.8} />
              )}
            </button>
          </div>

          <div className='justify-self-center text-lg font-semibold tracking-tight'>
            FlowPilot
          </div>

          <div className='flex items-center gap-2 justify-self-end text-sm text-foreground-secondary'>
            <UserRound size={18} strokeWidth={1.8} />

            <span className='hidden sm:inline'>{session?.user.email}</span>
          </div>
        </div>
      </header>

      <div className='flex min-h-[calc(100vh-4rem)]'>
        <aside
          className={[
            'shrink-0 border-r border-border bg-surface text-foreground',
            'transition-[width] duration-200 ease-out',
            sidebarCollapsed ? 'w-16' : 'w-60',
          ].join(' ')}
        >
          <nav className='flex flex-col gap-1 p-2'>
            {navigationItems.map((item) => {
              const Icon = item.icon;

              if (!item.path) {
                return null;
              }

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/app'}
                  aria-label={sidebarCollapsed ? t(item.labelKey) : undefined}
                  className={({ isActive }) =>
                    [
                      'flex h-11 items-center rounded-lg transition-colors',
                      sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3',
                      isActive
                        ? 'bg-primary-subtle text-primary'
                        : 'text-primary hover:bg-primary-subtle',
                    ].join(' ')
                  }
                >
                  <Icon size={20} strokeWidth={1.8} />

                  {!sidebarCollapsed && (
                    <span className='text-sm font-medium'>
                      {t(item.labelKey)}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className='min-w-0 flex-1 p-6'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
