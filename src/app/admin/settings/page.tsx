'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
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
import { AdsPanel } from './ads-panel';
import { BannersPanel } from './banners-panel';
import { LoginImagesPanel } from './login-images-panel';
import { AdDialog, BannerDialog, SponsorDialog } from './platform-settings-dialogs';
import { PLATFORM_SETTINGS_TAB_PANEL_IDS } from './platform-settings-primitives';
import { SponsorsPanel } from './sponsors-panel';

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

  const {
    data: banners = [],
    isLoading: loadingBanners,
    error: bannersError,
    refetch: refetchBanners,
  } = useAllPlatformBanners();
  const {
    data: sponsors = [],
    isLoading: loadingSponsors,
    error: sponsorsError,
    refetch: refetchSponsors,
  } = useAllPlatformSponsors();
  const {
    data: ads = [],
    isLoading: loadingAds,
    error: adsError,
    refetch: refetchAds,
  } = useAllPlatformAds();
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
    createBanner.reset();
    updateBanner.reset();
    setEditingBanner(null);
    setBannerDialogOpen(true);
  }

  function openEditBanner(banner: PlatformBanner) {
    createBanner.reset();
    updateBanner.reset();
    setEditingBanner(banner);
    setBannerDialogOpen(true);
  }

  function openCreateSponsor() {
    createSponsor.reset();
    updateSponsor.reset();
    setEditingSponsor(null);
    setSponsorDialogOpen(true);
  }

  function openEditSponsor(sponsor: PlatformSponsor) {
    createSponsor.reset();
    updateSponsor.reset();
    setEditingSponsor(sponsor);
    setSponsorDialogOpen(true);
  }

  function openCreateAd() {
    createAd.reset();
    updateAd.reset();
    setEditingAd(null);
    setAdDialogOpen(true);
  }

  function openEditAd(ad: PlatformAd) {
    createAd.reset();
    updateAd.reset();
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
    try {
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
    } catch {
      // surfaced via mutation state
    }
  }

  async function onSponsorSubmit(values: SponsorFormValues) {
    const input = {
      name: values.name,
      imageUrl: values.imageUrl,
      linkUrl: values.linkUrl || null,
      isActive: values.isActive ?? true,
    };
    try {
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
    } catch {
      // surfaced via mutation state
    }
  }

  async function onAdSubmit(values: AdFormValues) {
    const input = {
      title: values.title,
      imageUrl: values.imageUrl,
      linkUrl: values.linkUrl || null,
      isActive: values.isActive ?? true,
    };
    try {
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
    } catch {
      // surfaced via mutation state
    }
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

  const bannerSavePending = createBanner.isPending || updateBanner.isPending;
  const bannerPending = bannerSavePending || deleteBanner.isPending || reorderBanners.isPending;
  const sponsorSavePending = createSponsor.isPending || updateSponsor.isPending;
  const sponsorPending = sponsorSavePending || deleteSponsor.isPending || reorderSponsors.isPending;
  const adSavePending = createAd.isPending || updateAd.isPending;
  const adPending = adSavePending || deleteAd.isPending;

  const bannerSubmitError =
    createBanner.isError && !createBanner.isPending
      ? createBanner.error
      : updateBanner.isError && !updateBanner.isPending
        ? updateBanner.error
        : null;

  const sponsorSubmitError =
    createSponsor.isError && !createSponsor.isPending
      ? createSponsor.error
      : updateSponsor.isError && !updateSponsor.isPending
        ? updateSponsor.error
        : null;

  const adSubmitError =
    createAd.isError && !createAd.isPending
      ? createAd.error
      : updateAd.isError && !updateAd.isPending
        ? updateAd.error
        : null;

  const bannerDeleteError =
    deleteBanner.isError && !deleteBanner.isPending ? deleteBanner.error : null;
  const sponsorDeleteError =
    deleteSponsor.isError && !deleteSponsor.isPending ? deleteSponsor.error : null;
  const adDeleteError = deleteAd.isError && !deleteAd.isPending ? deleteAd.error : null;

  const createActionLabel =
    tab === 'banners' ? 'เพิ่มแบนเนอร์' : tab === 'sponsors' ? 'เพิ่มสปอนเซอร์' : 'เพิ่มโฆษณา';

  const headerAction =
    tab === 'loginImages' ? undefined : tab === 'banners' ? (
      <Button type="button" onClick={openCreateBanner}>
        {createActionLabel}
      </Button>
    ) : tab === 'sponsors' ? (
      <Button type="button" onClick={openCreateSponsor}>
        {createActionLabel}
      </Button>
    ) : (
      <Button type="button" onClick={openCreateAd}>
        {createActionLabel}
      </Button>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="ตั้งค่าแพลตฟอร์ม"
        description="จัดการแบนเนอร์ สปอนเซอร์ และโฆษณาป๊อปอัพบนหน้าแรกร้านค้า"
        action={headerAction}
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="หมวดตั้งค่าแพลตฟอร์ม">
        {(Object.keys(platformSettingsTabLabels) as Tab[]).map((key) => (
          <Button
            key={key}
            type="button"
            role="tab"
            id={`platform-settings-tab-${key}`}
            aria-selected={tab === key}
            aria-controls={PLATFORM_SETTINGS_TAB_PANEL_IDS[key]}
            variant={tab === key ? 'default' : 'outline'}
            onClick={() => setTab(key)}
          >
            {platformSettingsTabLabels[key]}
          </Button>
        ))}
      </div>

      {tab === 'banners' ? (
        <div
          id={PLATFORM_SETTINGS_TAB_PANEL_IDS.banners}
          role="tabpanel"
          aria-labelledby="platform-settings-tab-banners"
        >
          <BannersPanel
            banners={banners}
            loading={loadingBanners}
            error={bannersError}
            pending={bannerPending}
            deletePending={deleteBanner.isPending}
            reorderError={reorderBanners.isError}
            deleteError={bannerDeleteError}
            onRetry={() => void refetchBanners()}
            onMove={moveBanner}
            onEdit={openEditBanner}
            onDelete={async (id) => {
              await deleteBanner.mutateAsync(id);
            }}
          />
        </div>
      ) : null}

      {tab === 'sponsors' ? (
        <div
          id={PLATFORM_SETTINGS_TAB_PANEL_IDS.sponsors}
          role="tabpanel"
          aria-labelledby="platform-settings-tab-sponsors"
        >
          <SponsorsPanel
            sponsors={sponsors}
            loading={loadingSponsors}
            error={sponsorsError}
            pending={sponsorPending}
            deletePending={deleteSponsor.isPending}
            reorderError={reorderSponsors.isError}
            deleteError={sponsorDeleteError}
            onRetry={() => void refetchSponsors()}
            onMove={moveSponsor}
            onEdit={openEditSponsor}
            onDelete={async (id) => {
              await deleteSponsor.mutateAsync(id);
            }}
          />
        </div>
      ) : null}

      {tab === 'ads' ? (
        <div
          id={PLATFORM_SETTINGS_TAB_PANEL_IDS.ads}
          role="tabpanel"
          aria-labelledby="platform-settings-tab-ads"
        >
          <AdsPanel
            ads={ads}
            loading={loadingAds}
            error={adsError}
            pending={adPending}
            deletePending={deleteAd.isPending}
            deleteError={adDeleteError}
            onRetry={() => void refetchAds()}
            onEdit={openEditAd}
            onDelete={async (id) => {
              await deleteAd.mutateAsync(id);
            }}
          />
        </div>
      ) : null}

      {tab === 'loginImages' ? (
        <div
          id={PLATFORM_SETTINGS_TAB_PANEL_IDS.loginImages}
          role="tabpanel"
          aria-labelledby="platform-settings-tab-loginImages"
        >
          <LoginImagesPanel />
        </div>
      ) : null}

      <BannerDialog
        open={bannerDialogOpen}
        editing={editingBanner}
        form={bannerForm}
        pending={bannerSavePending}
        submitError={bannerSubmitError}
        onOpenChange={(open) => {
          setBannerDialogOpen(open);
          if (!open) {
            setEditingBanner(null);
            createBanner.reset();
            updateBanner.reset();
          }
        }}
        onSubmit={onBannerSubmit}
      />

      <SponsorDialog
        open={sponsorDialogOpen}
        editing={editingSponsor}
        form={sponsorForm}
        pending={sponsorSavePending}
        submitError={sponsorSubmitError}
        onOpenChange={(open) => {
          setSponsorDialogOpen(open);
          if (!open) {
            setEditingSponsor(null);
            createSponsor.reset();
            updateSponsor.reset();
          }
        }}
        onSubmit={onSponsorSubmit}
      />

      <AdDialog
        open={adDialogOpen}
        editing={editingAd}
        form={adForm}
        pending={adSavePending}
        submitError={adSubmitError}
        onOpenChange={(open) => {
          setAdDialogOpen(open);
          if (!open) {
            setEditingAd(null);
            createAd.reset();
            updateAd.reset();
          }
        }}
        onSubmit={onAdSubmit}
      />
    </div>
  );
}
