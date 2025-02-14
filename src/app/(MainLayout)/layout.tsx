'use client';
import { ReactNode, useContext } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CustomDrawer from '@/components/default/common/drawers/CustomDrawer/CustomDrawer';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/redux/store';
import { useAuthStore } from '@/zustand/authStore';
import AuthGuard from '@/components/default/common/core/AuthGuard';
import { SocketContext } from '@/contexts/socketContext';
import EditsModal from '@/components/default/common/modals/EditsModal/EditsModal';
import { closeAddModal } from '@/redux/slices/editsSlice';
import useUserProfile from '@/hooks/useUserProfile';
import { apiGetData } from '@/lib/fetch';

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const dispatch = useDispatch();
  const { token, isAuthorized, setPermissions } = useAuthStore();
  const { echo } = useContext(SocketContext);
  const { addModalOpen } = useSelector((state: IRootState) => state.edits);
  const { userProfile, updateUserProfile } = useUserProfile();

  const getUserPermissions = async () => {
    const response = await apiGetData('my-permissions');
    const data = response?.data;
    if (data) {
      setPermissions(data);
    }
  };

  useEffect(() => {
    updateUserProfile();
  }, []);

  useEffect(() => {
    if (token && !isAuthorized) {
      getUserPermissions();
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (echo && userProfile) {
      echo
        .private(`user-permissions-changed.${userProfile.id}`)
        .listen('ChangePermission', async ({ key }: { key: string }) => {
          if (key === 'my-permissions') {
            getUserPermissions();
          }
        });
    }
  }, [echo, userProfile]);

  return (
    <AuthGuard>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CustomDrawer>{children}</CustomDrawer>
        <EditsModal open={addModalOpen} handleClose={() => dispatch(closeAddModal())} />
      </LocalizationProvider>
    </AuthGuard>
  );
}
