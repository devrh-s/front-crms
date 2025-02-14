'use client';

import useActions from '@/hooks/useActions';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import GuidesActions from '../../GuidesActions';
import GuideFormat from '../../../components/GuideFormat';
import MoreChips from '@/components/default/common/components/MoreChips';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ListIcon from '@mui/icons-material/List';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';

interface IGuideProfileProps {
  id: number;
  index: string;
  value: string;
  guide: IGuideType | null;
  commonData: ICommonData;
}

export default function Profile({ id, index, value, guide, commonData }: IGuideProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: guide?.name,
    id: guide?.id,
    bottomContent: {
      user: {
        title: 'Created By',
        value: guide?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: guide?.created_at,
          type: 'date',
        },
        {
          title: 'Updated At',
          value: guide?.updated_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Tools',
        icon: <BuildCircleIcon />,
        value: guide?.tools,
        type: 'moreChips',
      },
      {
        title: 'Objects',
        icon: <DataObjectIcon />,
        value: guide?.objects,
        type: 'moreChips',
      },
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: guide?.status,
        type: 'status',
      },
      {
        title: 'Type',
        icon: <DataObjectIcon />,
        value: [guide?.type],
        type: 'moreChips',
      },
      {
        title: 'Checklist Items',
        icon: <ListIcon />,
        value: (
          <MoreChips
            data={guide?.checklist_items ? guide?.checklist_items : []}
            propName='name'
            handleSetModal={(data: any) => window.open(`/checklist-items/${data.id}`)}
          />
        ),
        type: 'component',
      },
    ],
    // accordions: guide?.guide_formats?.map((el: IGuideFormatType) => ({
    //   title: `Guide Format: ${el.format.name} (ID:${el.id})`,
    //   component: <GuideFormat data={el} />,
    // })),
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <GuidesActions
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
