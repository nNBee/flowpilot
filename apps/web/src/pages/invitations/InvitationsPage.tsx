import { useTranslation } from 'react-i18next';

export function InvitationsPage() {
  const { t } = useTranslation();

  return (
    <section>
      <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
        {t('navigation.invitations')}
      </h1>

      <p className='mt-2 text-sm text-foreground-secondary'>
        Placeholder page.
      </p>
    </section>
  );
}
