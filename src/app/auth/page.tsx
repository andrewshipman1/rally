import { AuthFlow } from '@/components/auth/AuthFlow';

export const metadata = {
  title: 'Sign in — Rally',
};

export default function AuthPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(168deg, #122c35 0%, #1a3d4a 30%, #2d6b5a 60%, #3a8a7a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 380, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 42,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: -1,
            }}
          >
            Rally
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 }}>
            Plan group trips with friends
          </p>
        </div>
        <AuthFlow />
      </div>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Outfit:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}
