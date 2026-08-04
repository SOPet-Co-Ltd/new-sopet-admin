import { executeMutation } from '@/lib/graphql/client';
import { RESEND_EMAIL_VERIFICATION, VERIFY_EMAIL } from '@/lib/graphql/documents';

export function verifyEmail(token: string): Promise<string> {
  return executeMutation<{ verifyEmail: { message: string } }>(VERIFY_EMAIL, {
    input: { token },
  }).then((data) => data.verifyEmail.message);
}

export function resendEmailVerification(): Promise<string> {
  return executeMutation<{ resendEmailVerification: { message: string } }>(
    RESEND_EMAIL_VERIFICATION,
  ).then((data) => data.resendEmailVerification.message);
}
