'use client';

import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import useActions from '@/hooks/useActions';
import JobAccountActions from '../../JobAccountActions';
import BallotIcon from '@mui/icons-material/Ballot';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupIcon from '@mui/icons-material/Group';
import LinkIcon from '@mui/icons-material/Link';
import LoginIcon from '@mui/icons-material/Login';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PasswordIcon from '@mui/icons-material/Password';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import WebIcon from '@mui/icons-material/Web';

interface TabPanelProps {
  index: string;
  value: string;
  jobAccount: IJobAccount;
  commonData: ICommonData;
}

export default function Profile({ index, value, jobAccount, commonData }: TabPanelProps) {
  const { actionsData, handleActions } = useActions(jobAccount.id);

  const profile = {
    name: jobAccount?.name,
    id: jobAccount?.id,
    topContent: {
      title: 'Note',
      icon: <DescriptionIcon />,
      value: jobAccount?.note,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: jobAccount?.createdBy,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: jobAccount?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Login',
        icon: <LoginIcon />,
        value: jobAccount?.login,
        type: 'text',
      },
      {
        title: 'Password',
        icon: <PasswordIcon />,
        value: jobAccount?.password,
        type: 'password',
      },
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: jobAccount?.status,
        type: 'status',
      },
      {
        title: 'Available Job Post',
        icon: <BallotIcon />,
        value: jobAccount?.available_job_posts,
        type: 'text',
      },
      {
        title: 'Profile link',
        icon: <LinkIcon />,
        value: jobAccount?.profile_link,
        type: 'link',
      },
      {
        title: 'Job Site',
        icon: <WebIcon />,
        value: jobAccount?.jobSite?.name,
        href: jobAccount?.jobSite?.website,
        type: 'nameLink',
      },
      {
        title: 'Verification Accounts',
        icon: <ManageAccountsOutlinedIcon />,
        value: jobAccount?.verifications,
        type: 'moreChips',
      },
      {
        title: 'Users',
        icon: <GroupIcon />,
        value: jobAccount?.users,
        type: 'moreChips',
        exception: 'user' as 'user',
      },
      {
        title: 'Active Job Posts',
        icon: <BallotIcon />,
        value: jobAccount?.active_job_posts,
        type: 'text',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <JobAccountActions
          id={jobAccount.id}
          visible={actionsData.visible}
          isProfile
          commonData={commonData}
          handleActions={handleActions}
        />
      </>
    )
  );
}
