import { LoginPageContent } from '@/components/auth/login-page';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Sign in — codex-w',
  description: 'Sign in for cloud character backup.',
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-6 pt-28 pb-16">
        <LoginPageContent />
      </main>
    </>
  );
}
