import { signIn, auth } from '../../auth';
import { redirect } from 'next/navigation';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect('/');

  const params = await searchParams;
  const hasError = !!params.error;

  async function handleSignIn() {
    'use server';
    await signIn('google', { redirectTo: '/' });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F5F0DC' }}>
      <div style={{ textAlign: 'center', width: 360 }}>
        <img
          src="/helm-logo.svg"
          alt="Helm"
          style={{ width: 64, height: 64, borderRadius: 16, margin: '0 auto 20px' }}
        />
        <h2 style={{ color: '#061E03', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Helm Dashboard</h2>
        <p style={{ color: '#7A7A6E', fontSize: 13, marginBottom: 24 }}>Sign in with your Helm Google account</p>

        {hasError && (
          <div style={{
            background: '#FFEBEE',
            border: '1px solid #E53935',
            color: '#C62828',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: 12,
            marginBottom: 16,
            textAlign: 'left',
          }}>
            Access denied. Your email is not authorized to access this dashboard.
          </div>
        )}

        <form action={handleSignIn}>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #D4CFC0',
              background: '#FFFFFF',
              color: '#1A1A1A',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.71H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.68 9c0-.593.102-1.17.284-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </form>

        <p style={{ color: '#B8B8A8', fontSize: 11, marginTop: 20 }}>
          Access restricted to authorized team members only.
        </p>
      </div>
    </div>
  );
}
