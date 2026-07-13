'use client';

import { EmailVerificationNotice } from '@/components/vendor/email-verification-notice';
import { useCurrentUser } from '@/hooks/useAuth';
import { useSyncEmailVerificationStatus } from '@/hooks/useEmailVerification';

export function EmailVerificationBanner() {
  const { user, isAuthenticated } = useCurrentUser();
  useSyncEmailVerificationStatus();

  if (!isAuthenticated || !user?.email || user.emailVerified === true) {
    return null;
  }

  return <EmailVerificationNotice email={user.email} />;
}
