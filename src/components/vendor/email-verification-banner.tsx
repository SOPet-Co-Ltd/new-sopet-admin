'use client';

import { EmailVerificationNotice } from '@/components/vendor/email-verification-notice';
import { useCurrentUser } from '@/hooks/useAuth';
import { useSyncEmailVerificationStatus } from '@/hooks/useEmailVerification';

export function EmailVerificationBanner() {
  const { user, isAuthenticated } = useCurrentUser();
  const { isChecking } = useSyncEmailVerificationStatus();

  // Don't flash the "unverified" notice while the session-freshness check is still in
  // flight - the persisted emailVerified:false may just be stale (e.g. verified from
  // another tab/device) and is about to be corrected by that same request.
  if (!isAuthenticated || !user?.email || user.emailVerified === true || isChecking) {
    return null;
  }

  return <EmailVerificationNotice email={user.email} />;
}
