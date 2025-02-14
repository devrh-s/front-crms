'use client';
import ProfileHeader from '@/components/default/common/components/ProfileHeader';
import ProfileSkeleton from '@/components/default/common/components/ProfileSkeleton';
import { ITabBookmark } from '@/components/default/common/types';
import Contacts from '@/components/default/talents/Candidates/Candidate/Contacts';
import Contents from '@/components/default/talents/Candidates/Candidate/Contents';
import CVs from '@/components/default/talents/Candidates/Candidate/CVs';
import Languages from '@/components/default/talents/Candidates/Candidate/Languages';
import Professions from '@/components/default/talents/Candidates/Candidate/Professions';
import Profile from '@/components/default/talents/Candidates/Candidate/Profile/Profile';
import Rates from '@/components/default/talents/Candidates/Candidate/Rates';
import { genders } from '@/components/default/talents/Candidates/Candidates';
import { SocketContext } from '@/contexts/socketContext';
import useTabBookmarks from '@/hooks/useTabBookmarks';
import useUserProfile from '@/hooks/useUserProfile';
import { apiGetData, updateCommondData } from '@/lib/fetch';
import { checkPermission, getCommonDataReq, getPagePermissions } from '@/lib/helpers';
import { clearEdits, setEditsData } from '@/redux/slices/editsSlice';
import { clearProfilePage, setProfilePageName } from '@/redux/slices/profilePageSlice';
import { useAuthStore } from '@/zustand/authStore';
import { useGuidesStore } from '@/zustand/guidesStore';
import { Box } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { commonDataBlocks, getCommonData } from '../commonData';
import Comments from './Comments';
import Communications from './Communication';
import Salaries from './Salaries';

enum TabsValues {
  PROFILE = 'Profile',
  PROFESSION = 'Professions',
  RATE = 'Employee Rates',
  SALARY = 'Employee Salaries',
  LANGUAGE = 'Languages',
  CV = 'CVS',
  CONTACT = 'Contacts',
  CONTENT = 'Contents',
  COMMUNICATION = 'Communications',
  COMMENTS = 'Comments',
}

export default function CandidateProfile({ id }: { id: string }) {
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
    () => getPagePermissions('Talents', 'Candidates', permissions),
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
    queryKey: ['candidates-common'],
    queryFn: async () => {
      const data = await getCommonData();
      return {
        ...data,
        availabilities: [
          { id: 0, name: 'No' },
          { id: 1, name: 'Yes' },
        ],
        genders,
      };
    },
    refetchOnWindowFocus: false,
    placeholderData: {
      availabilities: [],
      currencies: [],
      genders,
    },
  });

  const {
    data: { data, entity_block_id },
  } = useQuery({
    queryKey: ['candidate', id],
    queryFn: async () => {
      const response = await apiGetData(`candidates/${id}`);
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
        Professions: 'view_candidates_professions',
        'Employee Rates': 'view_candidates_rates',
        'Employee Salaries': 'view_candidates_salaries',
        Prices: 'view_candidates_prices',
        Languages: 'view_candidates_languages',
        CVS: 'view_candidates_cvs',
        Contacts: 'view_candidates_contacts',
        Contents: 'view_candidates_contents',
        Communications: 'view_candidates_communications',
        Comments: 'view_candidates_comments',
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
            name: 'candidates-common',
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
            title='Users'
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
                data={data}
                commonData={commonData}
              />
              <Languages id={+id} isDisplayed={activeBookmark === TabsValues.LANGUAGE} />
              <Contacts id={+id} isDisplayed={activeBookmark === TabsValues.CONTACT} />
              <Communications
                id={+id}
                isDisplayed={activeBookmark === TabsValues.COMMUNICATION}
                communications={data?.talents?.communications}
              />
              <Comments id={+id} isDisplayed={activeBookmark === TabsValues.COMMENTS} />
              <Contents id={+id} isDisplayed={activeBookmark === TabsValues.CONTENT} />
              <Professions id={+id} isDisplayed={activeBookmark === TabsValues.PROFESSION} />
              <CVs id={+id} isDisplayed={activeBookmark === TabsValues.CV} />
              <Rates id={+id} isDisplayed={activeBookmark === TabsValues.RATE} />
              <Salaries id={+id} isDisplayed={activeBookmark === TabsValues.SALARY} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
