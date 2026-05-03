import Link from 'next/link';

export type AppHeaderUser = {
  displayName: string;
  profilePhotoUrl: string | null;
} | null;

export function AppHeader({ user }: { user: AppHeaderUser }) {
  return (
    <header className="app-header">
      <Link href="/" className="app-header-wordmark">
        {'rally'}<span className="bang">{'!'}</span>
      </Link>
      {user && (
        <Link href="/passport" className="app-header-passport-link" title="your passport">
          <span
            className="app-header-passport-av"
            style={user.profilePhotoUrl ? {
              backgroundImage: `url(${user.profilePhotoUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : undefined}
          >
            {!user.profilePhotoUrl && user.displayName.charAt(0).toUpperCase()}
          </span>
        </Link>
      )}
    </header>
  );
}
