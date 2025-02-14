import DescriptionIcon from '@mui/icons-material/Description';
import { IconButton } from '@mui/material';
export default function Note({
  value,
  setNote,
  style,
}: {
  value: string;
  style?: any;
  setNote: (value: string) => void;
}) {
  return (
    <IconButton
      onClick={() => setNote(value)}
      sx={{
        padding: '0px',
        '&:hover': { color: (theme) => theme.palette.primary.main },
        ...style,
      }}
      disabled={!value}
    >
      <DescriptionIcon />
    </IconButton>
  );
}
