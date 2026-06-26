import { LoginPageContent } from '@/components/auth/login-page';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Sign in',
  description: 'Sign in for cloud character backup.',
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="px-6 pt-28 pb-16">
        <LoginPageContent />
      </main>
    </>
  );
}
