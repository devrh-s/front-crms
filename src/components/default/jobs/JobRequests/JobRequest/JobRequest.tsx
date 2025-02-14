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
import JobPosts from './JobPosts';
import JobTemplates from './JobTemplates';
import Languages from './Languages';
import Profile from './Profile/Profile';
import { useGuidesStore } from '@/zustand/guidesStore';
import useTabBookmarks from '@/hooks/useTabBookmarks';
import useUserProfile from '@/hooks/useUserProfile';
import { useAuthStore } from '@/zustand/authStore';
import { ITabBookmark } from '@/components/default/common/types';
import ProfileSkeleton from '@/components/default/common/components/ProfileSkeleton';

enum TabsValues {
  PROFILE = 'Profile',
  LANGUAGE = 'Languages',
  ACTIVITIES = 'Activities',
  JOB_POSTS = 'Job Requests Posts',
  JOB_TEMPLATES = 'Job Requests Templates',
}

export default function JobRequest({ id }: { id: number }) {
  const activeTab = useSearchParams().get('tab');
  const dispatch = useDispatch();
  const { userProfile } = useUserProfile();
  const { isAdmin, permissions } = useAuthStore();
  const { echo } = useContext(SocketContext);
  const queryClient = useQueryClient();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const clearGuidesData = useGuidesStore((state) => state.clearGuidesData);
  const { tabs, setTabs, activeBookmark, changeActiveBookmark } = useTabBookmarks();

  const pagePermissions = useMemo(
    () => getPagePermissions('Jobs', 'Job Requests', permissions),
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
    } else {
      dispatch(clearEdits());
      clearGuidesData();
    }
    changeActiveBookmark(newValue);
  };

  const { data: commonData } = useQuery({
    queryKey: ['job-requests-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      professions: [],
      departments: [],
      inner_clients: [],
      managers: [],
      shifts: [],
      rates: [],
      job_templates: [],
    },
  });

  const {
    data: { data, entity_block_id },
  } = useQuery({
    queryKey: ['job-request', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`job-requests/${id}`);
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
        Activities: 'view_job_requests_activities',
        Languages: 'view_job_requests_languages',
        'Job Requests Posts': 'view_job_requests_job_posts',
        'Job Requests Templates': 'view_job_requests_job_templates',
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
            name: 'job-requests-common',
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
            title='Job Requests'
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
                jobRequest={data}
                commonData={commonData}
              />
              <Languages id={+id} isDisplayed={activeBookmark === TabsValues.LANGUAGE} />
              <Activities id={+id} isDisplayed={activeBookmark === TabsValues.ACTIVITIES} />
              <JobPosts id={+id} isDisplayed={activeBookmark === TabsValues.JOB_POSTS} />
              <JobTemplates id={+id} isDisplayed={activeBookmark === TabsValues.JOB_TEMPLATES} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
