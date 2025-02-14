'use client';
import ProfileHeader from '@/components/default/common/components/ProfileHeader';
import { SocketContext } from '@/contexts/socketContext';
import { apiGetData, updateCommondData } from '@/lib/fetch';
import { clearEdits, setEditsData } from '@/redux/slices/editsSlice';
import { clearProfilePage, setProfilePageName } from '@/redux/slices/profilePageSlice';
import { Box } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { commonDataBlocks, getCommonData } from '../commonData';
import Activities from './Activities';
import Contacts from './Contacts';
import JaCommunications from './JaCommunications';
import JobPosts from './JobPosts';
import JobRequests from './JobRequests';
import Profile from './Profile/Profile';
import { useGuidesStore } from '@/zustand/guidesStore';
import useTabBookmarks from '@/hooks/useTabBookmarks';
import { useAuthStore } from '@/zustand/authStore';
import useUserProfile from '@/hooks/useUserProfile';
import { ITabBookmark } from '@/components/default/common/types';
import { checkPermission, getPagePermissions } from '@/lib/helpers';
import ProfileSkeleton from '@/components/default/common/components/ProfileSkeleton';

const genders = [
  {
    id: 'unknown',
    name: 'Unknown',
  },
  {
    id: 'male',
    name: 'Male',
  },
  {
    id: 'female',
    name: 'Female',
  },
];

const talent = [
  {
    id: 0,
    name: 'NO',
  },
  {
    id: 1,
    name: 'YES',
  },
];

enum TabsValues {
  PROFILE = 'Profile',
  ACTIVITIES = 'Activities',
  CONTACTS = 'Contacts',
  JOB_POSTS = 'Job Application Posts',
  JA_COMMUNICATION = 'Communications',
  JOB_REQUESTS = 'Job Application Requests',
}

export default function JobApplication({ id }: { id: string }) {
  const activeTab = useSearchParams().get('tab');
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const clearGuidesData = useGuidesStore((state) => state.clearGuidesData);
  const { isAdmin, permissions } = useAuthStore();
  const { userProfile } = useUserProfile();
  const { echo } = useContext(SocketContext);
  const queryClient = useQueryClient();
  const { tabs, setTabs, activeBookmark, changeActiveBookmark } = useTabBookmarks();

  const pagePermissions = useMemo(
    () => getPagePermissions('Jobs', 'Job Applications', permissions),
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
    queryKey: ['job-applications-common'],
    queryFn: async () => {
      const data = await getCommonData();
      return { ...data, genders, talent };
    },
    refetchOnWindowFocus: false,
    placeholderData: {
      countries: [],
      cities: [],
      users: [],
      statuses: [],
      job_posts: [],
      job_requests: [],
      accounts: [],
      communication_types: [],
      job_templates: [],
      tools: [],
      genders,
      messages: [],
      talent,
    },
  });

  const {
    data: { data, entity_block_id },
  } = useQuery({
    queryKey: ['job-application', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`job-applications/${id}`);
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
        Activities: 'view_job_applications_activities',
        Contacts: 'view_ja_contacts',
        'Job Application Posts': 'view_ja_job_posts',
        'Job Application Requests': 'view_job_applications_requests',
        Communications: 'view_ja_communications',
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
      echo
        .channel(`common-data`)
        .listen('CommonDataChanged', (data: { key: keyof typeof commonDataBlocks }) => {
          const { key } = data;
          const basicValue = commonDataBlocks[key];
          const commonDataReq = { [key]: basicValue };
          if (commonDataReq) {
            updateCommondData({
              name: 'job-applications-common',
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
            title='Job Application'
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
                jobApplication={data}
                commonData={commonData}
              />
              <Activities id={+id} value={activeBookmark} index={TabsValues.ACTIVITIES} />
              <Contacts id={+id} value={activeBookmark} index={TabsValues.CONTACTS} />
              <JobPosts id={+id} value={activeBookmark} index={TabsValues.JOB_POSTS} />
              <JaCommunications
                id={+id}
                value={activeBookmark}
                index={TabsValues.JA_COMMUNICATION}
                communications={data?.communications}
              />
              <JobRequests id={+id} value={activeBookmark} index={TabsValues.JOB_REQUESTS} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
