import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

function getAllowedEmails(): string[] {
  const raw = process.env.AUTH_ALLOWED_EMAILS || '';
  return raw
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
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
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email;
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
  trustHost: true,
});
