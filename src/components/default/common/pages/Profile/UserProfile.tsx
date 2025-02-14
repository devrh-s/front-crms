'use client';
import { useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import Profile from './Profile/ProfileTabPanel';
import Activities from './Activities';
import AccountsPage from './Accounts';
import OwnerAccountsPage from './OwnerAccounts';
import ProfileHeader from '@/components/default/common/components/ProfileHeader';
import useUserProfile from '@/hooks/useUserProfile';
import { useSearchParams } from 'next/navigation';
import useTabBookmarks from '@/hooks/useTabBookmarks';
import { useAuthStore } from '@/zustand/authStore';
import { checkPermission, getPagePermissions } from '@/lib/helpers';
import { ITabBookmark } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { apiGetData } from '@/lib/fetch';

enum TabsValues {
  PROFILE = 'Profile',
  ACTIVITIES = 'Activities',
  ACCOUNTS = 'Accounts',
  OWNER_ACCOUNTS = 'Owner Accounts',
}

export default function UserProfile() {
  const activeTab = useSearchParams().get('tab');
  const { isAdmin, permissions } = useAuthStore();
  const { userProfile, entityBlockId } = useUserProfile();
  const { tabs, setTabs, activeBookmark, changeActiveBookmark } = useTabBookmarks();

  const pagePermissions = useMemo(
    () => getPagePermissions('Talents', 'Users', permissions),
    [permissions]
  );

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    changeActiveBookmark(newValue);
  };

  const { data: tabsData, isPending } = useQuery({
    queryKey: ['tabs-bookmarks', entityBlockId],
    queryFn: async () => {
      const response = await apiGetData(`entity-blocks/${entityBlockId}/bookmarks`);
      return response.data;
    },
    enabled: !!entityBlockId,
  });

  useEffect(() => {
    if (tabsData) {
      if (isAdmin) {
        setTabs(tabsData);
        return;
      }
      const permissionTypeMap: Record<string, string> = {
        Activities: 'view_user_activities',
      };

      const filteredTabs = tabsData.filter((tab: ITabBookmark) => {
        const permissionType = permissionTypeMap[tab.name];
        if (!permissionType) return true;

        return checkPermission({
          pagePermissions,
          permissionType,
          userId: userProfile?.id,
          isAdmin,
        });
      });

      setTabs(filteredTabs);
    }
  }, [tabsData]);

  useEffect(() => {
    if (activeTab && tabs) {
      changeActiveBookmark(activeTab);
    }
  }, [activeTab, tabs]);

  return (
    <Box sx={{ width: '100%' }}>
      <ProfileHeader tabs={tabs} value={activeBookmark} handleChange={handleChange} />
      {userProfile && (
        <Box>
          <Profile value={activeBookmark} index={TabsValues.PROFILE} user={userProfile} />
          <Activities value={activeBookmark} index={TabsValues.ACTIVITIES} id={userProfile?.id} />
          <AccountsPage value={activeBookmark} index={TabsValues.ACCOUNTS} id={userProfile?.id} />
          <OwnerAccountsPage
            value={activeBookmark}
            index={TabsValues.OWNER_ACCOUNTS}
            id={userProfile?.id}
          />
        </Box>
      )}
    </Box>
  );
}
