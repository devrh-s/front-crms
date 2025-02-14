'use client';

import useActions from '@/hooks/useActions';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import IndustryActions from '../../IndustryActions';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import TranslateIcon from '@mui/icons-material/Translate';

interface IAccountProfileProps {
  id: number;
  index: string;
  value: string;
  industry: IIndustry | null;
  commonData: ICommonData;
}

export default function CityProfile({
  id,
  index,
  value,
  industry,
  commonData,
}: IAccountProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: industry?.name,
    id: industry?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: industry?.description,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: industry?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: industry?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: industry?.status,
        type: 'status',
      },
      {
        title: 'Translation',
        icon: <TranslateIcon />,
        value: industry?.translation.name,
        type: 'text',
      },
      {
        title: 'Group',
        icon: <GroupWorkOutlinedIcon />,
        value: industry?.library?.name,
        type: 'text',
      },
      {
        title: 'Priority',
        icon: <LowPriorityIcon />,
        value: industry?.priority.name,
        type: 'text',
      },
      {
        title: 'Sub Industries',
        icon: <AllInboxIcon />,
        value: industry?.sub_industries,
        type: 'moreChips',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <IndustryActions
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
