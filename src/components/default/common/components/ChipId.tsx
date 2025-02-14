import { Chip } from '@mui/material';

export default function ChipId({ id, style }: { id: number; style?: any }) {
  return (
    <div>
      <Chip
        label={id}
        sx={{
          backgroundColor: '#fff',
          boxShadow: '0 0 3px #000',
          minWidth: '2.5rem',
          height: '1.5rem',
          ...style,
        }}
      />
    </div>
  );
}
