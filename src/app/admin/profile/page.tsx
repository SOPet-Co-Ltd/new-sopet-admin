'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentUser } from '@/hooks/useAuth';
import { useChangePassword, useUpdateUserProfile } from '@/hooks/useStoreSettings';
import { profileFormSchema, type ProfileFormValues } from '@/lib/validations';

export default function AdminProfilePage() {
  const { user } = useCurrentUser();
  const updateProfile = useUpdateUserProfile();
  const changePassword = useChangePassword();
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { fullName: '', email: '' },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ fullName: user.fullName, email: user.email });
    }
  }, [user, profileForm]);

  async function onProfileSubmit(values: ProfileFormValues) {
    await updateProfile.mutateAsync({ fullName: values.fullName });
  }

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    try {
      const message = await changePassword.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage(message);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMessage(err instanceof Error ? err.message : 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
    }
  }

  return (
    <div>
      <PageHeader title="โปรไฟล์" description="ข้อมูลบัญชีผู้ดูแลระบบ" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-display font-medium text-ink">ข้อมูลส่วนตัว</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="fullName" required>
                  ชื่อ-นามสกุล
                </Label>
                <Input
                  id="fullName"
                  autoComplete="name"
                  placeholder="ชื่อ-นามสกุล"
                  aria-invalid={!!profileForm.formState.errors.fullName}
                  aria-describedby={
                    profileForm.formState.errors.fullName ? 'fullName-error' : undefined
                  }
                  {...profileForm.register('fullName')}
                  className="mt-1.5"
                />
                {profileForm.formState.errors.fullName ? (
                  <p id="fullName-error" role="alert" className="mt-1 text-xs text-danger">
                    {profileForm.formState.errors.fullName.message}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!profileForm.formState.errors.email}
                  aria-describedby={
                    profileForm.formState.errors.email ? 'email-error' : 'email-hint'
                  }
                  {...profileForm.register('email')}
                  disabled
                  className="mt-1.5"
                />
                {profileForm.formState.errors.email ? (
                  <p id="email-error" role="alert" className="mt-1 text-xs text-danger">
                    {profileForm.formState.errors.email.message}
                  </p>
                ) : (
                  <p id="email-hint" className="mt-1 text-xs text-muted">
                    ไม่สามารถเปลี่ยนอีเมลได้ในขณะนี้
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={updateProfile.isPending}
                aria-busy={updateProfile.isPending}
              >
                {updateProfile.isPending ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <h2 className="font-display font-medium text-ink">รหัสผ่าน</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPasswordSection((v) => !v)}
              aria-expanded={showPasswordSection}
            >
              {showPasswordSection ? 'ซ่อน' : 'เปลี่ยนรหัสผ่าน'}
            </Button>
          </CardHeader>
          {showPasswordSection ? (
            <CardBody>
              <form onSubmit={onPasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" required>
                    รหัสผ่านปัจจุบัน
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    placeholder="กรอกรหัสผ่าน"
                    aria-describedby={passwordMessage ? 'password-form-message' : undefined}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword" required>
                    รหัสผ่านใหม่
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    aria-describedby={passwordMessage ? 'password-form-message' : undefined}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" required>
                    ยืนยันรหัสผ่านใหม่
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    aria-describedby={passwordMessage ? 'password-form-message' : undefined}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    className="mt-1.5"
                  />
                </div>
                {passwordMessage ? (
                  <p id="password-form-message" role="alert" className="text-sm text-muted">
                    {passwordMessage}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  disabled={changePassword.isPending}
                  aria-busy={changePassword.isPending}
                >
                  {changePassword.isPending ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
                </Button>
              </form>
            </CardBody>
          ) : (
            <CardBody>
              <p className="text-sm text-muted">
                คลิก &quot;เปลี่ยนรหัสผ่าน&quot; เพื่ออัปเดตรหัสผ่าน
              </p>
            </CardBody>
          )}
        </Card>
      </div>
    </div>
  );
}
