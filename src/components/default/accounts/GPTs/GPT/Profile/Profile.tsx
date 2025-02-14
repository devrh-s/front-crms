'use client';

import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import useActions from '@/hooks/useActions';
import GPTsActions from '../../GPTsActions';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArticleIcon from '@mui/icons-material/Article';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import LinkIcon from '@mui/icons-material/Link';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

interface IGPTProfileProps {
  id: number;
  index: string;
  value: string;
  gpt: IGPT | null;
  commonData: ICommonData;
}

export default function GPTProfile({ id, index, value, gpt, commonData }: IGPTProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    id: gpt?.id,
    bottomContent: {
      user: {
        title: 'Created By',
        value: gpt?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: gpt?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Name',
        icon: <PersonOutlineIcon />,
        value: gpt?.name,
        type: 'text',
      },
      {
        title: 'Link',
        icon: <LinkIcon />,
        value: gpt?.link,
        type: 'link',
      },
      {
        title: 'Custom instructions link',
        icon: <LinkIcon />,
        value: gpt?.custom_instructions_link,
        type: 'link',
      },
      {
        title: 'Type',
        icon: <ArticleIcon />,
        value: gpt?.type,
        type: 'text',
      },
      {
        title: 'Entities',
        icon: <AccountTreeIcon />,
        value: gpt?.entities,
        type: 'moreChips',
      },
      {
        title: 'Task Template',
        icon: <NewspaperIcon />,
        value: gpt?.task_templates,
        type: 'moreChips',
      },
      {
        title: 'Tools',
        icon: <BuildCircleIcon />,
        value: gpt?.tools,
        type: 'moreChips',
      },
      {
        title: 'Files',
        icon: <FileCopyOutlinedIcon />,
        value: gpt?.links,
        type: 'moreChips',
      },
      {
        title: 'Owner',
        icon: <PersonOutlineIcon />,
        value: gpt?.owner,
        type: 'user',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <GPTsActions
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
