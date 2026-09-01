import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  CreateSaleCampaignDocument,
  DeleteSaleCampaignDocument,
  StoreSaleCampaignsDocument,
  ToggleSaleCampaignDocument,
  UpdateSaleCampaignDocument,
  type CreateSaleCampaignMutation,
  type DeleteSaleCampaignMutation,
  type StoreSaleCampaignsQuery,
  type ToggleSaleCampaignMutation,
  type UpdateSaleCampaignMutation,
} from '@/lib/graphql/generated/graphql';
import { mapSaleCampaign } from '@/lib/graphql/mappers';
import type { CreateSaleCampaignInput, SaleCampaign, UpdateSaleCampaignInput } from '@/types';

export function getStoreSaleCampaigns(storeId: string): Promise<SaleCampaign[]> {
  return executeQuery<StoreSaleCampaignsQuery>(StoreSaleCampaignsDocument, { storeId }).then(
    (data) => data.storeSaleCampaigns.map(mapSaleCampaign),
  );
}

export function createSaleCampaign(input: CreateSaleCampaignInput): Promise<SaleCampaign> {
  return executeMutation<CreateSaleCampaignMutation>(CreateSaleCampaignDocument, {
    input,
  }).then((data) => mapSaleCampaign(data.createSaleCampaign));
}

export function updateSaleCampaign(
  id: string,
  input: UpdateSaleCampaignInput,
): Promise<SaleCampaign> {
  return executeMutation<UpdateSaleCampaignMutation>(UpdateSaleCampaignDocument, {
    id,
    input,
  }).then((data) => mapSaleCampaign(data.updateSaleCampaign));
}

export function deleteSaleCampaign(id: string): Promise<boolean> {
  return executeMutation<DeleteSaleCampaignMutation>(DeleteSaleCampaignDocument, { id }).then(
    (data) => data.deleteSaleCampaign,
  );
}

export function toggleSaleCampaign(id: string, isActive: boolean): Promise<SaleCampaign> {
  return executeMutation<ToggleSaleCampaignMutation>(ToggleSaleCampaignDocument, {
    id,
    isActive,
  }).then((data) => mapSaleCampaign(data.toggleSaleCampaign));
}
