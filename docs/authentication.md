# Admin Authentication

## Defense in depth

| Layer        | File                            | When                    |
| ------------ | ------------------------------- | ----------------------- |
| Server proxy | `src/proxy.ts`                  | Before page render      |
| Client guard | `src/components/auth-guard.tsx` | After Zustand hydration |

## proxy.ts

```typescript
export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN)?.value;
  const role = getRequestRole(accessToken);
  const redirectPath = getAuthRedirectPath(request.nextUrl.pathname, role, accessToken);
  if (redirectPath) return NextResponse.redirect(new URL(redirectPath, request.url));
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/vendor/:path*'] };
```

Logic in `src/lib/auth/proxy-auth.ts`:

- No token → `/login`
- Vendor accessing `/admin` → `/vendor`
- Admin accessing `/vendor` → `/admin/stores`

## Login

`src/app/login/page.tsx`:

```typescript
const form = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
});

const login = useLogin();
// onSubmit → login.mutate({ email, password })
```

`src/hooks/useAuth.ts` → `src/lib/api/auth.ts` → `VENDOR_LOGIN` / `ADMIN_LOGIN` GraphQL mutations.

## Token storage

`src/lib/graphql/tokens.ts` (js-cookie):

| Cookie         | Max age |
| -------------- | ------- |
| `accessToken`  | 1 hour  |
| `refreshToken` | 7 days  |

`sameSite: 'lax'`

## Auth store

`src/stores/auth.store.ts` — Zustand with `persist` to `localStorage` (`sopet-admin-auth`):

- `user`, `isAuthenticated`, `hasHydrated`

## Token refresh

`src/lib/graphql/client.ts` — `withAuthRetry()`:

1. Detect 401
2. `refreshAccessToken()` via raw fetch
3. Retry once
4. On failure: `notifyAuthFailure()` → `AuthFailureHandler` in `providers.tsx`

## Multi-store vendors

- JWT contains `storeId`
- `src/stores/vendor.store.ts` persists `activeStoreId`
- `useVendorStoreId()` resolves: store → user.storeId → JWT
- `useSwitchStore()` mutation re-issues tokens

## Password reset

`src/app/reset-password/page.tsx` → `usePasswordReset` → `lib/api/passwordReset.ts`

## E2E auth

`e2e/fixtures/taxonomy/admin-auth.ts` — sets cookie-based JWT for Playwright tests.

## Related docs

- [Workspace authentication](../../new-sopet-workspace/docs/developer/authentication.md)
- [Routing](routing.md)
