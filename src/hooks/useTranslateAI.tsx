import { useRef, useState } from 'react';
import { defaultGPTModal } from '@/components/default/common/modals/GPTModal/GPTModal';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import useNotification from './useNotification';
import { apiGetDataUnsafe, apiSetData } from '@/lib/fetch';

interface ITranslateAIData {
  invalidationQueryKey: string;
  translationId?: number | string;
}

export default function useTranslateAI({ invalidationQueryKey, translationId }: ITranslateAIData) {
  const [gptModal, setGPTModal] = useState(defaultGPTModal);
  const translatedLibraryId = useRef<number | string | null>(null);
  const queryClient = useQueryClient();

  const showNotification = useNotification();

  const translateGPTMutation = useMutation({
    mutationFn: async (data: { libraryId?: number | string; translationId?: number | string }) => {
      const { libraryId, translationId } = data;

      const params = new URLSearchParams();
      if (libraryId) params.append('library_id', `${libraryId}`);
      if (translationId) params.append('translation_id', `${translationId}`);

      return apiGetDataUnsafe(`openai/library-translation?${params}`);
    },
    onSuccess: (result) => {
      const { answer, thread_id, link } = result;
      setGPTModal({ open: true, answer, link, thread_id });
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      // const { error } = responseError.response?.data;
      showNotification(`${status}: Something went wrong`, 'error');
    },
  });

  const saveLibraryMutation = useMutation({
    mutationFn: async (data: {
      libraryId: number | string;
      translationId: number | string;
      name: string;
    }) => {
      const { libraryId, translationId, name } = data;
      return apiSetData('libraries', {
        translation_id: translationId,
        library_id: libraryId,
        name,
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [invalidationQueryKey],
        });
      }
      showNotification(`Successfully saved`, 'success');
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      showNotification(`${status}: Something went wrong`, 'error');
    },
  });

  const handleSaveLibrary = (name?: string) => {
    if (translatedLibraryId.current && translationId && name) {
      saveLibraryMutation.mutate({ libraryId: translatedLibraryId.current, translationId, name });
    }
  };

  const handleCloseGPT = () => {
    translatedLibraryId.current = null;
    setGPTModal(defaultGPTModal);
  };

  const translateLibrary = (libraryId?: number | string) => {
    if (libraryId && translationId) {
      translatedLibraryId.current = libraryId;
      translateGPTMutation.mutate({ libraryId, translationId });
    }
  };

  return {
    gptModal,
    translationLoading: translateGPTMutation.isPending,
    handleCloseGPT,
    handleSaveLibrary,
    translateLibrary,
  };
}
