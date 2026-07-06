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

export function setTokens(accessToken: string, refreshToken: string): void {
  Cookies.set(ACCESS_TOKEN, accessToken, {
    expires: ACCESS_TOKEN_MAX_AGE_DAYS,
    sameSite: 'lax',
  });
  Cookies.set(REFRESH_TOKEN, refreshToken, {
    expires: REFRESH_TOKEN_MAX_AGE_DAYS,
    sameSite: 'lax',
  });
}

export function clearTokens(): void {
  Cookies.remove(ACCESS_TOKEN);
  Cookies.remove(REFRESH_TOKEN);
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
