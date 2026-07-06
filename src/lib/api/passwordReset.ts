import { executeMutation } from '@/lib/graphql/client';
import { REQUEST_PASSWORD_RESET, RESET_PASSWORD } from '@/lib/graphql/documents';

export function requestPasswordReset(email: string): Promise<string> {
  return executeMutation<{ requestPasswordReset: { message: string } }>(REQUEST_PASSWORD_RESET, {
    input: { email },
  }).then((data) => data.requestPasswordReset.message);
}

export function resetPassword(token: string, newPassword: string): Promise<string> {
  return executeMutation<{ resetPassword: { message: string } }>(RESET_PASSWORD, {
    input: { token, newPassword },
  }).then((data) => data.resetPassword.message);
}
