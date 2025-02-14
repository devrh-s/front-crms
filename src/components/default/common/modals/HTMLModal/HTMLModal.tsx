import { Box, Modal } from '@mui/material';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  // border: "2px solid #000",
  borderRadius: '4px',
  boxShadow: 24,
  p: 4,
};

interface IHTMLModalProps {
  html: string;
  handleClose: () => void;
}

export default function HTMLModal({ html, handleClose }: IHTMLModalProps) {
  return (
    <Modal
      open={!!html}
      onClose={handleClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={style}>
        <Box dangerouslySetInnerHTML={{ __html: html }} />
      </Box>
    </Modal>
  );
}
