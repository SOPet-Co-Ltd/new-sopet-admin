'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEmailContainer,
  getEmailContainer,
  getEmailContainers,
  getEmailContentTemplateByKey,
  getEmailContentTemplates,
  previewEmailContentTemplate,
  sendTestEmailContentTemplate,
  setDefaultEmailContainer,
  updateEmailContainer,
  updateEmailContentTemplate,
  type CreateEmailContainerInput,
  type EmailTemplateKey,
  type PreviewEmailContentTemplateInput,
  type SendTestEmailContentTemplateInput,
  type UpdateEmailContainerInput,
  type UpdateEmailContentTemplateInput,
} from '@/lib/api/email-cms';
import { queryKeys } from '@/lib/react-query/keys';

export function useEmailContainers() {
  return useQuery({
    queryKey: queryKeys.emailCms.containers(),
    queryFn: getEmailContainers,
  });
}

export function useEmailContainer(id: string) {
  return useQuery({
    queryKey: queryKeys.emailCms.container(id),
    queryFn: () => getEmailContainer(id),
    enabled: !!id,
  });
}

export function useCreateEmailContainer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEmailContainerInput) => createEmailContainer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailCms.all });
    },
  });
}

export function useUpdateEmailContainer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEmailContainerInput }) =>
      updateEmailContainer(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailCms.all });
    },
  });
}

export function useSetDefaultEmailContainer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => setDefaultEmailContainer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailCms.all });
    },
  });
}

export function useEmailContentTemplates() {
  return useQuery({
    queryKey: queryKeys.emailCms.contentTemplates(),
    queryFn: getEmailContentTemplates,
  });
}

export function useEmailContentTemplateByKey(key: EmailTemplateKey | undefined) {
  return useQuery({
    queryKey: queryKeys.emailCms.contentTemplateByKey(key ?? ''),
    queryFn: () => getEmailContentTemplateByKey(key!),
    enabled: !!key,
  });
}

export function useUpdateEmailContentTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEmailContentTemplateInput }) =>
      updateEmailContentTemplate(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailCms.all });
    },
  });
}

export function usePreviewEmailContentTemplate() {
  return useMutation({
    mutationFn: (input: PreviewEmailContentTemplateInput) => previewEmailContentTemplate(input),
  });
}

export function useSendTestEmailContentTemplate() {
  return useMutation({
    mutationFn: (input: SendTestEmailContentTemplateInput) => sendTestEmailContentTemplate(input),
  });
}
