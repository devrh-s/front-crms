'use client';

import useActions from '@/hooks/useActions';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import SubIndustryActions from '../../SubIndustryActions';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import TranslateIcon from '@mui/icons-material/Translate';

interface IAccountProfileProps {
  id: number;
  index: string;
  value: string;
  subIndustry: ISubIndustry | null;
  commonData: ICommonData;
}

export default function LevelProfile({
  id,
  index,
  value,
  subIndustry,
  commonData,
}: IAccountProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: subIndustry?.name,
    id: subIndustry?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: subIndustry?.description,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: subIndustry?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: subIndustry?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: subIndustry?.status,
        type: 'status',
      },
      {
        title: 'Translation',
        icon: <TranslateIcon />,
        value: subIndustry?.translation.name,
        type: 'text',
      },
      {
        title: 'Group',
        icon: <GroupWorkOutlinedIcon />,
        value: subIndustry?.library?.name,
        type: 'text',
      },
      {
        title: 'Priority',
        icon: <LowPriorityIcon />,
        value: subIndustry?.priority.name,
        type: 'text',
      },
      {
        title: 'industry',
        icon: <AccountBalanceIcon />,
        value: subIndustry?.industry?.name,
        type: 'text',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <SubIndustryActions
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
