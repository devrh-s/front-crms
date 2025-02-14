'use client';

import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import useActions from '@/hooks/useActions';
import PostTemplatesActions from '../../PostTemplatesActions';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import EngineeringIcon from '@mui/icons-material/Engineering';
import LanguageIcon from '@mui/icons-material/Language';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PersonPinCircleOutlinedIcon from '@mui/icons-material/PersonPinCircleOutlined';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import TranslateIcon from '@mui/icons-material/Translate';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';

interface IPostTemplatesProfileProps {
  id: number;
  index: string;
  value: string;
  postTemplate: IPostTemplate | null;
  commonData: ICommonData;
}

export default function JobTemplatesProfile({
  id,
  index,
  value,
  postTemplate,
  commonData,
}: IPostTemplatesProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: postTemplate?.title,
    id: postTemplate?.id,
    topContent: {
      title: 'Full Post',
      icon: <DescriptionIcon />,
      value: postTemplate?.full_post_template,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: postTemplate?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: postTemplate?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: postTemplate?.status,
        type: 'status',
      },
      {
        title: 'Job Template',
        icon: <WorkHistoryIcon />,
        value: postTemplate?.job_template?.title,
        href: `job-template/${postTemplate?.job_template?.id}`,
        type: 'nameLink',
      },
      {
        title: 'Destination',
        icon: <PersonPinCircleOutlinedIcon />,
        value: postTemplate?.destination,
        type: 'text',
      },
      {
        title: 'Translation',
        icon: <TranslateIcon />,
        value: postTemplate?.translation?.iso2,
        type: 'translation',
      },
      {
        title: 'Languages',
        icon: <LanguageIcon />,
        value: postTemplate?.languages,
        type: 'moreChips',
      },
      {
        title: 'Profession',
        icon: <EngineeringIcon />,
        value: postTemplate?.profession?.name,
        type: 'text',
      },
      {
        title: 'Shift',
        icon: <TrackChangesIcon />,
        value: postTemplate?.shift?.name,
        type: 'text',
      },
      {
        title: 'Job Template Tools',
        icon: <BuildCircleIcon />,
        value: postTemplate?.tools,
        type: 'moreChips',
      },
      {
        title: 'Task Templates',
        icon: <NewspaperIcon />,
        value: postTemplate?.task_templates,
        type: 'moreChips',
      },
      {
        title: 'Prompt',
        icon: <DescriptionIcon />,
        value: postTemplate?.prompt,
        type: 'text',
      },
      {
        title: 'Role overview',
        icon: <DescriptionIcon />,
        value: postTemplate?.role_overview,
        type: 'text',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <PostTemplatesActions
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
