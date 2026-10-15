export const errors = {
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
};
