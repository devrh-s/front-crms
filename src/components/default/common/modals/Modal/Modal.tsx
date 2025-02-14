import {
  Box,
  Stack,
  LinearProgress,
  IconButton,
  Modal as ModalMui,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NameLink from '../../components/NameLink';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  maxWidth: '35rem',
  bgcolor: 'background.paper',
  // border: "2px solid #000",
  borderRadius: '4px',
  boxShadow: 24,
  overflowY: 'auto',
  p: '2rem',
};

interface IInfoModalProps {
  open: boolean;
  handleClose: () => void;
  children: any;
  title: string;
  loading?: boolean;
  link?: string;
}

export default function Modal({
  open,
  title,
  children,
  loading = false,
  handleClose,
  link,
}: IInfoModalProps) {
  return (
    <ModalMui
      open={open}
      onClose={handleClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={style}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              top: 0,
              left: 0,
            }}
          >
            <LinearProgress />
          </Box>
        )}
        {!link && (
          <Typography
            sx={{
              textAlign: 'center',
              fontSize: '20px',
              fontWeight: 500,
              mb: '20px',
            }}
          >
            {title}
          </Typography>
        )}
        {link && (
          <NameLink
            href={link}
            name={title}
            sx={{ pl: 0, justifyContent: 'center', mb: '20px', fontSize: '20px' }}
          />
        )}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            width: 'min-content',
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box className='customScroll' sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {children}
        </Box>
      </Box>
    </ModalMui>
  );
}
