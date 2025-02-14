import useActions from '@/hooks/useActions';
import useNotification from '@/hooks/useNotification';
import { apiSetData, apiUpdateData } from '@/lib/fetch';
import CachedIcon from '@mui/icons-material/Cached';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Modal,
  Stack,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import DeleteModal from '../../common/modals/DeleteModal/DeleteModal';
import { IRolePermission } from './types';

interface IManageModalProps {
  open: boolean;
  commonData: ICommonData;
  roles: Array<IRolePermission>;
  handleClose: () => void;
}

interface IRolesTableProps {
  roles: Array<IRolePermission>;
  showNotification: (text: string, type: 'success' | 'error') => void;
  isEdit: { id: number; edit: boolean } | null;
  setIsEdit: Dispatch<SetStateAction<{ id: number; edit: boolean } | null>>;
}

interface IFormRole {
  roles: Array<IRolePermission>;
  commonData: ICommonData;
  handleClose: () => void;
  showNotification: (text: string, type: 'success' | 'error') => void;
  isEdit: { id: number; edit: boolean } | null;
  setIsEdit: Dispatch<SetStateAction<{ id: number; edit: boolean } | null>>;
}

interface IRoleInputs {
  profession_id: string | number;
  position_id: string | number;
  display_name: string;
  description: string;
  role_id: number | string;
}

const defaultRoles = ['admin', 'employee'];

function RolesTable({ roles, showNotification, isEdit, setIsEdit }: IRolesTableProps) {
  const queryClient = useQueryClient();
  const xlDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('xl'));
  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const { deleteModal, handleDeleteModal, handleClose } = useActions();

  const resetMutation = useMutation({
    mutationFn: (id: number) => apiUpdateData(`role-permissions/${id}/reset`),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['role-permissions'],
        });
        showNotification('Role permissions sucessfully reseted', 'success');
      }
    },
  });

  return (
    <Stack gap='1rem' sx={{ paddingBottom: '1rem' }}>
      <Stack
        flexDirection='row'
        sx={{ backgroundColor: '#e0e0e0', borderRadius: '4px', padding: '.5rem' }}
      >
        <Box sx={{ width: '2rem' }}>#</Box>
        <Box sx={{ width: 'calc(100% / 2 - 1rem)' }}>UserRole</Box>
        <Box sx={{ width: 'calc(100% / 2 - 1rem)', textAlign: 'end' }}>Action</Box>
      </Stack>
      {roles.map((role) => (
        <Stack
          flexDirection={smDown ? 'column' : 'row'}
          alignItems={smDown ? 'flex-start' : 'center'}
          key={role.id}
          gap={smDown ? '.5rem' : 'inherit'}
          sx={{
            padding: '.5rem',
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          }}
        >
          <Box
            display={'flex'}
            sx={{ width: !smDown ? 'calc(100% / 2 - 1rem)' : 'calc(100% - 2rem)' }}
          >
            <Typography sx={{ width: '2rem' }}>{role.id}</Typography>
            <Typography>{role.name}</Typography>
          </Box>

          <Stack
            flexDirection='row'
            sx={{
              width: 'calc(100% / 2 - 1rem)',
              display: 'flex',
            }}
            gap={smDown ? '0.3rem' : '1rem'}
            alignItems='center'
            justifyContent={smDown ? 'flex-start' : 'flex-end'}
          >
            {!defaultRoles.includes(role.display_name) ? (
              <>
                <Button
                  variant={isEdit?.id === role.id ? 'contained' : 'outlined'}
                  startIcon={<EditIcon />}
                  onClick={() => setIsEdit({ id: role.id, edit: true })}
                  sx={{
                    textTransform: 'capitalize',
                    minWidth: 'inherit',
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant='outlined'
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteModal(true, [role.id])}
                  sx={{
                    textTransform: 'capitalize',
                    minWidth: 'inherit',
                  }}
                >
                  Delete
                </Button>
              </>
            ) : (
              <Typography color='#e0e0e0' sx={{ display: !xlDown ? 'block' : 'none' }}>
                Default role can not be deleted
              </Typography>
            )}
            {role.display_name !== 'admin' && (
              <Button
                variant='outlined'
                startIcon={<CachedIcon />}
                onClick={() => resetMutation.mutate(role.id)}
                sx={{
                  textTransform: 'capitalize',
                  alignSelf: 'flex-end',
                  minWidth: 'inherit',
                }}
              >
                <Typography whiteSpace={'nowrap'}>
                  {smDown ? 'Reset' : 'Reset permissions'}
                </Typography>
              </Button>
            )}
          </Stack>
        </Stack>
      ))}
      <DeleteModal
        rows={roles}
        open={deleteModal.open}
        ids={deleteModal.ids}
        query='role-permissions'
        url='role-permissions'
        handleClose={handleClose}
      />
    </Stack>
  );
}

