import { describe, expect, it } from 'vitest';
import {
  getPasswordChangePath,
  getPostLoginPath,
  isPasswordChangeAllowedPath,
} from './must-change-password';

describe('must-change-password helpers', () => {
  it('maps roles to password-change routes', () => {
    expect(getPasswordChangePath('admin')).toBe('/admin/profile');
    expect(getPasswordChangePath('vendor')).toBe('/vendor/settings');
    expect(getPasswordChangePath('customer')).toBe('/login');
  });

  it('allows only profile/settings paths while forced', () => {
    expect(isPasswordChangeAllowedPath('/admin/profile', 'admin')).toBe(true);
    expect(isPasswordChangeAllowedPath('/admin/stores', 'admin')).toBe(false);
    expect(isPasswordChangeAllowedPath('/vendor/settings', 'vendor')).toBe(true);
    expect(isPasswordChangeAllowedPath('/vendor/products', 'vendor')).toBe(false);
  });

  it('routes post-login to password change when flag is set', () => {
    expect(getPostLoginPath({ role: 'admin', mustChangePassword: true })).toBe('/admin/profile');
    expect(getPostLoginPath({ role: 'vendor', mustChangePassword: true })).toBe('/vendor/settings');
    expect(getPostLoginPath({ role: 'admin', mustChangePassword: false })).toBe('/admin/stores');
    expect(getPostLoginPath({ role: 'vendor' })).toBe('/vendor');
  });
});
