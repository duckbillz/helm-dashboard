import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

function getAllowedEmails(): string[] {
  const raw = process.env.AUTH_ALLOWED_EMAILS || '';
  return raw
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
}

// Scopes needed for: identity (openid/email/profile),
// creating + writing the exported Google Sheet (spreadsheets),
// and setting share permissions on it (drive.file).
const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
].join(' ');

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          scope: GOOGLE_SCOPES,
          // access_type=offline + prompt=consent forces Google to return a
          // refresh_token even on subsequent logins, so we can keep the
          // access token alive past its 1-hour expiry.
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      if (!email) return false;
      const allowed = getAllowedEmails();
      // If allowlist is empty, deny all (fail-closed)
      if (allowed.length === 0) return false;
      return allowed.includes(email);
    },
    async jwt({ token, account }) {
      // First sign-in: persist tokens from the OAuth provider
      if (account) {
        return {
          ...token,
          accessToken: account.access_token as string | undefined,
          refreshToken: account.refresh_token as string | undefined,
          // Some providers return expires_at (epoch sec); Google returns
          // expires_in (sec from now). Handle both.
          expiresAt: account.expires_at
            ? (account.expires_at as number)
            : account.expires_in
              ? Math.floor(Date.now() / 1000) + (account.expires_in as number)
              : undefined,
        };
      }
      // Subsequent calls: return token if not expired
      const expiresAt = token.expiresAt as number | undefined;
      if (!expiresAt || Date.now() / 1000 < expiresAt - 60) {
        return token;
      }
      // Try to refresh the access token via Google
      const refreshToken = token.refreshToken as string | undefined;
      if (!refreshToken) return token;
      try {
        const res = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: process.env.AUTH_GOOGLE_ID || '',
            client_secret: process.env.AUTH_GOOGLE_SECRET || '',
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }),
        });
        const refreshed = await res.json();
        if (!res.ok) throw refreshed;
        return {
          ...token,
          accessToken: refreshed.access_token,
          expiresAt: Math.floor(Date.now() / 1000) + (refreshed.expires_in || 3600),
          // Google does not always rotate the refresh token; keep the old one if not returned
          refreshToken: refreshed.refresh_token ?? refreshToken,
        };
      } catch (err) {
        console.error('Failed to refresh Google access token:', err);
        return { ...token, error: 'RefreshAccessTokenError' };
      }
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email;
      }
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as string | undefined;
      return session;
    },
  },
  session: { strategy: 'jwt' },
  trustHost: true,
});
