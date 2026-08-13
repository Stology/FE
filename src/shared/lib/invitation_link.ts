const INVITATION_PATH_PREFIX = '/invite/';

export function createInvitationLink(
  invitationTokenOrUrl: string,
  origin = window.location.origin,
) {
  const token = extractInvitationToken(invitationTokenOrUrl);
  if (!token) return '';

  return `${origin.replace(/\/+$/, '')}${INVITATION_PATH_PREFIX}${encodeURIComponent(token)}`;
}

export function extractInvitationToken(invitationTokenOrUrl: string) {
  const invitation = invitationTokenOrUrl.trim();
  if (!invitation) return '';

  try {
    const invitationUrl = new URL(invitation);
    return extractTokenFromPath(invitationUrl.pathname);
  } catch {
    return decodeToken(invitation);
  }
}

function extractTokenFromPath(pathname: string) {
  const prefixIndex = pathname.lastIndexOf(INVITATION_PATH_PREFIX);
  if (prefixIndex === -1) return '';

  const token = pathname.slice(prefixIndex + INVITATION_PATH_PREFIX.length).split('/')[0];
  return decodeToken(token);
}

function decodeToken(token: string) {
  try {
    return decodeURIComponent(token);
  } catch {
    return token;
  }
}
