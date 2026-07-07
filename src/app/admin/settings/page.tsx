'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useAllPlatformAds,
  useAllPlatformBanners,
  useAllPlatformSponsors,
  useCreatePlatformAd,
  useCreatePlatformBanner,
  useCreatePlatformSponsor,
  useDeletePlatformAd,
  useDeletePlatformBanner,
  useDeletePlatformSponsor,
  useReorderPlatformBanners,
  useReorderPlatformSponsors,
  useUpdatePlatformAd,
  useUpdatePlatformBanner,
  useUpdatePlatformSponsor,
} from '@/hooks/usePlatformSettings';
import { platformSettingsTabLabels } from '@/lib/i18n/th';
import {
  adFormSchema,
  bannerFormSchema,
  sponsorFormSchema,
  type AdFormValues,
  type BannerFormValues,
  type SponsorFormValues,
} from '@/lib/validations';
import type { PlatformAd, PlatformBanner, PlatformSponsor } from '@/types';

type Tab = keyof typeof platformSettingsTabLabels;

const bannerDefaults: BannerFormValues = {
  title: '',
  imageUrl: '',
  mobileImageUrl: '',
  linkUrl: '',
  isActive: true,
};

const sponsorDefaults: SponsorFormValues = {
  name: '',
  imageUrl: '',
  linkUrl: '',
  isActive: true,
};

const adDefaults: AdFormValues = {
  title: '',
  imageUrl: '',
  linkUrl: '',
  isActive: true,
};

