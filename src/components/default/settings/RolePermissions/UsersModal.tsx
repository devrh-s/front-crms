import { useState, useMemo, ChangeEvent } from 'react';
import useNotification from '@/hooks/useNotification';
import {
  Modal,
  Button,
  IconButton,
  Box,
  Stack,
  Typography,
  useMediaQuery,
  Theme,
} from '@mui/material';
import UserChip from '../../common/components/UserChip';
import CustomSelect from '../../common/form/CustomSelect/CustomSelect';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { apiUpdateData } from '@/lib/fetch';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { IRolePermission } from './types';

interface IManageModalProps {
  open: boolean;
  role: IRolePermission | null;
  commonData: ICommonData;
  handleClose: () => void;
}

export default function UsersModal({ open, role, commonData, handleClose }: IManageModalProps) {
  const showNotification = useNotification();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: { users: number[] }) =>
      apiUpdateData(`role-permissions/${role?.id}/users`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['role-permissions'],
        });
        showNotification('Successfully expand selected role', 'success');
        handleClose();
        setSelectedUsers([]);
      }
    },
  });

  const users = commonData?.users ?? [];

  const members: Array<IUser> = useMemo(
    () =>
      users
        .filter((el) => role?.employees.includes(+el?.id))
        .map((el) => ({ id: +el.id, name: el.name })),
    [role]
  );

  const restUsers = useMemo(() => users.filter((el) => !role?.employees.includes(+el?.id)), [role]);

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
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: !mdDown ? '50dvw' : '90dvw',
          backgroundColor: 'background.paper',
          borderRadius: '.5rem',
          boxShadow: 24,
          padding: 2,
        }}
      >
        <Stack>
          <Typography variant='h5' textAlign='center'>
            {role?.name}
          </Typography>
          <Typography textAlign='center' sx={{ opacity: '0.37' }}>
            {role?.total_employees} {role?.total_employees === 1 ? 'Member' : 'Members'}
          </Typography>
        </Stack>
        <Stack flexDirection='row' flexWrap='wrap' gap='.5rem'>
          {members?.map((member) => <UserChip key={member?.id} data={member} />)}
        </Stack>
        <Stack flexDirection='row' gap='1rem'>
          <CustomSelect
            type='Users'
            options={restUsers}
            value={selectedUsers}
            handleChange={(ids: number[]) => setSelectedUsers(ids)}
          />
          <Button
            startIcon={<AddIcon />}
            type='submit'
            variant='contained'
            sx={{ minWidth: '6rem', alignSelf: 'flex-end' }}
            onClick={() => updateMutation.mutate({ users: selectedUsers })}
          >
            Add
          </Button>
        </Stack>
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
      </Box>
    </Modal>
  );
}
