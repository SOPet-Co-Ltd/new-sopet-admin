'use client';

import { useCallback, useState } from 'react';
import { imageUploadMessages, uploadImageFile, type UploadFolder } from '@/lib/api/upload';

export function useImageUpload(folder: UploadFolder) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);
      try {
        return await uploadImageFile(file, folder);
      } catch (err) {
        const message = err instanceof Error ? err.message : imageUploadMessages.failed;
        setError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [folder],
  );

  const clearError = useCallback(() => setError(null), []);
  const setErrorMessage = useCallback((message: string) => setError(message), []);

  return { upload, isUploading, error, clearError, setError: setErrorMessage };
}
