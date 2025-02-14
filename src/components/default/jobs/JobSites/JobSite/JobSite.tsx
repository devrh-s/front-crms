'use client';
import ProfileHeader from '@/components/default/common/components/ProfileHeader';
import { SocketContext } from '@/contexts/socketContext';
import { apiGetData, updateCommondData } from '@/lib/fetch';
import { checkPermission, getCommonDataReq, getPagePermissions } from '@/lib/helpers';
import { clearEdits, setEditsData } from '@/redux/slices/editsSlice';
import { clearProfilePage, setProfilePageName } from '@/redux/slices/profilePageSlice';
import useUserProfile from '@/hooks/useUserProfile';
import { useAuthStore } from '@/zustand/authStore';
import { Box } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { commonDataBlocks, getCommonData } from '../commonData';
import Activities from './Activities';
import JobAccounts from './Job-accounts';
import Pricings from './Pricing/Pricings';
import Profile from './Profile/Profile';
import { useGuidesStore } from '@/zustand/guidesStore';
import useTabBookmarks from '@/hooks/useTabBookmarks';
import { ITabBookmark } from '@/components/default/common/types';
import ProfileSkeleton from '@/components/default/common/components/ProfileSkeleton';

enum TabsValues {
  PROFILE = 'Profile',
  ACTIVITIES = 'Activities',
  PRICING = 'Job Pricing',
  JOB_ACCOUNTS = 'Job Accounts',
}

export default function JobSite({ id }: { id: string }) {
  const activeTab = useSearchParams().get('tab');
  const { userProfile } = useUserProfile();
  const dispatch = useDispatch();
  const { isAdmin, permissions } = useAuthStore();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const clearGuidesData = useGuidesStore((state) => state.clearGuidesData);
  const { echo } = useContext(SocketContext);
  const queryClient = useQueryClient();
  const { tabs, setTabs, activeBookmark, changeActiveBookmark } = useTabBookmarks();

  const pagePermissions = useMemo(
    () => getPagePermissions('Jobs', 'Job Sites', permissions),
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
    queryKey: ['job-sites-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      users: [],
      inner_clients: [],
      accounts: [],
      tools: [],
      statuses: [],
    },
  });

  const {
    data: { data, entity_block_id },
  } = useQuery({
    queryKey: ['job-site', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`job-sites/${id}`);
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
        Activities: 'view_job_site_activities',
        'Job Accounts': 'view_job_site_job_accounts',
        'Job Pricing': 'view_job_site_pricings',
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
        id,
        title,
        name,
        count_edits: countEdits,
        progressable_type: progressableType,
      } = data;
      dispatch(setProfilePageName(title ?? name));
      dispatch(
        setEditsData({
          progressableId: id,
          countEdits,
          progressableType,
        })
      );
      setGuidesData({ progressableId: id, progressableType });
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
            name: 'job-sites-common',
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
            title='Job Sites'
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
                jobSite={data}
                commonData={commonData}
                isAdmin={isAdmin}
                userProfile={userProfile}
                pagePermissions={pagePermissions}
              />
              <Activities id={+id} value={activeBookmark} index={TabsValues.ACTIVITIES} />
              {activeBookmark === TabsValues.PRICING && (
                <Pricings id={+id} value={activeBookmark} index={TabsValues.PRICING} />
              )}
              <JobAccounts id={+id} value={activeBookmark} index={TabsValues.JOB_ACCOUNTS} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
