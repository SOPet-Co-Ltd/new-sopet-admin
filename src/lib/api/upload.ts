import { UPLOAD_IMAGE } from '@/lib/graphql/documents';
import { executeMutation } from '@/lib/graphql/client';
import {
  FOLDER_UPLOAD_RULES,
  getFolderUploadRules,
  isAspectRatioWithinTolerance,
  UPLOAD_FOLDERS,
  type UploadFolder,
} from '@/lib/api/upload.rules';

export { UPLOAD_FOLDERS, type UploadFolder, getFolderUploadRules } from '@/lib/api/upload.rules';

export const ACCEPTED_IMAGE_TYPES = FOLDER_UPLOAD_RULES.products.acceptedTypes;
export const MAX_IMAGE_SIZE_BYTES = FOLDER_UPLOAD_RULES.products.maxSizeBytes;

export const imageUploadMessages = {
  invalidType: FOLDER_UPLOAD_RULES.products.messages.invalidType,
  tooLarge: FOLDER_UPLOAD_RULES.products.messages.tooLarge,
  invalidAspectRatio: FOLDER_UPLOAD_RULES.products.messages.invalidAspectRatio,
  failed: 'อัปโหลดรูปภาพไม่สำเร็จ',
  required: 'กรุณาเลือกรูปภาพ',
} as const;

export function validateImageFile(file: File, folder: UploadFolder): string | null {
  const rules = getFolderUploadRules(folder);

  if (!rules.acceptedTypes.includes(file.type as (typeof rules.acceptedTypes)[number])) {
    return rules.messages.invalidType;
  }

  if (file.size > rules.maxSizeBytes) {
    return rules.messages.tooLarge;
  }

  return null;
}

export function validateImageAspectRatio(file: File, folder: UploadFolder): Promise<string | null> {
  const rules = getFolderUploadRules(folder);
  if (!rules.aspectRatio) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      const isValid = isAspectRatioWithinTolerance(
        image.naturalWidth,
        image.naturalHeight,
        rules.aspectRatio!,
      );
      resolve(isValid ? null : rules.messages.invalidAspectRatio);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(imageUploadMessages.failed);
    };

    image.src = url;
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error(imageUploadMessages.failed));
      }
    };
    reader.onerror = () => reject(new Error(imageUploadMessages.failed));
    reader.readAsDataURL(file);
  });
}

export async function uploadImageFile(
  file: File,
  folder: UploadFolder,
): Promise<{ url: string; key: string }> {
  const validationError = validateImageFile(file, folder);
  if (validationError) {
    throw new Error(validationError);
  }

  const aspectRatioError = await validateImageAspectRatio(file, folder);
  if (aspectRatioError) {
    throw new Error(aspectRatioError);
  }

  const base64 = await readFileAsDataUrl(file);
  const data = await executeMutation<{ uploadImage: { url: string; key: string } }>(UPLOAD_IMAGE, {
    base64,
    folder,
  });

  return data.uploadImage;
}
