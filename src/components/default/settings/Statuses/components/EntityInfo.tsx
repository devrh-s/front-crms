import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiUpdateData } from '@/lib/fetch';
import { Box, Button, Stack } from '@mui/material';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { IEntityInfoProps } from '../types';

const availabilities = [
  { id: 0, name: 'No' },
  { id: 1, name: 'Yes' },
];

export default function EntityInfo({
  status_id,
  id,
  is_default,
  setInfoModal,
  order,
}: IEntityInfoProps) {
  const [isDefault, setIsDefault] = useState(is_default);
  const [orderId, setOrderId] = useState(order);
  const showNotification = useNotification();
  const queryClient = useQueryClient();
  const { data: orders } = useQuery({
    queryKey: ['entityInfo'],
    queryFn: async () => {
      const response = await apiGetData(`statuses/${status_id}/entity-block/${id}/orders`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setOrderId(order);
  }, [orders]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) =>
      apiUpdateData(`statuses/${status_id}/entity-block/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        showNotification('Successfully updated', 'success');
        queryClient.invalidateQueries({
          queryKey: ['statuses'],
        });
        setInfoModal(null);
      }
    },
  });

  const onClickSave = () => {
    updateMutation.mutate({
      is_default: isDefault,
      order: orderId,
    });
  };

  if (!orders) {
    return null;
  }

  return (
    <Stack alignItems={'center'} gap={1}>
      <Box
        sx={{
          display: 'flex',
          gap: '0.6rem',
          flexDirection: 'row',
          borderRadius: '0.5rem',
          backgroundColor: '#EBEBEB',
          p: '1rem',
          width: '100%',
        }}
      >
        <CustomSingleSelect
          label='Is Default'
          field={{ value: isDefault, onChange: setIsDefault }}
          required
          options={availabilities}
          style={{
            width: '50%',
          }}
        />
        <CustomSingleSelect
          label='Order'
          field={{ value: orderId, onChange: setOrderId }}
          required
          options={orders?.data}
          style={{
            width: '50%',
          }}
        />
      </Box>
      <Button variant='contained' onClick={onClickSave}>
        Save
      </Button>
    </Stack>
  );
}
