import Cookies from 'js-cookie';
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  ACCESS_TOKEN_MAX_AGE_DAYS,
  REFRESH_TOKEN_MAX_AGE_DAYS,
} from '@/lib/config';

export function getAccessToken(): string | undefined {
  return Cookies.get(ACCESS_TOKEN);
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN);
}

function getCookieOptions(expires: number): Cookies.CookieAttributes {
  const secure = typeof window !== 'undefined' ? window.location.protocol === 'https:' : true;

  return {
    expires,
    sameSite: 'lax',
    path: '/',
    secure,
  };
}

export function setTokens(accessToken: string, refreshToken: string): void {
  Cookies.set(ACCESS_TOKEN, accessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE_DAYS));
  Cookies.set(REFRESH_TOKEN, refreshToken, getCookieOptions(REFRESH_TOKEN_MAX_AGE_DAYS));
}

export function clearTokens(): void {
  const secure = typeof window !== 'undefined' ? window.location.protocol === 'https:' : true;
  const removeOptions = { path: '/', secure };

  Cookies.remove(ACCESS_TOKEN, removeOptions);
  Cookies.remove(REFRESH_TOKEN, removeOptions);
}

type AuthFailureHandler = () => void;

let onAuthFailure: AuthFailureHandler = () => {
  clearTokens();
};

export function setOnAuthFailure(handler: AuthFailureHandler): void {
  onAuthFailure = handler;
}

export function notifyAuthFailure(): void {
  clearTokens();
  if (typeof window !== 'undefined') {
    onAuthFailure();
  }
}
