import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  PASSWORD_RESET_TOKEN_STATUS_QUERY,
  REQUEST_PASSWORD_RESET,
  RESET_PASSWORD,
} from '@/lib/graphql/documents';

export interface PasswordResetTokenStatus {
  valid: boolean;
  status: 'valid' | 'expired' | 'used' | 'invalid';
}

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

export function getPasswordResetTokenStatus(token: string): Promise<PasswordResetTokenStatus> {
  return executeQuery<{ getPasswordResetTokenStatus: PasswordResetTokenStatus }>(
    PASSWORD_RESET_TOKEN_STATUS_QUERY,
    { token },
  ).then((data) => data.getPasswordResetTokenStatus);
}
