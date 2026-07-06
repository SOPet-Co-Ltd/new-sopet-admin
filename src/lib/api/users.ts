import { executeMutation } from '@/lib/graphql/client';
import { CHANGE_PASSWORD, UPDATE_USER_PROFILE } from '@/lib/graphql/documents';
import { mapUser } from '@/lib/graphql/mappers';
import type { User } from '@/types';

export function updateUserProfile(input: { fullName?: string }): Promise<User> {
  return executeMutation<{
    updateUserProfile: Parameters<typeof mapUser>[0] & { storeId?: string | null };
  }>(UPDATE_USER_PROFILE, { input }).then((data) =>
    mapUser(data.updateUserProfile, data.updateUserProfile.storeId ?? undefined),
  );
}

export function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<string> {
  return executeMutation<{ changePassword: { message: string } }>(CHANGE_PASSWORD, {
    input,
  }).then((data) => data.changePassword.message);
}
