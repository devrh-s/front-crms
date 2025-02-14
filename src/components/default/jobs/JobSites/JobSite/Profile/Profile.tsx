'use client';
import useActions from '@/hooks/useActions';
import JobSiteActions from '../../JobSiteActions';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import { checkPermission } from '@/lib/helpers';
import LanguageIcon from '@mui/icons-material/Language';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PublicIcon from '@mui/icons-material/Public';

interface IProfileProps {
  id: number;
  index: string;
  value: string;
  jobSite: any;
  isAdmin: boolean;
  userProfile: IUser | null;
  pagePermissions: { [permission: string]: string };
  commonData: ICommonData;
}

export default function Profile({
  id,
  index,
  value,
  jobSite,
  commonData,
  userProfile,
  pagePermissions,
  isAdmin,
}: IProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: jobSite?.name,
    id: jobSite?.id,
    topContent: {
      title: 'Note',
      value: jobSite?.note,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: jobSite?.createdBy,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: jobSite?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Website',
        icon: <NewspaperIcon />,
        value: jobSite?.website,
        type: 'link',
        targetName: 'Website',
      },
      {
        title: 'Countries',
        icon: <PublicIcon />,
        value: jobSite?.countries?.map((p: { id: number; name: string; iso2: string }) => {
          return {
            id: p.id,
            name: p.name,
            iso2: p.iso2,
          };
        }),
        type: 'moreChips',
      },
      {
        title: 'Languages',
        icon: <LanguageIcon />,
        value: jobSite?.languages?.map((p: { id: number; name: string; iso2: string }) => {
          return {
            id: p.id,
            name: p.name,
            iso2: p.iso2,
          };
        }),
        type: 'moreChips',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile
          profile={profile}
          handleActions={handleActions}
          availableEdit={checkPermission({
            pagePermissions,
            permissionType: 'edit_job_sites',
            userId: userProfile?.id,
            ownerId: jobSite?.createdBy?.id,
            isAdmin,
          })}
        />
        <JobSiteActions
          id={id}
          isProfile
          visible={actionsData.visible}
          commonData={commonData}
          handleActions={handleActions}
        />
      </>
    )
  );
}
