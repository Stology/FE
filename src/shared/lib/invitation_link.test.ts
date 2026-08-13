import { describe, expect, it } from 'vitest';

import { createInvitationLink, extractInvitationToken } from './invitation_link';

const TOKEN = 'ec84c93b-9404-4b4d-8505-31bd177861b6';
const ORIGIN = 'https://stology.vercel.app';

describe('invitation link', () => {
  it('creates an invitation link from a raw token', () => {
    expect(createInvitationLink(TOKEN, ORIGIN)).toBe(`${ORIGIN}/invite/${TOKEN}`);
  });

  it('does not duplicate a complete invitation URL returned by the API', () => {
    expect(createInvitationLink(`${ORIGIN}/invite/${TOKEN}`, ORIGIN)).toBe(
      `${ORIGIN}/invite/${TOKEN}`,
    );
  });

  it('recovers the token from a previously duplicated invitation URL', () => {
    const duplicatedUrl = `${ORIGIN}/invite/${ORIGIN}/invite/${TOKEN}`;

    expect(extractInvitationToken(duplicatedUrl)).toBe(TOKEN);
    expect(createInvitationLink(duplicatedUrl, ORIGIN)).toBe(`${ORIGIN}/invite/${TOKEN}`);
  });

  it('rejects an absolute URL that is not an invitation link', () => {
    expect(createInvitationLink('https://example.com/not-an-invite', ORIGIN)).toBe('');
  });
});
