'use client';
import ProfileHeader from '@/components/default/common/components/ProfileHeader';
import { SocketContext } from '@/contexts/socketContext';
import { apiGetData, updateCommondData } from '@/lib/fetch';
import { checkPermission, getCommonDataReq, getPagePermissions } from '@/lib/helpers';
import { clearEdits, setEditsData } from '@/redux/slices/editsSlice';
import { clearProfilePage, setProfilePageName } from '@/redux/slices/profilePageSlice';
import { Box } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { commonDataBlocks, getCommonData } from '../commonData';
import Activities from './Activities';
import Profile from './Profile/Profile';
import { useGuidesStore } from '@/zustand/guidesStore';
import useTabBookmarks from '@/hooks/useTabBookmarks';
import { useAuthStore } from '@/zustand/authStore';
import useUserProfile from '@/hooks/useUserProfile';
import { ITabBookmark } from '@/components/default/common/types';
import ProfileSkeleton from '@/components/default/common/components/ProfileSkeleton';

enum TabsValues {
  PROFILE = 'Profile',
  ACTIVITIES = 'Activities',
}

export default function Country({ id }: { id: number }) {
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const clearGuidesData = useGuidesStore((state) => state.clearGuidesData);
  const activeTab = useSearchParams().get('tab');
  const { isAdmin, permissions } = useAuthStore();
  const { userProfile } = useUserProfile();
  const { echo } = useContext(SocketContext);
  const queryClient = useQueryClient();
  const { tabs, setTabs, activeBookmark, changeActiveBookmark } = useTabBookmarks();

  const pagePermissions = useMemo(
    () => getPagePermissions('Libraries', 'Countries', permissions),
    [permissions]
  );

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    if (newValue === 'Profile' && data) {
      const { id, count_edits: countEdits, progressable_type: progressableType } = data;
      dispatch(
        setEditsData({
          progressableId: id,
          countEdits,
          progressableType,
        })
      );
      setGuidesData({ progressableId: id, progressableType });
    } else {
      dispatch(clearEdits());
      clearGuidesData();
    }
    changeActiveBookmark(newValue);
  };

  const { data: commonData } = useQuery({
    queryKey: ['countries-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      groups: [],
      flags: [],
      statuses: [],
      languages: [],
      priorities: [],
      users: [],
    },
  });

  const {
    data: { data, entity_block_id },
  } = useQuery({
    queryKey: ['country', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`countries/${id}`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: {
      data: null,
      entity_block_id: null,
    },
    enabled: !!id,
  });

  const { data: tabsData, isPending } = useQuery({
    queryKey: ['tabs-bookmarks', entity_block_id],
    queryFn: async () => {
      const response = await apiGetData(`entity-blocks/${entity_block_id}/bookmarks`);
      return response.data;
    },
    enabled: !!entity_block_id,
  });

  useEffect(() => {
    if (tabsData) {
      if (isAdmin) {
        setTabs(tabsData);
        return;
      }
      const permissionTypeMap: Record<string, string> = {
        Activities: 'view_countries_activities',
      };

      const filteredTabs = tabsData.filter((tab: ITabBookmark) => {
        const permissionType = permissionTypeMap[tab.name];
        if (!permissionType) return true;

        return checkPermission({
          pagePermissions,
          permissionType,
          userId: userProfile?.id,
          ownerId: data?.createdBy?.id,
          isAdmin,
        });
      });

      setTabs(filteredTabs);
    }
  }, [tabsData]);

  useEffect(() => {
    if (data) {
      const {
        country_id,
        title,
        name,
        count_edits: countEdits,
        progressable_type: progressableType,
      } = data;
      dispatch(setProfilePageName(title ?? name));
      dispatch(
        setEditsData({
          progressableId: country_id,
          countEdits,
          progressableType,
        })
      );
      setGuidesData({ progressableId: country_id, progressableType });
    }
    return () => {
      dispatch(clearProfilePage());
    };
  }, [data]);

  useEffect(() => {
    if (echo) {
      echo.channel(`common-data`).listen('CommonDataChanged', (data: any) => {
        const { key } = data;
        const commonDataReq = getCommonDataReq(key, commonDataBlocks);
        if (commonDataReq) {
          updateCommondData({
            name: 'countries-common',
            commonDataReq,
            queryClient,
          });
        }
      });
    }
    return () => echo?.leave(`common-data`);
  }, [echo]);

  useEffect(() => {
    if (activeTab && tabs) {
      changeActiveBookmark(activeTab);
    }
  }, [activeTab, tabs]);

  return (
    <Box sx={{ width: '100%' }}>
      {isPending ? (
        <ProfileSkeleton />
      ) : (
        <>
          <ProfileHeader
            title='Countries'
            tabs={tabs}
            value={activeBookmark}
            handleChange={handleChange}
          />
          {data && (
            <Box>
              <Profile
                id={+id}
                value={activeBookmark}
                index={TabsValues.PROFILE}
                country={data}
                commonData={commonData}
              />
              <Activities id={+id} value={activeBookmark} index={TabsValues.ACTIVITIES} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