export default function AdminPlatformSettingsPage() {
  const [tab, setTab] = useState<Tab>('banners');
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [sponsorDialogOpen, setSponsorDialogOpen] = useState(false);
  const [adDialogOpen, setAdDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PlatformBanner | null>(null);
  const [editingSponsor, setEditingSponsor] = useState<PlatformSponsor | null>(null);
  const [editingAd, setEditingAd] = useState<PlatformAd | null>(null);

  const { data: banners = [], isLoading: loadingBanners } = useAllPlatformBanners();
  const { data: sponsors = [], isLoading: loadingSponsors } = useAllPlatformSponsors();
  const { data: ads = [], isLoading: loadingAds } = useAllPlatformAds();
  const createBanner = useCreatePlatformBanner();
  const updateBanner = useUpdatePlatformBanner();
  const deleteBanner = useDeletePlatformBanner();
  const reorderBanners = useReorderPlatformBanners();
  const createSponsor = useCreatePlatformSponsor();
  const updateSponsor = useUpdatePlatformSponsor();
  const deleteSponsor = useDeletePlatformSponsor();
  const reorderSponsors = useReorderPlatformSponsors();
  const createAd = useCreatePlatformAd();
  const updateAd = useUpdatePlatformAd();
  const deleteAd = useDeletePlatformAd();

  const bannerForm = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: bannerDefaults,
  });

  const sponsorForm = useForm<SponsorFormValues>({
    resolver: zodResolver(sponsorFormSchema),
    defaultValues: sponsorDefaults,
  });

  const adForm = useForm<AdFormValues>({
    resolver: zodResolver(adFormSchema),
    defaultValues: adDefaults,
  });

  useEffect(() => {
    if (!bannerDialogOpen) return;
    if (editingBanner) {
      bannerForm.reset({
        title: editingBanner.title,
        imageUrl: editingBanner.imageUrl,
        mobileImageUrl: editingBanner.mobileImageUrl ?? '',
        linkUrl: editingBanner.linkUrl ?? '',
        isActive: editingBanner.isActive,
      });
    } else {
      bannerForm.reset(bannerDefaults);
    }
  }, [bannerDialogOpen, editingBanner, bannerForm]);

  useEffect(() => {
    if (!sponsorDialogOpen) return;
    if (editingSponsor) {
      sponsorForm.reset({
        name: editingSponsor.name,
        imageUrl: editingSponsor.imageUrl,
        linkUrl: editingSponsor.linkUrl ?? '',
        isActive: editingSponsor.isActive,
      });
    } else {
      sponsorForm.reset(sponsorDefaults);
    }
  }, [sponsorDialogOpen, editingSponsor, sponsorForm]);

  useEffect(() => {
    if (!adDialogOpen) return;
    if (editingAd) {
      adForm.reset({
        title: editingAd.title,
        imageUrl: editingAd.imageUrl,
        linkUrl: editingAd.linkUrl ?? '',
        isActive: editingAd.isActive,
      });
    } else {
      adForm.reset(adDefaults);
    }
  }, [adDialogOpen, editingAd, adForm]);

  function openCreateBanner() {
    setEditingBanner(null);
    setBannerDialogOpen(true);
  }

  function openEditBanner(banner: PlatformBanner) {
    setEditingBanner(banner);
    setBannerDialogOpen(true);
  }

  function openCreateSponsor() {
    setEditingSponsor(null);
    setSponsorDialogOpen(true);
  }

  function openEditSponsor(sponsor: PlatformSponsor) {
    setEditingSponsor(sponsor);
    setSponsorDialogOpen(true);
  }

  function openCreateAd() {
    setEditingAd(null);
    setAdDialogOpen(true);
  }

  function openEditAd(ad: PlatformAd) {
    setEditingAd(ad);
    setAdDialogOpen(true);
  }

  async function onBannerSubmit(values: BannerFormValues) {
    const input = {
      title: values.title,
      imageUrl: values.imageUrl,
      mobileImageUrl: values.mobileImageUrl || null,
      linkUrl: values.linkUrl || null,
      isActive: values.isActive ?? true,
    };
    if (editingBanner) {
      await updateBanner.mutateAsync({
        id: editingBanner.id,
        ...input,
        sortOrder: editingBanner.sortOrder,
      });
    } else {
      const nextSortOrder =
        banners.reduce((max, banner) => Math.max(max, banner.sortOrder), -1) + 1;
      await createBanner.mutateAsync({ ...input, sortOrder: nextSortOrder });
    }
    setBannerDialogOpen(false);
    setEditingBanner(null);
  }

  async function onSponsorSubmit(values: SponsorFormValues) {
    const input = {
      name: values.name,
      imageUrl: values.imageUrl,
      linkUrl: values.linkUrl || null,
      isActive: values.isActive ?? true,
    };
    if (editingSponsor) {
      await updateSponsor.mutateAsync({
        id: editingSponsor.id,
        ...input,
        sortOrder: editingSponsor.sortOrder,
      });
    } else {
      const nextSortOrder =
        sponsors.reduce((max, sponsor) => Math.max(max, sponsor.sortOrder), -1) + 1;
      await createSponsor.mutateAsync({ ...input, sortOrder: nextSortOrder });
    }
    setSponsorDialogOpen(false);
    setEditingSponsor(null);
  }

  async function onAdSubmit(values: AdFormValues) {
    const input = {
      title: values.title,
      imageUrl: values.imageUrl,
      linkUrl: values.linkUrl || null,
      isActive: values.isActive ?? true,
    };
    if (editingAd) {
      await updateAd.mutateAsync({
        id: editingAd.id,
        ...input,
      });
    } else {
      await createAd.mutateAsync(input);
    }
    setAdDialogOpen(false);
    setEditingAd(null);
  }

  function handleDeleteBanner(banner: PlatformBanner) {
    if (!window.confirm(`ลบแบนเนอร์ "${banner.title}" ใช่หรือไม่?`)) return;
    deleteBanner.mutate(banner.id);
  }

  function handleDeleteSponsor(sponsor: PlatformSponsor) {
    if (!window.confirm(`ลบสปอนเซอร์ "${sponsor.name}" ใช่หรือไม่?`)) return;
    deleteSponsor.mutate(sponsor.id);
  }

  function handleDeleteAd(ad: PlatformAd) {
    if (!window.confirm(`ลบโฆษณา "${ad.title}" ใช่หรือไม่?`)) return;
    deleteAd.mutate(ad.id);
  }

  function moveBanner(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= banners.length) return;
    const ordered = [...banners];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    reorderBanners.mutate(ordered.map((banner) => banner.id));
  }

  function moveSponsor(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sponsors.length) return;
    const ordered = [...sponsors];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    reorderSponsors.mutate(ordered.map((sponsor) => sponsor.id));
  }

  const bannerPending =
    createBanner.isPending ||
    updateBanner.isPending ||
    deleteBanner.isPending ||
    reorderBanners.isPending;
  const sponsorPending =
    createSponsor.isPending ||
    updateSponsor.isPending ||
    deleteSponsor.isPending ||
    reorderSponsors.isPending;
  const adPending = createAd.isPending || updateAd.isPending || deleteAd.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="ตั้งค่าแพลตฟอร์ม"
        description="จัดการแบนเนอร์ สปอนเซอร์ และโฆษณาป๊อปอัพบนหน้าแรก"
        action={
          tab === 'banners' ? (
            <Button type="button" onClick={openCreateBanner}>
              เพิ่มแบนเนอร์
            </Button>
          ) : tab === 'sponsors' ? (
            <Button type="button" onClick={openCreateSponsor}>
              เพิ่มสปอนเซอร์
            </Button>
          ) : (
            <Button type="button" onClick={openCreateAd}>
              เพิ่มโฆษณา
            </Button>
          )
        }
      />

      <div className="flex flex-wrap gap-2">
        {(Object.keys(platformSettingsTabLabels) as Tab[]).map((key) => (
          <Button
            key={key}
            type="button"
            variant={tab === key ? 'default' : 'outline'}
            onClick={() => setTab(key)}
          >
            {platformSettingsTabLabels[key]}
          </Button>
        ))}
      </div>

      {tab === 'banners' ? (
        <Card>
          <CardHeader>
            <h2 className="font-display font-medium text-brand">แบนเนอร์ ({banners.length})</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {loadingBanners ? (
              <p className="text-sm text-muted">กำลังโหลด...</p>
            ) : banners.length === 0 ? (
              <p className="text-sm text-muted">ยังไม่มีแบนเนอร์</p>
            ) : (
              banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-cream px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    {banner.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="h-12 w-20 shrink-0 rounded object-cover"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-ink">{banner.title}</p>
                        <Badge status={banner.isActive ? 'published' : 'draft'}>
                          {banner.isActive ? 'เปิดใช้งาน' : 'ปิด'}
                        </Badge>
                      </div>
                      <p className="truncate text-sm text-muted">
                        ลำดับ {banner.sortOrder}
                        {banner.linkUrl ? ` · ${banner.linkUrl}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={bannerPending || index === 0}
                      aria-busy={bannerPending}
                      aria-label="เลื่อนขึ้น"
                      onClick={() => moveBanner(index, -1)}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={bannerPending || index === banners.length - 1}
                      aria-busy={bannerPending}
                      aria-label="เลื่อนลง"
                      onClick={() => moveBanner(index, 1)}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={bannerPending}
                      aria-busy={bannerPending}
                      onClick={() => openEditBanner(banner)}
                    >
                      แก้ไข
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={bannerPending}
                      aria-busy={bannerPending}
                      onClick={() => handleDeleteBanner(banner)}
                    >
                      ลบ
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      ) : null}

      {tab === 'sponsors' ? (
        <Card>
          <CardHeader>
            <h2 className="font-display font-medium text-brand">สปอนเซอร์ ({sponsors.length})</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {loadingSponsors ? (
              <p className="text-sm text-muted">กำลังโหลด...</p>
            ) : sponsors.length === 0 ? (
              <p className="text-sm text-muted">ยังไม่มีสปอนเซอร์</p>
            ) : (
              sponsors.map((sponsor, index) => (
                <div
                  key={sponsor.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-cream px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    {sponsor.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sponsor.imageUrl}
                        alt={sponsor.name}
                        className="h-12 w-20 shrink-0 rounded object-cover"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-ink">{sponsor.name}</p>
                        <Badge status={sponsor.isActive ? 'published' : 'draft'}>
                          {sponsor.isActive ? 'เปิดใช้งาน' : 'ปิด'}
                        </Badge>
                      </div>
                      <p className="truncate text-sm text-muted">
                        ลำดับ {sponsor.sortOrder}
                        {sponsor.linkUrl ? ` · ${sponsor.linkUrl}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={sponsorPending || index === 0}
                      aria-busy={sponsorPending}
                      aria-label="เลื่อนขึ้น"
                      onClick={() => moveSponsor(index, -1)}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={sponsorPending || index === sponsors.length - 1}
                      aria-busy={sponsorPending}
                      aria-label="เลื่อนลง"
                      onClick={() => moveSponsor(index, 1)}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={sponsorPending}
                      aria-busy={sponsorPending}
                      onClick={() => openEditSponsor(sponsor)}
                    >
                      แก้ไข
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={sponsorPending}
                      aria-busy={sponsorPending}
                      onClick={() => handleDeleteSponsor(sponsor)}
                    >
                      ลบ
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      ) : null}

      {tab === 'ads' ? (
        <Card>
          <CardHeader>
            <h2 className="font-display font-medium text-brand">โฆษณาป๊อปอัพ ({ads.length})</h2>
            <p className="text-sm text-muted">
              เปิดใช้งานได้ครั้งละ 1 โฆษณา — เมื่อเปิดโฆษณาใหม่ โฆษณาอื่นจะถูกปิดอัตโนมัติ
            </p>
          </CardHeader>
          <CardBody className="space-y-3">
            {loadingAds ? (
              <p className="text-sm text-muted">กำลังโหลด...</p>
            ) : ads.length === 0 ? (
              <p className="text-sm text-muted">ยังไม่มีโฆษณา</p>
            ) : (
              ads.map((ad) => (
                <div
                  key={ad.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-cream px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    {ad.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="h-12 w-20 shrink-0 rounded object-cover"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-ink">{ad.title}</p>
                        <Badge status={ad.isActive ? 'published' : 'draft'}>
                          {ad.isActive ? 'เปิดใช้งาน' : 'ปิด'}
                        </Badge>
                      </div>
                      <p className="truncate text-sm text-muted">
                        {ad.linkUrl ? ad.linkUrl : 'ไม่มีลิงก์'}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={adPending}
                      aria-busy={adPending}
                      onClick={() => openEditAd(ad)}
                    >
                      แก้ไข
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={adPending}
                      aria-busy={adPending}
                      onClick={() => handleDeleteAd(ad)}
                    >
                      ลบ
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      ) : null}

      <Dialog
        open={bannerDialogOpen}
        onOpenChange={(open) => {
          setBannerDialogOpen(open);
          if (!open) setEditingBanner(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'แก้ไขแบนเนอร์' : 'เพิ่มแบนเนอร์'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={bannerForm.handleSubmit(onBannerSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="banner-title" required>
                ชื่อแบนเนอร์
              </Label>
              <Input
                id="banner-title"
                placeholder="ชื่อแบนเนอร์"
                autoComplete="off"
                aria-invalid={!!bannerForm.formState.errors.title}
                aria-describedby={
                  bannerForm.formState.errors.title ? 'banner-title-error' : undefined
                }
                {...bannerForm.register('title')}
                className="mt-1.5"
              />
              {bannerForm.formState.errors.title ? (
                <p id="banner-title-error" className="mt-1 text-xs text-danger" role="alert">
                  {bannerForm.formState.errors.title.message}
                </p>
              ) : null}
            </div>
            <Controller
              name="imageUrl"
              control={bannerForm.control}
              render={({ field }) => (
                <ImageUploadField
                  id="banner-imageUrl"
                  label="รูปภาพ (เดสก์ท็อป)"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  folder="banners"
                  error={bannerForm.formState.errors.imageUrl?.message}
                />
              )}
            />
            <Controller
              name="mobileImageUrl"
              control={bannerForm.control}
              render={({ field }) => (
                <ImageUploadField
                  id="banner-mobileImageUrl"
                  label="รูปภาพ (มือถือ)"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  folder="banners"
                  error={bannerForm.formState.errors.mobileImageUrl?.message}
                />
              )}
            />
            <div>
              <Label htmlFor="banner-linkUrl">ลิงก์ (ไม่บังคับ)</Label>
              <Input
                id="banner-linkUrl"
                type="url"
                placeholder="https://example.com"
                autoComplete="url"
                aria-invalid={!!bannerForm.formState.errors.linkUrl}
                aria-describedby={
                  bannerForm.formState.errors.linkUrl ? 'banner-linkUrl-error' : undefined
                }
                {...bannerForm.register('linkUrl')}
                className="mt-1.5"
              />
              {bannerForm.formState.errors.linkUrl ? (
                <p id="banner-linkUrl-error" className="mt-1 text-xs text-danger" role="alert">
                  {bannerForm.formState.errors.linkUrl.message}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <input
                id="banner-isActive"
                type="checkbox"
                className="h-4 w-4 rounded border-border text-brand"
                {...bannerForm.register('isActive')}
              />
              <Label htmlFor="banner-isActive">เปิดใช้งาน</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBannerDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={bannerPending} aria-busy={bannerPending}>
                {bannerPending ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={sponsorDialogOpen}
        onOpenChange={(open) => {
          setSponsorDialogOpen(open);
          if (!open) setEditingSponsor(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSponsor ? 'แก้ไขสปอนเซอร์' : 'เพิ่มสปอนเซอร์'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={sponsorForm.handleSubmit(onSponsorSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="sponsor-name" required>
                ชื่อสปอนเซอร์
              </Label>
              <Input
                id="sponsor-name"
                placeholder="ชื่อสปอนเซอร์"
                autoComplete="off"
                aria-invalid={!!sponsorForm.formState.errors.name}
                aria-describedby={
                  sponsorForm.formState.errors.name ? 'sponsor-name-error' : undefined
                }
                {...sponsorForm.register('name')}
                className="mt-1.5"
              />
              {sponsorForm.formState.errors.name ? (
                <p id="sponsor-name-error" className="mt-1 text-xs text-danger" role="alert">
                  {sponsorForm.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            <Controller
              name="imageUrl"
              control={sponsorForm.control}
              render={({ field }) => (
                <ImageUploadField
                  id="sponsor-imageUrl"
                  label="รูปภาพ"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  folder="sponsors"
                  error={sponsorForm.formState.errors.imageUrl?.message}
                />
              )}
            />
            <div>
              <Label htmlFor="sponsor-linkUrl">ลิงก์ (ไม่บังคับ)</Label>
              <Input
                id="sponsor-linkUrl"
                type="url"
                placeholder="https://example.com"
                autoComplete="url"
                aria-invalid={!!sponsorForm.formState.errors.linkUrl}
                aria-describedby={
                  sponsorForm.formState.errors.linkUrl ? 'sponsor-linkUrl-error' : undefined
                }
                {...sponsorForm.register('linkUrl')}
                className="mt-1.5"
              />
              {sponsorForm.formState.errors.linkUrl ? (
                <p id="sponsor-linkUrl-error" className="mt-1 text-xs text-danger" role="alert">
                  {sponsorForm.formState.errors.linkUrl.message}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <input
                id="sponsor-isActive"
                type="checkbox"
                className="h-4 w-4 rounded border-border text-brand"
                {...sponsorForm.register('isActive')}
              />
              <Label htmlFor="sponsor-isActive">เปิดใช้งาน</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSponsorDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={sponsorPending} aria-busy={sponsorPending}>
                {sponsorPending ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={adDialogOpen}
        onOpenChange={(open) => {
          setAdDialogOpen(open);
          if (!open) setEditingAd(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAd ? 'แก้ไขโฆษณา' : 'เพิ่มโฆษณา'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={adForm.handleSubmit(onAdSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="ad-title" required>
                ชื่อโฆษณา
              </Label>
              <Input
                id="ad-title"
                placeholder="ชื่อโฆษณา"
                autoComplete="off"
                aria-invalid={!!adForm.formState.errors.title}
                aria-describedby={adForm.formState.errors.title ? 'ad-title-error' : undefined}
                {...adForm.register('title')}
                className="mt-1.5"
              />
              {adForm.formState.errors.title ? (
                <p id="ad-title-error" className="mt-1 text-xs text-danger" role="alert">
                  {adForm.formState.errors.title.message}
                </p>
              ) : null}
            </div>
            <Controller
              name="imageUrl"
              control={adForm.control}
              render={({ field }) => (
                <ImageUploadField
                  id="ad-imageUrl"
                  label="รูปภาพ"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  folder="ads"
                  error={adForm.formState.errors.imageUrl?.message}
                />
              )}
            />
            <div>
              <Label htmlFor="ad-linkUrl">ลิงก์ (ไม่บังคับ)</Label>
              <Input
                id="ad-linkUrl"
                type="url"
                placeholder="https://example.com"
                autoComplete="url"
                aria-invalid={!!adForm.formState.errors.linkUrl}
                aria-describedby={adForm.formState.errors.linkUrl ? 'ad-linkUrl-error' : undefined}
                {...adForm.register('linkUrl')}
                className="mt-1.5"
              />
              {adForm.formState.errors.linkUrl ? (
                <p id="ad-linkUrl-error" className="mt-1 text-xs text-danger" role="alert">
                  {adForm.formState.errors.linkUrl.message}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <input
                id="ad-isActive"
                type="checkbox"
                className="h-4 w-4 rounded border-border text-brand"
                {...adForm.register('isActive')}
              />
              <Label htmlFor="ad-isActive">เปิดใช้งาน</Label>
            </div>
            <p className="text-xs text-muted">
              หากเปิดใช้งาน โฆษณาอื่นที่เปิดอยู่จะถูกปิดอัตโนมัติ
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAdDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={adPending} aria-busy={adPending}>
                {adPending ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
