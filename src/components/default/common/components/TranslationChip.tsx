import { MouseEvent, useRef, forwardRef } from 'react';
import { Avatar, Tooltip, Chip, Stack, Divider, ButtonProps, styled } from '@mui/material';
import Image from 'next/image';

interface ITranslationChipProps {
  data: any;
  click: (id?: number | string) => void;
  sx?: {
    [key: string]: string | number;
  };
}

interface ActionObjectBtnProps extends ButtonProps {
  isLeft: boolean;
  isTranslated: boolean;
  'data-chip': string;
}

const ActionObjectBtn = styled('button')<ActionObjectBtnProps>(
  ({ theme, isLeft, isTranslated }) => ({
    height: '2rem',
    padding: '0 11px',
    color: !isTranslated ? '#fff' : '#000',
    backgroundColor: !isTranslated
      ? `${theme.palette.secondary.main} !important`
      : '#fff !important',
    borderTopLeftRadius: isLeft ? '1rem' : 'unset',
    borderBottomLeftRadius: isLeft ? '1rem' : 'unset',
    borderTopRightRadius: isLeft ? 'unset' : '1rem',
    borderBottomRightRadius: isLeft ? 'unset' : '1rem',
  })
);

const ActionObjectChip = forwardRef(function ActionObjectChip({
  data,
  sx,
  click,
}: ITranslationChipProps) {
  const { action, object } = data;

  const handleClick = (event: MouseEvent) => {
    const btnType = event.currentTarget.getAttribute('data-chip');
    if (btnType === 'action') {
      if (!action?.is_translated) click(action?.id);
    }
    if (btnType === 'object') {
      if (!object?.is_translated) click(object?.id);
    }
  };
  return (
    <Stack
      flexDirection='row'
      sx={{
        fontSize: '.9rem',
        border: '1px solid #bdbdbd',
        padding: 0,
        borderRadius: '1rem',
        ...sx,
      }}
    >
      <ActionObjectBtn
        isTranslated={!!action?.is_translated}
        type='button'
        isLeft
        data-chip='action'
        onClick={handleClick}
      >
        {action?.name}
      </ActionObjectBtn>
      <Divider orientation='vertical' flexItem />
      <ActionObjectBtn
        isTranslated={!!object?.is_translated}
        type='button'
        data-chip='object'
        isLeft={false}
        onClick={handleClick}
      >
        {object?.name}
      </ActionObjectBtn>
    </Stack>
  );
});

export default function TranslationChip({ data, sx, click }: ITranslationChipProps) {
  const name = data?.name ?? data?.title;
  const ref = useRef<HTMLDivElement>(null);
  const isTranslated = Number.isNaN(+data?.is_translated) || !!data?.is_translated;
  const handleClick = () => {
    if (!isTranslated) {
      click(data?.id);
    }
  };

  return (
    <Tooltip title={!isTranslated ? 'Add Translation' : name} placement='top'>
      {!data?.is_action_object ? (
        <Chip
          key={data?.id}
          label={name}
          variant='outlined'
          avatar={
            data?.image && (
              <Avatar alt={name} sx={{ width: 15, height: 15 }}>
                <Image src={data?.image} alt={name} layout='fill' loading='lazy' />
              </Avatar>
            )
          }
          onClick={handleClick}
          sx={{
            backgroundColor: (theme) => (!isTranslated ? theme.palette.secondary.main : '#fff'),
            color: () => (!isTranslated ? '#fff' : '#000'),
            height: '1.5rem',
            fontSize: '.9rem',
            '&.MuiChip-root': {
              padding: '1rem 2px',
            },
            '&:hover': {
              backgroundColor: (theme) =>
                !isTranslated ? `${theme.palette.secondary.main} !important` : '#fff !important',
            },
            ...sx,
          }}
        />
      ) : (
        <ActionObjectChip ref={ref} data={data} sx={sx} click={click} />
      )}
    </Tooltip>
  );
}
