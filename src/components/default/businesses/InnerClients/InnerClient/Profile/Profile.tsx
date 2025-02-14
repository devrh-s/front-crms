'use client';
import InnerClientActions from '../../InnerClientActions';
import useActions from '@/hooks/useActions';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import DescriptionIcon from '@mui/icons-material/Description';
import HolidayVillageIcon from '@mui/icons-material/HolidayVillage';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

interface ProfileProps {
  id: number;
  index: string;
  value: string;
  innerClient: IInnerClient | null;
  commonData: ICommonData;
}

export default function Profile({ id, index, value, commonData, innerClient }: ProfileProps) {
  const { actionsData, handleActions } = useActions();

  const profile = {
    name: innerClient?.name,
    id: innerClient?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: innerClient?.description,
      type: 'text',
    },
    fields: [
      {
        title: 'Name',
        icon: <PersonOutlineIcon />,
        value: innerClient?.name,
        type: 'text',
      },
      {
        title: 'Website',
        icon: <NewspaperIcon />,
        value: innerClient?.website,
        type: 'link',
        targetName: 'Website',
      },
      {
        title: 'Tax number',
        icon: <ConfirmationNumberOutlinedIcon />,
        value: innerClient?.tax_number,
        type: 'text',
      },
      {
        title: 'Company type',
        icon: <HolidayVillageIcon />,
        value: innerClient?.company_type?.name,
        type: 'text',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />
        <InnerClientActions
          id={id}
          isProfile
          visible={actionsData.visible}
          commonData={commonData}
          handleActions={handleActions}
        />
      </>
    )
  );
}
