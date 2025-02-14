import { apiGetData } from '@/lib/fetch';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import KeyIcon from '@mui/icons-material/Key';
import { LoadingButton } from '@mui/lab';
import { IconButton, Paper, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import RolePermissionsTable from './RolePermissionsTable';
import { IRolePermission } from './types';
import UsersModal from './UsersModal';

interface IRolePermissionsListProps {
  rolePermissions?: Array<IRolePermission>;
  commonData: ICommonData;
}

export default function RolePermissionsList({
  rolePermissions,
  commonData,
}: IRolePermissionsListProps) {
  const [visiblePermId, setVisiblePermId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<IRolePermission | null>(null);
  const usersModalOpen = !!selectedRole;
  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const { data: visibleRolesPermissions, isPending } = useQuery({
    queryKey: [`role-permissions-${visiblePermId}`, visiblePermId],
    queryFn: async () => {
      const response = await apiGetData(`role-permissions/${visiblePermId}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: !!visiblePermId,
  });

  const handleSetPermissions = (id: number) =>
    setVisiblePermId((prev) => (prev !== id ? id : null));

  return (
    <Stack
      sx={{
        padding: '1rem 2rem 1rem',
      }}
      gap='1rem'
    >
      {rolePermissions?.map((elem) => {
        return (
          <Paper
            key={elem.id}
            sx={{
              display: 'flex',
              gap: '1rem',
              flexDirection: 'column',
              padding: '1rem',
            }}
          >
            <Stack
              flexDirection={smDown ? 'column' : 'row'}
              justifyContent='space-between'
              alignItems={'center'}
              position={'relative'}
            >
              <Stack width={'100%'}>
                <Stack sx={{ position: 'relative', maxWidth: '92%', width: 'fit-content' }}>
                  <Typography sx={{ wordBreak: 'break-all' }}>{elem?.name}</Typography>
                  <IconButton
                    onClick={() => setSelectedRole(elem)}
                    color='primary'
                    sx={{
                      position: 'absolute',
                      right: '-2.5rem',
                      top: !smDown ? '-.5rem' : '-0.5rem',
                      width: 'min-content',
                    }}
                  >
                    <AddCircleOutlineIcon />
                  </IconButton>
                </Stack>
                <Typography sx={{ opacity: '0.37' }}>{elem?.description}</Typography>
                <Typography sx={{ opacity: '0.37' }}>
                  {elem?.total_employees} {elem?.total_employees === 1 ? 'Member' : 'Members'}
                </Typography>
              </Stack>
              {elem.display_name === 'admin' ? (
                <Typography
                  sx={{ opacity: '0.37', display: !smDown ? 'block' : 'none', textAlign: 'center' }}
                >
                  Admin permissions can not be changed
                </Typography>
              ) : (
                <LoadingButton
                  variant='outlined'
                  loadingPosition='start'
                  startIcon={<KeyIcon />}
                  loading={visiblePermId === elem.id && isPending}
                  onClick={() => handleSetPermissions(elem.id)}
                  size={!smDown ? 'medium' : 'small'}
                  sx={{ minWidth: 'inherit' }}
                >
                  Permissions
                </LoadingButton>
              )}
            </Stack>
            {visiblePermId === elem.id && visibleRolesPermissions && (
              <RolePermissionsTable
                roleId={visibleRolesPermissions?.id}
                data={visibleRolesPermissions?.entity_types ?? []}
              />
            )}
          </Paper>
        );
      })}
      <UsersModal
        open={usersModalOpen}
        role={selectedRole}
        commonData={commonData}
        handleClose={() => setSelectedRole(null)}
      />
    </Stack>
  );
}
