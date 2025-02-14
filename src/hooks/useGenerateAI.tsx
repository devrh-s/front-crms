import { useState } from 'react';
import { defaultGPTModal } from '@/components/default/common/modals/GPTModal/GPTModal';
import { useMutation } from '@tanstack/react-query';
import useNotification from './useNotification';
import { apiGetDataUnsafe, apiSetData } from '@/lib/fetch';
import { generateSearchParams } from '@/lib/helpers';

interface IGenerateAIData {
  url: string;
}

export default function useGenerateAI({ url }: IGenerateAIData) {
  const [gptModal, setGPTModal] = useState(defaultGPTModal);

  const showNotification = useNotification();

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as any;
      const errorValues = value as string[];
      const error = errorValues[0];
      showNotification(`${status}: ${error ?? 'Something went wrong'}`, 'error');
    }
  };

  const generateGPTMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const params = generateSearchParams(data);

      return apiGetDataUnsafe(`${url}?${params}`);
    },
    onSuccess: (result) => {
      const { answer, thread_id, link } = result;
      setGPTModal({ open: true, answer, link, thread_id });
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      handleErrors(error, status);
    },
  });

  const handleCloseGPT = () => {
    setGPTModal(defaultGPTModal);
  };

  const generateResponse = (data: Record<string, any>) => generateGPTMutation.mutate(data);

  return {
    gptModal,
    responseGenerating: generateGPTMutation.isPending,
    handleCloseGPT,
    generateResponse,
  };
}
