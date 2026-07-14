# Forms & Validation

## Stack

- `react-hook-form` — form state
- `@hookform/resolvers/zod` — schema resolver
- `zod` v4 — validation schemas

## Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/lib/validations';

const form = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
});

const onSubmit = form.handleSubmit(async (values) => {
  try {
    await login.mutateAsync(values);
  } catch (error) {
    form.setError('root', { message: getErrorMessage(error) });
  }
});
```

## Schema location

| File                                | Contents                   |
| ----------------------------------- | -------------------------- |
| `src/lib/validations/index.ts`      | Most form schemas          |
| `src/lib/validations/promotions.ts` | Promotion-specific schemas |

## Schema examples

| Schema                                                    | Used in                     |
| --------------------------------------------------------- | --------------------------- |
| `loginSchema`                                             | `/login`                    |
| `registerVendorSchema`                                    | `/register`                 |
| `acceptStoreMemberInviteSchema`                           | Invite accept flows         |
| `productFormSchema`                                       | Product create/edit         |
| `productCreateSchema`                                     | Product create draft fields |
| `promotionFormSchema`                                     | Promotion forms             |
| `adminStoreFormSchema`                                    | Admin store CRUD            |
| `adminVendorFormSchema`                                   | Admin vendor forms          |
| `adminCustomerFormSchema`                                 | Admin customer forms        |
| `storeInfoFormSchema`                                     | Vendor store settings       |
| `storeRequestSchema`                                      | Vendor new store request    |
| `inviteMemberSchema`                                      | Team invitations            |
| `shippingOptionSchema`                                    | Shipping configuration      |
| `forgotPasswordSchema` / `resetPasswordSchema`            | Password reset              |
| `bannerFormSchema` / `sponsorFormSchema` / `adFormSchema` | Platform settings           |

Thai error messages live in the schema definitions:

```typescript
export const loginSchema = z.object({
  email: z.string().email('กรุณากรอกอีเมลที่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});
```

## API errors

```typescript
import { getErrorMessage } from '@/lib/api/errors';
form.setError('root', { message: getErrorMessage(error) });
```

Mapped Thai messages: `src/lib/api/error-messages.ts`.

## Image upload

`components/ui/image-upload-field.tsx` uploads via GraphQL through `src/lib/api/upload.ts`, with client rules in `src/lib/api/upload.rules.ts`.

## Related docs

- [Feature development](feature-development.md)
- [Data fetching](data-fetching.md)
