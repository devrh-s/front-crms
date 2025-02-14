'use client';

import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import useActions from '@/hooks/useActions';
import ToolsActions from '../../ToolsActions';
import { ITool } from '../../types';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BuildIcon from '@mui/icons-material/Build';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import LinkIcon from '@mui/icons-material/Link';
import NewspaperIcon from '@mui/icons-material/Newspaper';

interface IAccountProfileProps {
  id: number;
  index: string;
  value: string;
  tool: ITool | null;
  commonData: ICommonData;
}

export default function LevelProfile({ id, index, value, tool, commonData }: IAccountProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: tool?.name,
    id: tool?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: tool?.description,
      type: 'tool',
    },
    fields: [
      {
        title: 'Tools',
        icon: <BuildCircleIcon />,
        value: tool?.link,
        type: 'link',
      },
      {
        title: 'Tool Types',
        icon: <BuildIcon />,
        value: tool?.tool_types,
        type: 'moreChips',
      },
      {
        title: 'Entity Blocks',
        icon: <AccountTreeIcon />,
        value: tool?.entity_blocks,
        type: 'moreChips',
      },
      {
        title: 'Links',
        icon: <LinkIcon />,
        value: tool?.links,
        type: 'moreChips',
      },
      {
        title: 'Guides',
        icon: <AssignmentIcon />,
        value: tool?.guides,
        type: 'moreChips',
      },
      {
        title: 'Task Templates',
        icon: <NewspaperIcon />,
        value: tool?.task_templates,
        type: 'moreChips',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <ToolsActions
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
