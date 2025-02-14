import { apiGetData } from '@/lib/fetch';
import { useQueryClient } from '@tanstack/react-query';
import useNotification from './useNotification';

export const useCopyToClipboard = () => {
  const queryClient = useQueryClient();
  const showNotification = useNotification();

  const handleClickCopy = async (url: string) => {
    try {
      const response = await queryClient.fetchQuery({
        queryKey: [url],
        queryFn: async () => {
          const response = await apiGetData(url);
          return response.data;
        },
      });

      const json = JSON.stringify(response, null, 2);
      await navigator.clipboard.writeText(json);

      showNotification('Row copied to clipboard!', 'success');
    } catch (err) {
      showNotification(`Failed to copy row: ${err}`, 'error');
    }
  };

  return handleClickCopy;
};
