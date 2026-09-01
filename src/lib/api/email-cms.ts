import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  CreateEmailContainerDocument,
  EmailContainerDocument,
  EmailContainersDocument,
  EmailContentTemplateByKeyDocument,
  EmailContentTemplatesDocument,
  PreviewEmailContentTemplateDocument,
  SendTestEmailContentTemplateDocument,
  SetDefaultEmailContainerDocument,
  UpdateEmailContainerDocument,
  UpdateEmailContentTemplateDocument,
  type CreateEmailContainerInput,
  type CreateEmailContainerMutation,
  type EmailContainerQuery,
  type EmailContainersQuery,
  type EmailContentTemplateByKeyQuery,
  type EmailContentTemplatesQuery,
  type EmailTemplateKey,
  type PreviewEmailContentTemplateInput,
  type PreviewEmailContentTemplateMutation,
  type SendTestEmailContentTemplateInput,
  type SendTestEmailContentTemplateMutation,
  type SetDefaultEmailContainerMutation,
  type UpdateEmailContainerInput,
  type UpdateEmailContainerMutation,
  type UpdateEmailContentTemplateInput,
  type UpdateEmailContentTemplateMutation,
} from '@/lib/graphql/generated/graphql';

export type EmailContainer = EmailContainersQuery['emailContainers'][number];
export type EmailContentTemplate = EmailContentTemplatesQuery['emailContentTemplates'][number];
export type EmailPlaceholderInfo = EmailContentTemplate['allowedPlaceholders'][number];
export type EmailPreviewResult = PreviewEmailContentTemplateMutation['previewEmailContentTemplate'];

export type {
  CreateEmailContainerInput,
  EmailTemplateKey,
  PreviewEmailContentTemplateInput,
  SendTestEmailContentTemplateInput,
  UpdateEmailContainerInput,
  UpdateEmailContentTemplateInput,
};

export function getEmailContainers(): Promise<EmailContainer[]> {
  return executeQuery<EmailContainersQuery>(EmailContainersDocument).then(
    (data) => data.emailContainers,
  );
}

export function getEmailContainer(id: string): Promise<EmailContainer | null> {
  return executeQuery<EmailContainerQuery>(EmailContainerDocument, { id }).then(
    (data) => data.emailContainer ?? null,
  );
}

export function createEmailContainer(input: CreateEmailContainerInput): Promise<EmailContainer> {
  return executeMutation<CreateEmailContainerMutation>(CreateEmailContainerDocument, {
    input,
  }).then((data) => data.createEmailContainer);
}

export function updateEmailContainer(
  id: string,
  input: UpdateEmailContainerInput,
): Promise<EmailContainer> {
  return executeMutation<UpdateEmailContainerMutation>(UpdateEmailContainerDocument, {
    id,
    input,
  }).then((data) => data.updateEmailContainer);
}

export function setDefaultEmailContainer(id: string): Promise<EmailContainer> {
  return executeMutation<SetDefaultEmailContainerMutation>(SetDefaultEmailContainerDocument, {
    id,
  }).then((data) => data.setDefaultEmailContainer);
}

export function getEmailContentTemplates(): Promise<EmailContentTemplate[]> {
  return executeQuery<EmailContentTemplatesQuery>(EmailContentTemplatesDocument).then(
    (data) => data.emailContentTemplates,
  );
}

export function getEmailContentTemplateByKey(
  key: EmailTemplateKey,
): Promise<EmailContentTemplate | null> {
  return executeQuery<EmailContentTemplateByKeyQuery>(EmailContentTemplateByKeyDocument, {
    key,
  }).then((data) => data.emailContentTemplateByKey ?? null);
}

export function updateEmailContentTemplate(
  id: string,
  input: UpdateEmailContentTemplateInput,
): Promise<EmailContentTemplate> {
  return executeMutation<UpdateEmailContentTemplateMutation>(UpdateEmailContentTemplateDocument, {
    id,
    input,
  }).then((data) => data.updateEmailContentTemplate);
}

export function previewEmailContentTemplate(
  input: PreviewEmailContentTemplateInput,
): Promise<EmailPreviewResult> {
  return executeMutation<PreviewEmailContentTemplateMutation>(
    PreviewEmailContentTemplateDocument,
    { input },
    { skipCacheReset: true },
  ).then((data) => data.previewEmailContentTemplate);
}

export function sendTestEmailContentTemplate(
  input: SendTestEmailContentTemplateInput,
): Promise<boolean> {
  return executeMutation<SendTestEmailContentTemplateMutation>(
    SendTestEmailContentTemplateDocument,
    { input },
  ).then((data) => data.sendTestEmailContentTemplate);
}