function FormRole({
  roles,
  commonData,
  handleClose,
  showNotification,
  isEdit,
  setIsEdit,
}: IFormRole) {
  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const {
    register,
    reset,
    control,
    setError,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<IRoleInputs>({
    defaultValues: {
      display_name: '',
      description: '',
      role_id: '',
    },
  });

  useEffect(() => {
    if (isEdit?.edit) {
      const role = roles.find((role) => role.id === isEdit.id);
      reset({
        display_name: role?.display_name,
        position_id: role?.position?.position_id,
        profession_id: role?.profession?.profession_id,
        description: role?.description,
        role_id: role?.id,
      });
    }
  }, [isEdit]);

  const queryClient = useQueryClient();

  const clearData = () => {
    reset({
      display_name: '',
      description: '',
      role_id: '',
      position_id: '',
      profession_id: '',
    });
  };

  useEffect(() => {
    const positionId = watch('position_id');
    const professionId = watch('profession_id');

    const getNameById = (items?: IOption[], id?: string | number) =>
      items?.find((el) => el.id === id)?.name ?? '';

    const positionName = getNameById(commonData?.positions, positionId);
    const professionName = getNameById(commonData?.professions, professionId);

    setValue('display_name', `${professionName} ${positionName}`);
  }, [watch('position_id'), watch('profession_id')]);

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as 'display_name';
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues[0]}`, 'error');
      setError(errorKey, error);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiUpdateData(`role-permissions/${isEdit?.id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['role-permissions'],
        });
        setIsEdit(null);
        showNotification('Successfully created', 'success');
        clearData();
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
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiSetData('role-permissions', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['role-permissions'],
        });
        showNotification('New role sucessfully created', 'success');
        handleClose();
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
    },
  });

  const onSubmit: SubmitHandler<IRoleInputs> = async (data) => {
    if (isEdit?.edit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const submitHandler = handleSubmit(onSubmit);

  const handleCancel = () => {
    clearData();
    setIsEdit(null);
  };

  return (
    <form
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '1rem 0',
      }}
      autoComplete='off'
      onSubmit={submitHandler}
    >
      <Stack flexDirection={'row'} gap={1} width={'100%'}>
        <Controller
          name='profession_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Profession'
                field={field}
                required
                options={commonData?.professions ?? []}
                error={error}
                style={{
                  width: '100%',
                }}
              />
            );
          }}
        />
        <Controller
          name='position_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Position'
                field={field}
                required
                options={commonData?.positions ?? []}
                error={error}
                style={{
                  width: '100%',
                }}
              />
            );
          }}
        />
      </Stack>
      <Stack flexDirection='row' gap='1rem' sx={{ width: '100%' }} flexWrap='wrap'>
        <TextField
          variant='standard'
          InputLabelProps={{ shrink: true }}
          {...register('display_name')}
          label={<CustomLabel label={'Name'} required />}
          error={!!errors.display_name}
          disabled
          helperText={errors.display_name ? errors.display_name?.message : ''}
          sx={{
            width: !smDown && !isEdit ? 'calc(70% - .5rem)' : '100%',
          }}
        />
        {!isEdit && (
          <Controller
            name='role_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Import from Role'
                  field={field}
                  options={roles}
                  style={{
                    minWidth: !smDown ? 'calc(30% - .5rem)' : '100%',
                  }}
                />
              );
            }}
          />
        )}
      </Stack>
      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('description')}
        label={<CustomLabel label={'Description'} />}
        sx={{
          width: '100%',
        }}
      />
      <Divider />
      <Stack flexDirection='row' sx={{ alignSelf: 'flex-end' }}>
        {isEdit?.edit ? (
          <Button variant='text' onClick={handleCancel}>
            Cancel
          </Button>
        ) : (
          <Button variant='text' onClick={handleClose}>
            Close
          </Button>
        )}

        <Button type='submit' variant='contained'>
          Save
        </Button>
      </Stack>
    </form>
  );
}

export default function ManageModal({ open, roles, commonData, handleClose }: IManageModalProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const showNotification = useNotification();
  const [isEdit, setIsEdit] = useState<{ id: number; edit: boolean } | null>(null);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: mdDown ? '90dvw' : '60dvw',
          backgroundColor: 'background.paper',
          borderRadius: '.5rem',
          boxShadow: 24,
          padding: 2,
          overflowX: 'scroll',
          maxHeight: '95%',
        }}
      >
        <Stack>
          <Typography variant='h5'>Manage Role</Typography>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              width: 'min-content',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider orientation='horizontal' flexItem />
        <RolesTable
          roles={roles}
          showNotification={showNotification}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
        />
        <Divider />
        <FormRole
          roles={roles}
          handleClose={handleClose}
          showNotification={showNotification}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          commonData={commonData}
        />
      </Box>
    </Modal>
  );
}
