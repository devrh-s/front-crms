import useNotification from '@/hooks/useNotification';
import { apiSetData } from '@/lib/fetch';
import type { IRootState } from '@/redux/store';
import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import CustomSingleSelect from '../../form/CustomSingleSelect/CustomSingleSelect';
import { getCommonData } from './commonData';

type EditsFields = 'edit_id' | 'status_id' | 'type';

interface IFormInputs {
  edit_id?: string;
  status_id?: string;
  type: string;
}

interface IEditsModalProps {
  open: boolean;
  handleClose: () => void;
}

export default function EditsModal({ open, handleClose }: IEditsModalProps) {
  const showNotification = useNotification();
  const { entityBlockId, progressableType, progressableId } = useSelector(
    (state: IRootState) => state.edits
  );
  const { control, setError, handleSubmit, reset } = useForm<IFormInputs>();

  const queryClient = useQueryClient();

  const { data: commonData } = useQuery({
    queryKey: ['edit-modal-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      countries: [],
      actions: [],
      currencies: [],
      pricings: [],
      users: [],
    },
  });

  const statuses = commonData?.statuses ?? [];
  const edits = commonData?.edits ?? [];
  const types = commonData?.types ?? [];

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as EditsFields;
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues[0]}`, 'error');
      setError(errorKey, error);
    }
  };

  const mutation = useMutation({
    mutationFn: (data: any) => apiSetData('edit-progress', data),
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['app-edits'],
        }),
        // queryClient.invalidateQueries({
        //   queryKey: [slug ? `media-assets-${slug.join('-')}` : 'media-assets'],
        // }),
      ]);
      handleClose();
      reset();
      showNotification('Successfully created', 'success');
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      handleErrors(error, status);
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData: any = {
      ...data,
    };
    if (entityBlockId) {
      commonData.entity_block_id = entityBlockId;
    } else {
      commonData.progressable_type = progressableType;
      commonData.progressable_id = progressableId;
    }
    mutation.mutate(commonData);
  };

  const handleCloseWithReset = () => {
    handleClose();
    reset();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseWithReset}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      sx={{
        '& .MuiPaper-root': {
          margin: 0,
        },
      }}
    >
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          position: 'relative',
          width: '90dvw',
          maxWidth: { xs: 375, md: 500 },
        }}
      >
        <IconButton
          color='error'
          size='small'
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: '.5rem',
            right: '.5rem',
          }}
        >
          <CloseIcon fontSize='small' />
        </IconButton>
        <Typography variant='h5' textTransform='uppercase' textAlign='center'>
          Add edits
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap='1rem'>
            <Controller
              name='edit_id'
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <CustomSingleSelect
                    label='Edits'
                    field={field}
                    link='/edits'
                    required
                    options={edits}
                    error={error}
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
                    label='Statuses'
                    link='/statuses'
                    field={field}
                    required
                    options={statuses}
                    error={error}
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
                    field={field}
                    required
                    options={types}
                    error={error}
                  />
                );
              }}
            />
          </Stack>

          <Divider />
          <Stack
            flexDirection='row'
            justifyContent='flex-end'
            gap='1rem'
            sx={{ padding: '1rem 1rem 0' }}
          >
            <Button onClick={handleClose}>Return</Button>

            <Button variant='contained' type='submit'>
              Add
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
