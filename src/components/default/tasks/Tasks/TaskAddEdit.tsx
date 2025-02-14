import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Modal from '../../common/modals/Modal/Modal';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import { Box, Button, Stack } from '@mui/material';
import useNotification from '@/hooks/useNotification';
import { useState, useEffect, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiSetData } from '@/lib/fetch';

type TaskAddEditsFields = 'edit_id' | 'status_id' | 'type';

interface IFormInputs {
  edit_id: number | string;
  status_id: number | string;
  type: string;
}
interface ITaskAddEditsProps {
  step: IStep | null;
  commonData: ICommonData;
  setStepModal: any;
}
export default function TaskAddEdit({ commonData, step, setStepModal }: ITaskAddEditsProps) {
  const showNotification = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const {
    reset,
    handleSubmit,
    control,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      status_id: '',
      edit_id: '',
      type: '',
    },
  });
  const edits = commonData.edits ?? [];
  const edit_statuses = commonData.edit_statuses ?? [];
  const edit_progress_types = commonData.edit_progress_types ?? [];

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as TaskAddEditsFields;
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues[0]}`, 'error');
      setError(errorKey, error);
    }
  };
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async (data: any) => apiSetData(`steps/${data.id}/edit-progress`, data.data),
    onSuccess: (result) => {
      if (result.success) {
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['tasks'],
          }),
          queryClient.invalidateQueries({
            queryKey: ['task'],
          }),
        ]);

        showNotification(result.message, 'success');
        reset({
          edit_id: '',
          status_id: '',
          type: '',
        });
        setIsLoading(false);
        setStepModal(null);
      }
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      if (status === 422) {
        handleErrors(error, status);
      } else {
        showNotification(`${status}: Something went wrong`, 'error');
      }
      setIsLoading(false);
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (step) {
      setIsLoading(true);
      const newData = { id: step.id, data };
      createMutation.mutate(newData);
    }
  };
  const submitHandler = handleSubmit(onSubmit);
  const submitForm = (e: FormEvent) => {
    e.preventDefault();
    clearErrors();
    submitHandler();
  };
  return (
    <Modal
      title={`Add edit for ${step?.name}`}
      open={!!step?.name}
      handleClose={() => setStepModal(null)}
    >
      <Stack gap={'1rem'}>
        <Controller
          name='edit_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Edit'
                link='/edits'
                field={field}
                required
                options={edits}
                error={error}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                }}
              />
            );
          }}
        />
        <Controller
          name='status_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Status'
                link='/edits'
                field={field}
                required
                options={edit_statuses}
                error={error}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                }}
              />
            );
          }}
        />
        <Controller
          name='type'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Type'
                link='/edits'
                field={field}
                required
                options={edit_progress_types}
                error={error}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                }}
              />
            );
          }}
        />
      </Stack>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          pt: '3rem',
        }}
      >
        <Button
          disabled={isLoading}
          sx={{
            minWidth: '240px',
          }}
          variant='contained'
          onClick={submitForm}
        >
          Submit
        </Button>
      </Box>
    </Modal>
  );
}
