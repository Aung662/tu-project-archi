import { Suspense } from 'react';
import { AuthForm } from '@/components/AuthForm';

// Hidden fallback route for staff/admin sign-in. This is NOT a security control:
// it merely reveals a login form. All privileged APIs are protected server-side
// by role checks regardless of how the user reached this page.
export default function HiddenPortalPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm adminHint />
    </Suspense>
  );
}
