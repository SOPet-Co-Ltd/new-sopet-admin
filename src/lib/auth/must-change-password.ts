/**
 * Routes allowed while `mustChangePassword` is set (INF-006).
 * Admin changes password on profile; vendor on settings.
 */
export function getPasswordChangePath(role?: string | null): string {
  if (role === 'admin') return '/admin/profile';
  if (role === 'vendor') return '/vendor/settings';
  return '/login';
}

export function isPasswordChangeAllowedPath(pathname: string, role?: string | null): boolean {
  if (role === 'admin') {
    return pathname === '/admin/profile' || pathname.startsWith('/admin/profile/');
  }
  if (role === 'vendor') {
    return pathname === '/vendor/settings' || pathname.startsWith('/vendor/settings/');
  }
  return false;
}

export function getPostLoginPath(user: {
  role?: string | null;
  mustChangePassword?: boolean | null;
}): string {
  if (user.mustChangePassword) {
    return getPasswordChangePath(user.role);
  }
  if (user.role === 'admin') return '/admin/stores';
  if (user.role === 'vendor') return '/vendor';
  return '/login';
}
