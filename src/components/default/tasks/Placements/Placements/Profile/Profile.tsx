'use client';

import useActions from '@/hooks/useActions';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import { IPlacementType } from '../../types';
import PlacementsActions from '../../PlacementsActions';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import BuildIcon from '@mui/icons-material/Build';
import LinkIcon from '@mui/icons-material/Link';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';

interface IProjectTemplatesProfileProps {
  id: number;
  index: string;
  value: string;
  placement: IPlacementType | null;
  commonData: ICommonData;
}

export default function JobTemplatesProfile({
  id,
  index,
  value,
  placement,
  commonData,
}: IProjectTemplatesProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: placement?.name,
    id: placement?.id,
    fields: [
      {
        title: 'Link',
        icon: <LinkIcon />,
        value: placement?.link,
        type: 'link',
      },
      {
        title: 'Tool',
        icon: <BuildIcon />,
        value: placement?.tool?.name,
        href: placement?.tool?.link,
        type: 'nameLink',
      },
      {
        title: 'Placement Type',
        icon: <ListAltOutlinedIcon />,
        value: placement?.placement_type.name,
        type: 'text',
      },
      {
        title: 'Accounts',
        icon: <AccountBoxIcon />,
        value: placement?.accounts,
        type: 'moreChips',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <PlacementsActions
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
