'use client';
import { apiGetData, updateCommondData } from '@/lib/fetch';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Button, Stack } from '@mui/material';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState, useContext } from 'react';
import { getCommonData, commonDataBlocks } from './commonData';
import RolePermissionsList from './RolePermissionsList';
import { SocketContext } from '@/contexts/socketContext';

const ManageModal = dynamic(() => import('./ManageModal'), {
  ssr: false,
});

export default function RolePermissions() {
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const { echo } = useContext(SocketContext);
  const queryClient = useQueryClient();

  const { isFetching, isError, data } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const response = await apiGetData('role-permissions');
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const { data: commonData } = useQuery({
    queryKey: ['role-permissions-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      company_types: [],
    },
  });

  const {
    data: rolePermissions,
    meta,
    fields,
  } = useMemo(() => {
    if (data) return data;
    return [];
  }, [data]);

  useEffect(() => {
    if (echo) {
      echo
        .channel(`common-data`)
        .listen('CommonDataChanged', (data: { key: keyof typeof commonDataBlocks }) => {
          const { key } = data;
          const basicValue = commonDataBlocks[key];
          const commonDataReq = { [key]: basicValue };
          if (commonDataReq) {
            updateCommondData({
              name: 'role-permissions-common',
              commonDataReq,
              queryClient,
            });
          }
        });
    }
    return () => echo?.leave(`common-data`);
  }, [echo]);

  return (
    <Stack>
      <Button
        variant='contained'
        startIcon={<ManageAccountsIcon />}
        onClick={() => setManageModalOpen(true)}
        sx={{
          margin: '1rem 2rem',
          alignSelf: 'flex-start',
        }}
      >
        Manage Role
      </Button>
      <RolePermissionsList commonData={commonData} rolePermissions={rolePermissions} />
      <ManageModal
        open={manageModalOpen}
        handleClose={() => setManageModalOpen(false)}
        roles={rolePermissions}
        commonData={commonData}
      />
    </Stack>
  );
}
