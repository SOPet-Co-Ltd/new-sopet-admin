import type { WizardStep } from '@/components/ui/stepper';

export type OnboardingPath = 'create' | 'join';

export type OnboardingStepId =
  | 'verify'
  | 'choose'
  | 'create-request'
  | 'waiting'
  | 'store-profile'
  | 'shipping'
  | 'payout'
  | 'first-product'
  | 'join-accept'
  | 'join-done'
  | 'done';

export type OnboardingReadiness = {
  shipping: boolean;
  publishedProduct: boolean;
  payout: boolean;
};

export type ResolveOnboardingStepInput = {
  emailVerified: boolean;
  path: OnboardingPath | null;
  hasPendingStoreRequest: boolean;
  hasStores: boolean;
  isOwner: boolean;
  readiness: OnboardingReadiness;
  skippedSetup: boolean;
  /** Session-only: user continued past store-profile review. */
  acknowledgedStoreProfile: boolean;
  /** Session-only: user marked first-product step done/skipped. */
  acknowledgedProduct: boolean;
};

export const CREATE_ONBOARDING_STEPS: WizardStep[] = [
  { label: 'ยืนยันอีเมล' },
  { label: 'เลือกทาง' },
  { label: 'ขอเปิดร้าน' },
  { label: 'รออนุมัติ' },
  { label: 'ข้อมูลร้าน' },
  { label: 'การจัดส่ง' },
  { label: 'รับเงิน' },
  { label: 'สินค้าแรก' },
  { label: 'เสร็จสิ้น' },
];

export const JOIN_ONBOARDING_STEPS: WizardStep[] = [
  { label: 'ยืนยันอีเมล' },
  { label: 'เลือกทาง' },
  { label: 'เข้าร่วมร้าน' },
  { label: 'เสร็จสิ้น' },
];

const CREATE_STEP_INDEX: Record<
  Extract<
    OnboardingStepId,
    | 'verify'
    | 'choose'
    | 'create-request'
    | 'waiting'
    | 'store-profile'
    | 'shipping'
    | 'payout'
    | 'first-product'
    | 'done'
  >,
  number
> = {
  verify: 1,
  choose: 2,
  'create-request': 3,
  waiting: 4,
  'store-profile': 5,
  shipping: 6,
  payout: 7,
  'first-product': 8,
  done: 9,
};

const JOIN_STEP_INDEX: Record<
  Extract<OnboardingStepId, 'verify' | 'choose' | 'join-accept' | 'join-done' | 'done'>,
  number
> = {
  verify: 1,
  choose: 2,
  'join-accept': 3,
  'join-done': 4,
  done: 4,
};

export function getOnboardingStepperSteps(path: OnboardingPath | null): WizardStep[] {
  if (path === 'join') return JOIN_ONBOARDING_STEPS;
  return CREATE_ONBOARDING_STEPS;
}

export function getOnboardingStepNumber(
  stepId: OnboardingStepId,
  path: OnboardingPath | null,
): number {
  if (path === 'join') {
    if (stepId in JOIN_STEP_INDEX) {
      return JOIN_STEP_INDEX[stepId as keyof typeof JOIN_STEP_INDEX];
    }
    return 1;
  }
  if (stepId in CREATE_STEP_INDEX) {
    return CREATE_STEP_INDEX[stepId as keyof typeof CREATE_STEP_INDEX];
  }
  return 1;
}

export type OnboardingPhaseId = 1 | 2 | 3;

export type OnboardingPhaseStatus = 'complete' | 'current' | 'upcoming';

export type OnboardingPhaseDefinition = {
  id: OnboardingPhaseId;
  label: string;
  reassurance: string;
};

export type OnboardingPhaseRailItem = OnboardingPhaseDefinition & {
  status: OnboardingPhaseStatus;
};

export type OnboardingChecklistItemStatus = 'complete' | 'current' | 'upcoming';

export type OnboardingChecklistItem = {
  stepId: OnboardingStepId;
  label: string;
  status: OnboardingChecklistItemStatus;
};

export const ONBOARDING_PHASES: OnboardingPhaseDefinition[] = [
  {
    id: 1,
    label: 'บัญชี',
    reassurance: 'ยืนยันอีเมลเพื่อเริ่มใช้งานบัญชีผู้ขายอย่างปลอดภัย',
  },
  {
    id: 2,
    label: 'ได้ร้าน',
    reassurance: 'เลือกทาง แล้วขอเปิดร้านหรือเข้าร่วมร้านที่มีอยู่',
  },
  {
    id: 3,
    label: 'พร้อมขาย',
    reassurance: 'ตั้งค่าสิ่งจำเป็นให้ร้านพร้อมรับออเดอร์',
  },
];

const CREATE_PHASE_STEPS: Record<OnboardingPhaseId, OnboardingStepId[]> = {
  1: ['verify'],
  2: ['choose', 'create-request', 'waiting'],
  3: ['store-profile', 'shipping', 'payout', 'first-product', 'done'],
};

const JOIN_PHASE_STEPS: Record<OnboardingPhaseId, OnboardingStepId[]> = {
  1: ['verify'],
  2: ['choose', 'join-accept'],
  3: ['join-done', 'done'],
};

const STEP_CHECKLIST_LABELS: Partial<Record<OnboardingStepId, string>> = {
  verify: 'ยืนยันอีเมล',
  choose: 'เลือกทาง',
  'create-request': 'ขอเปิดร้าน',
  waiting: 'รออนุมัติ',
  'store-profile': 'ข้อมูลร้าน',
  shipping: 'การจัดส่ง',
  payout: 'รับเงิน',
  'first-product': 'สินค้าแรก',
  done: 'เสร็จสิ้น',
  'join-accept': 'เข้าร่วมร้าน',
  'join-done': 'เสร็จสิ้น',
};

