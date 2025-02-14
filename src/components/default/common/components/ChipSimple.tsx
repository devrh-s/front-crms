import { Chip } from '@mui/material';

export default function ChipSimple({ value }: { value: number | string }) {
  return (
    <Chip
      label={value}
      sx={{
        height: '1.75rem',
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        padding: '0',
        fontSize: '0.75rem',
        lineHeight: 1,
      }}
    />
  );
}
