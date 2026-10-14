export const hu = {
  common: {
    loading: 'Betöltés...',
  },

  invitation: {
    invalid: 'Érvénytelen meghívó.',
    expired: 'Érvénytelen vagy lejárt meghívólink.',

    firstName: 'Keresztnév',
    lastName: 'Vezetéknév',
    password: 'Jelszó',
    confirmPassword: 'Jelszó megerősítése',
    firstNameRequired: 'A keresztnév megadása kötelező.',
    lastNameRequired: 'A vezetéknév megadása kötelező.',
    accept: 'Meghívás elfogadása',

    acceptedTitle: 'Meghívás elfogadva',
    acceptedDescription: 'A fiókod sikeresen be lett állítva.',
  },

  validation: {
    firstNameRequired: 'A keresztnév megadása kötelező.',
    lastNameRequired: 'A vezetéknév megadása kötelező.',
    passwordMinLength:
      'A jelszónak legalább {{count}} karakter hosszúnak kell lennie.',
    confirmPasswordRequired: 'Erősítsd meg a jelszavad.',
    passwordsDoNotMatch: 'A két jelszó nem egyezik.',
    emailInvalid: 'Adj meg egy érvényes e-mail-címet.',
    passwordRequired: 'A jelszó megadása kötelező.',
  },

  errors: {
    unauthorized: 'Nincs jogosultságod ehhez a művelethez.',
    forbidden: 'Nincs megfelelő jogosultságod a művelet végrehajtásához.',
    business_membership_required: 'Ehhez a művelethez üzleti tagság szükséges.',

    invalid_request: 'Érvénytelen kérés.',

    role_not_found: 'A kiválasztott szerepkör nem található.',
    inviter_role_not_found: 'A saját szerepköröd nem található.',
    role_not_assignable:
      'Ez a szerepkör nem rendelhető hozzá a felhasználóhoz.',
    invitation_already_exists:
      'Ehhez az e-mail-címhez már tartozik aktív meghívó.',
    user_already_member: 'Ez a felhasználó már tagja a vállalkozásnak.',

    invitation_not_found: 'A meghívó nem található.',
    invitation_revoked: 'Ez a meghívó már nem érvényes.',
    invitation_expired: 'Ez a meghívó lejárt.',
    invitation_email_mismatch: 'Ez a meghívó egy másik e-mail-címhez tartozik.',
    invitation_already_accepted: 'Ezt a meghívót már elfogadták.',
    invitation_no_longer_available: 'Ez a meghívó már nem érhető el.',
    user_email_required: 'Érvényes e-mail-cím szükséges.',

    route_not_found: 'A kért oldal nem található.',
    internal_server_error: 'Hiba történt. Kérlek, próbáld meg újra.',
    network_error:
      'Nem sikerült kapcsolódni a szerverhez. Kérlek, próbáld meg újra.',
    unexpected_response: 'Váratlan hiba történt. Kérlek, próbáld meg újra.',
  },

  home: {
    eyebrow: 'Egyszerűbb vállalkozáskezelés',
    title: 'Tartsd mozgásban a vállalkozásod egy helyről.',
    description:
      'A FlowPilot egy átlátható felületen fogja össze a napi működést, a csapatot és az ügyfélfolyamatokat.',
    primaryAction: 'Kezdjük el',
    secondaryAction: 'Tudj meg többet',
  },

  auth: {
    login: 'Bejelentkezés',
    email: 'E-mail-cím',
    password: 'Jelszó',
    invalidCredentials: 'Hibás e-mail-cím vagy jelszó.',
    loginFailed: 'Nem sikerült bejelentkezni. Kérlek, próbáld meg újra.',
    loginTitle: 'Üdv újra!',
    loginDescription: 'Jelentkezz be a FlowPilot használatához.',
    loggingIn: 'Bejelentkezés...',
  },

  navigation: {
    dashboard: 'Áttekintés',
    members: 'Tagok',
    invitations: 'Meghívások',
    expandSidebar: 'Oldalsáv kinyitása',
    collapseSidebar: 'Oldalsáv összecsukása',
  },

  languageSwitcher: {
    label: 'Nyelv',
  },
};