function phaseStepsForPath(
  path: OnboardingPath | null,
): Record<OnboardingPhaseId, OnboardingStepId[]> {
  if (path === 'join') return JOIN_PHASE_STEPS;
  return CREATE_PHASE_STEPS;
}

export function getOnboardingPhase(
  stepId: OnboardingStepId,
  path: OnboardingPath | null,
): OnboardingPhaseId {
  const phases = phaseStepsForPath(path);
  for (const phaseId of [1, 2, 3] as const) {
    if (phases[phaseId].includes(stepId)) {
      return phaseId;
    }
  }
  // join-done on create path (non-owner) maps to ready-to-sell
  if (stepId === 'join-done') return 3;
  return 1;
}

export function getPhaseRailState(
  stepId: OnboardingStepId,
  path: OnboardingPath | null,
): OnboardingPhaseRailItem[] {
  const currentPhase = getOnboardingPhase(stepId, path);
  return ONBOARDING_PHASES.map((phase) => {
    let status: OnboardingPhaseStatus = 'upcoming';
    if (phase.id < currentPhase) status = 'complete';
    else if (phase.id === currentPhase) status = 'current';
    return { ...phase, status };
  });
}

export function getInPhaseChecklist(
  stepId: OnboardingStepId,
  path: OnboardingPath | null,
): OnboardingChecklistItem[] {
  const phaseId = getOnboardingPhase(stepId, path);
  const steps = phaseStepsForPath(path)[phaseId];
  // Non-owner create path lands on join-done which isn't in CREATE_PHASE_STEPS[3]
  const checklistSteps =
    stepId === 'join-done' && path !== 'join' ? (['join-done'] as OnboardingStepId[]) : steps;
  const currentIndex = checklistSteps.indexOf(stepId);

  return checklistSteps.map((id, index) => {
    let status: OnboardingChecklistItemStatus = 'upcoming';
    if (currentIndex === -1) {
      status = 'upcoming';
    } else if (index < currentIndex) {
      status = 'complete';
    } else if (index === currentIndex) {
      status = 'current';
    }
    return {
      stepId: id,
      label: STEP_CHECKLIST_LABELS[id] ?? id,
      status,
    };
  });
}

export function getOnboardingPhaseMeta(
  stepId: OnboardingStepId,
  path: OnboardingPath | null,
): {
  phase: OnboardingPhaseDefinition;
  rail: OnboardingPhaseRailItem[];
  checklist: OnboardingChecklistItem[];
  currentTaskLabel: string;
} {
  const phaseId = getOnboardingPhase(stepId, path);
  const phase = ONBOARDING_PHASES[phaseId - 1]!;
  return {
    phase,
    rail: getPhaseRailState(stepId, path),
    checklist: getInPhaseChecklist(stepId, path),
    currentTaskLabel: STEP_CHECKLIST_LABELS[stepId] ?? stepId,
  };
}

export function resolveOnboardingStep(input: ResolveOnboardingStepInput): OnboardingStepId {
  if (!input.emailVerified) {
    return 'verify';
  }

  if (input.path == null) {
    return 'choose';
  }

  if (input.path === 'join') {
    if (!input.hasStores) {
      return 'join-accept';
    }
    return 'join-done';
  }

  // create path
  if (!input.hasStores) {
    if (input.hasPendingStoreRequest) {
      return 'waiting';
    }
    return 'create-request';
  }

  if (input.skippedSetup) {
    return 'done';
  }

  if (!input.isOwner) {
    return 'join-done';
  }

  const hasAnyReadinessProgress =
    input.readiness.shipping || input.readiness.payout || input.readiness.publishedProduct;
  const acknowledgedStoreProfile = input.acknowledgedStoreProfile || hasAnyReadinessProgress;

  if (!acknowledgedStoreProfile) {
    return 'store-profile';
  }
  if (!input.readiness.shipping) {
    return 'shipping';
  }
  if (!input.readiness.payout) {
    return 'payout';
  }
  if (!input.readiness.publishedProduct && !input.acknowledgedProduct) {
    return 'first-product';
  }

  return 'done';
}

export function shouldShowOnboardingResumeBanner(input: {
  hasStores: boolean;
  isOwner: boolean;
  skippedSetup: boolean;
  readiness: OnboardingReadiness;
}): boolean {
  if (!input.hasStores || !input.isOwner || input.skippedSetup) {
    return false;
  }
  return !(input.readiness.shipping && input.readiness.payout && input.readiness.publishedProduct);
}

export const ONBOARDING_STORAGE_KEY = 'sopet-vendor-onboarding';

export type OnboardingPersistedState = {
  path: OnboardingPath | null;
  skippedSetup: boolean;
};

export function readOnboardingPersistedState(): OnboardingPersistedState {
  if (typeof window === 'undefined') {
    return { path: null, skippedSetup: false };
  }
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return { path: null, skippedSetup: false };
    const parsed = JSON.parse(raw) as Partial<OnboardingPersistedState>;
    const path = parsed.path === 'create' || parsed.path === 'join' ? parsed.path : null;
    return {
      path,
      skippedSetup: parsed.skippedSetup === true,
    };
  } catch {
    return { path: null, skippedSetup: false };
  }
}

export function writeOnboardingPersistedState(state: OnboardingPersistedState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
}

export function clearOnboardingPersistedState(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}
