'use client';

import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import useActions from '@/hooks/useActions';
import EditsActions from '../../EditsActions';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

interface IEditProps {
  id: number;
  index: string;
  value: string;
  edit: any;
  commonData: ICommonData;
}

export default function EditProfile({ id, edit, value, commonData, index }: IEditProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: edit?.name,
    id: edit?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: edit?.description,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: edit?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: edit?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Name',
        icon: <PersonOutlineIcon />,
        value: edit?.name,
        type: 'text',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <EditsActions
          id={id}
          url={`edits/${id}`}
          visible={actionsData.visible}
          commonData={commonData ?? []}
          handleActions={handleActions}
        />
      </>
    )
  );
}
