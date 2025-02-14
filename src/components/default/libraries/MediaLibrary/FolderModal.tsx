import { useEffect, useMemo } from 'react';
import {
  Modal,
  TextField,
  Paper,
  Typography,
  IconButton,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaPost, mediaPut } from '@/lib/fetch';
import CloseIcon from '@mui/icons-material/Close';
import useNotification from '@/hooks/useNotification';
import dayjs from 'dayjs';
import type { IFolder } from './types';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  padding: '1rem 0',
};

interface IFormInputs {
  name: string;
  folder_id?: string;
}

interface IFolderModalProps {
  open: boolean;
  folderOprions: IOption[];
  name: string;
  slug?: string[];
  parentId: number | null;
  folder: IFolder | null;
  handleOpenDelete: (id: number) => void;
  handleClose: () => void;
}

export default function FolderModal({
  open,
  parentId,
  folder,
  name,
  slug,
  folderOprions,
  handleOpenDelete,
  handleClose,
}: IFolderModalProps) {
  const defaultFolder = {
    id: parentId ?? '0',
    name: name ?? 'Media Library',
  };
  const showNotification = useNotification();
  const {
    register,
    control,
    setValue,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>();

  const filteredFodlerOptions = useMemo(
    () => folderOprions.filter((elem) => elem.id !== folder?.id),
    [folderOprions, folder]
  );

  const queryClient = useQueryClient();

  const validateFolderName = (name: string) => {
    const clearedName = name.replace(/[^a-z\s]/gi, '').trim();
    return !!clearedName;
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => mediaPost('folders', data),
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [slug ? `media-folders-${slug.join('-')}` : 'media-folders'],
        }),
        queryClient.invalidateQueries({
          queryKey: [slug ? `media-assets-${slug.join('-')}` : 'media-assets'],
        }),
      ]);
      handleClose();
      showNotification('Successfully created', 'success');
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      showNotification(`${status}: ${error ?? 'Something went wrong'}`, 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => mediaPut(`folders/${folder?.id}`, data),
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [slug ? `media-folders-${slug.join('-')}` : 'media-folders'],
        }),
        queryClient.invalidateQueries({
          queryKey: [slug ? `media-assets-${slug.join('-')}` : 'media-assets'],
        }),
      ]);
      handleClose();
      showNotification('Successfully created', 'success');
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      showNotification(`${status}: ${error ?? 'Something went wrong'}`, 'error');
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = { ...data };
    if (!commonData?.folder_id || +commonData.folder_id === 0) {
      delete commonData.folder_id;
    }
    if (!validateFolderName(commonData.name)) {
      setError('name', { type: 'custom', message: 'Invalid folder name' });
      return;
    }
    if (folder) {
      updateMutation.mutate(commonData);
    } else {
      createMutation.mutate(commonData);
    }
  };

  useEffect(() => {
    if (folder) {
      setValue('name', folder.name);
    } else {
      setValue('name', '');
    }
    setValue('folder_id', parentId ? `${parentId}` : '0');
  }, [parentId, folder]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby='parent-modal-title'
      aria-describedby='parent-modal-description'
    >
      <Paper elevation={0} sx={{ ...style, minWidth: 375 }}>
        <Stack flexDirection='row' justifyContent='space-between' sx={{ padding: '0 5px' }}>
          <Typography variant='h5' textAlign='center' sx={{ width: '100%' }}>
            {folder ? 'Edit folder' : 'Add new folder'}
          </Typography>
          <IconButton color='error' size='small' onClick={handleClose}>
            <CloseIcon fontSize='small' />
          </IconButton>
        </Stack>
        <Divider />
        {folder && (
          <Stack
            flexDirection='row'
            alignItems='center'
            justifyContent='space-evenly'
            sx={{
              background: (theme) => theme.palette.primary.light,
              color: (theme) => theme.palette.common.white,
              padding: '1rem',
            }}
          >
            <Stack alignItems='center'>
              <Typography textTransform='uppercase'>Elements</Typography>
              <Typography variant='caption'>
                {folder.folders?.length ?? 0} folder, {folder?.assets ?? 0} assets
              </Typography>
            </Stack>
            <Stack alignItems='center'>
              <Typography textTransform='uppercase'>Creation Date</Typography>
              <Typography>{dayjs(folder?.createdAt).format('DD/MM/YYYY')}</Typography>
            </Stack>
          </Stack>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack
            flexDirection='row'
            gap='1rem'
            justifyContent='center'
            flexWrap='wrap'
            sx={{ padding: '1rem' }}
          >
            <TextField
              variant='standard'
              type='name'
              label='Name'
              InputLabelProps={{ shrink: true }}
              error={!!errors.name}
              helperText={errors.name?.message ?? ''}
              sx={{ minWidth: '15rem', flex: 1 }}
              fullWidth
              {...register('name')}
            />
            <Controller
              name='folder_id'
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <CustomSingleSelect
                    label='Folder'
                    field={field}
                    required
                    options={[defaultFolder, ...filteredFodlerOptions]}
                    error={error}
                    style={{
                      minWidth: '15rem',
                      flex: 1,
                    }}
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
            {folder && (
              <Button variant='outlined' color='error' onClick={() => handleOpenDelete(folder.id)}>
                Delete
              </Button>
            )}
            <Button variant='contained' type='submit'>
              {folder ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Modal>
  );
}
