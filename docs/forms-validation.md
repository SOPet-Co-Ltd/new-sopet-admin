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

`src/lib/validations/index.ts` — most schemas
`src/lib/validations/promotions.ts` — promotion-specific

## Schema examples

| Schema                 | Used in                |
| ---------------------- | ---------------------- |
| `loginSchema`          | `/login`               |
| `registerVendorSchema` | `/register`            |
| `productFormSchema`    | Product edit/create    |
| `promotionFormSchema`  | Promotion forms        |
| `adminStoreFormSchema` | Admin store CRUD       |
| `storeInfoFormSchema`  | Vendor store settings  |
| `inviteMemberSchema`   | Team invitations       |
| `shippingOptionSchema` | Shipping configuration |

Thai error messages in schema definitions:

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

Mapped Thai messages in `src/lib/api/error-messages.ts`.

## Image upload

`components/ui/image-upload-field.tsx` — integrates with GraphQL `uploadImage` mutation via `lib/api/upload.rules.ts`.

## Related docs

- [Feature development](feature-development.md)
- [Data fetching](data-fetching.md)
