'use client';

import useActions from '@/hooks/useActions';
import AccountsActions from '../../AccountsActions';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import BuildIcon from '@mui/icons-material/Build';
import DescriptionIcon from '@mui/icons-material/Description';
import DomainVerificationIcon from '@mui/icons-material/DomainVerification';
import GroupIcon from '@mui/icons-material/Group';
import LanguageIcon from '@mui/icons-material/Language';
import LinkIcon from '@mui/icons-material/Link';
import LoginIcon from '@mui/icons-material/Login';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';

interface IAccountProfileProps {
  id: number;
  index: string;
  value: string;
  account: IAccount | null;
  commonData: ICommonData;
}

export default function AccountProfile({
  id,
  index,
  value,
  account,
  commonData,
}: IAccountProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: account?.name,
    id: account?.id,
    topContent: {
      title: 'Note',
      icon: <DescriptionIcon />,
      value: account?.note,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: account?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: account?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Login',
        icon: <LoginIcon />,
        value: account?.login,
        type: 'text',
      },
      {
        title: 'Link',
        icon: <LinkIcon />,
        value: account?.link,
        type: 'link',
      },
      {
        title: 'Document Link',
        icon: <LinkIcon />,
        value: account?.document_link,
        type: 'link',
      },
      {
        title: 'Inner Client',
        icon: <LanguageIcon />,
        value: account?.inner_client?.name,
        type: 'text',
      },
      {
        title: 'Tool',
        icon: <BuildIcon />,
        value: account?.tool?.name,
        type: 'text',
      },
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: account?.status,
        type: 'status',
      },
      {
        title: 'Owner',
        icon: <PersonOutlineIcon />,
        value: account?.owner,
        type: 'user',
      },
      {
        title: 'Users',
        icon: <GroupIcon />,
        value: account?.users?.map((user) => user),
        type: 'moreChips',
        exception: 'user' as 'user',
      },
      {
        title: 'Verifications',
        icon: <DomainVerificationIcon />,
        value: account?.verifications,
        type: 'moreChips',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <AccountsActions
          id={id}
          visible={actionsData.visible}
          isProfile
          commonData={commonData}
          handleActions={handleActions}
        />
      </>
    )
  );
}
