import { Box, Chip, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

interface IStatusProps {
  name: string | undefined;
  color: string | undefined;
  onClick?: () => void;
  sx?: {
    [key: string]: string | number;
  };
  view?: 'table' | 'card';
}

export default function Status({ name, color, sx, onClick }: IStatusProps) {
  const wordsArr = name?.split(' ') ?? [];
  const visibleName = wordsArr.length > 1 ? wordsArr.join('\xa0') : name;
  if (!name) return;
  return (
    <Box
      component='span'
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        boxSizing: 'border-box',
        color,
        borderColor: color,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '60px',
        padding: '.15rem .5rem',
        fontSize: '1rem',
        lineHeight: 1,
        textTransform: 'capitalize',
        position: 'relative',
        ...sx,
        '&:hover .edit-chip': {
          opacity: 1,
          scale: 1,
        },
      }}
    >
      {visibleName}
      <Box
        className='edit-chip'
        sx={{
          display: onClick ? 'flex' : 'none',
          position: 'absolute',
          top: -4,
          left: 'calc(100% - 8px)',
          opacity: 0,
          scale: 0.8,
          width: '25px',
          bgcolor: '#bdbdbd',
          aspectRatio: 1,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '50%',
          transition: 'all 0.3s ease',
        }}
      >
        <EditIcon
          sx={{
            color: '#fff',
            width: '15px',
          }}
        />
      </Box>
    </Box>
  );
}
