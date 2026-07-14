# Admin Authentication

## Defense in depth

| Layer        | File                            | When                    |
| ------------ | ------------------------------- | ----------------------- |
| Server proxy | `src/proxy.ts`                  | Before page render      |
| Client guard | `src/components/auth-guard.tsx` | After Zustand hydration |

## `proxy.ts`

Matcher: `/admin/:path*`, `/vendor/:path*`, `/register`, `/register/:path*`.

```typescript
export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN)?.value;
  const role = getRequestRole(accessToken);
  const redirectPath =
    getAuthRedirectPath(request.nextUrl.pathname, role, accessToken) ??
    getGuestOnlyRedirectPath(request.nextUrl.pathname, role, accessToken);
  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }
  return NextResponse.next();
}
```

Rules in `src/lib/auth/proxy-auth.ts`:

| Condition                           | Redirect                                      |
| ----------------------------------- | --------------------------------------------- |
| No usable token on portal routes    | `/login`                                      |
| Vendor hits `/admin/*`              | `/vendor`                                     |
| Admin hits `/vendor/*`              | `/admin/stores`                               |
| Authenticated user hits `/register` | Role dashboard (`/admin/stores` or `/vendor`) |

`getDashboardPathForRole('admin')` is `/admin/stores`. The `/admin` index page separately redirects to `/admin/analytics`.

## Login

`src/app/login/page.tsx` uses `react-hook-form` + `loginSchema`, then `useLogin()` from `src/hooks/useAuth.ts`.

Network path: `hooks/useAuth.ts` → `lib/api/auth.ts` → `login()` → GraphQL `VENDOR_LOGIN` mutation (`documents.ts`). A single mutation returns role; legacy `adminLogin` / `vendorLogin` exports are aliases of `login()`.

After success, tokens are written to cookies and the auth store is updated; the user is routed with `getDashboardPath(role)`.

## Token storage

`src/lib/graphql/tokens.ts` (js-cookie), names from `src/lib/config.ts`:

| Cookie         | Max age                              |
| -------------- | ------------------------------------ |
| `accessToken`  | 1 hour (`ACCESS_TOKEN_MAX_AGE_DAYS`) |
| `refreshToken` | 7 days                               |

Options: `sameSite: 'lax'`, `path: '/'`, `secure` on HTTPS.

## Auth store

`src/stores/auth.store.ts` — Zustand `persist` to localStorage key `sopet-admin-auth`:

- `user`, `isAuthenticated`, `hasHydrated`

## Token refresh

`src/lib/graphql/client.ts` wraps operations with auth retry:

1. Detect unauthorized / expired access
2. Refresh via GraphQL refresh mutation (raw fetch)
3. Retry once with new access token
4. On failure: `notifyAuthFailure()` → `AuthFailureHandler` in `src/lib/providers.tsx` clears session and sends the user to `/login`

## Multi-store vendors

- JWT may include store context
- `src/stores/vendor.store.ts` persists `activeStoreId`
- `useVendorStoreId()` resolves active store from store → user → JWT
- `useSwitchStore()` re-issues tokens for another store

## Password reset

`src/app/reset-password/page.tsx` → `usePasswordReset` → `lib/api/passwordReset.ts`.

## Vendor email verification

Vendors must verify email before submitting a **new** store request (joining via store-member invite does not require verification). Product rules: [backend authentication — vendor email verification](../../sopet-backend/docs/authentication.md#vendor-email-verification).

| UI                           | Path / action                                             |
| ---------------------------- | --------------------------------------------------------- |
| Link landing                 | `/verify-email?token=…` (`src/app/verify-email/page.tsx`) |
| Vendor resend                | Stores page → store request section                       |
| Admin resend / manual verify | Admin → Vendors → vendor detail                           |

Email links use the backend `ADMIN_PANEL_URL`. Brand logo in mail is served from the API: `${API_URL}/images/email/sopet-logo-white.png`.

## Local seed logins

After backend `yarn db:seed:dev`:

| Role   | Email              | Password   |
| ------ | ------------------ | ---------- |
| Admin  | `admin@sopet.org`  | `P@ssw0rd` |
| Vendor | `vendor@sopet.org` | `P@ssw0rd` |

## E2E auth

`e2e/fixtures/taxonomy/admin-auth.ts` sets cookie-based JWT for Playwright.

## Related docs

- [Routing](routing.md)
- [Architecture](architecture.md)
