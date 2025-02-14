import { Box, Button, IconButton, Modal, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { tooltip } from 'leaflet';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  maxWidth: '30rem',
  bgcolor: 'background.paper',
  borderRadius: '4px',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  padding: '1rem',
  pb: '2rem',
};

interface IEditModalProps {
  setValue: any;
  handleClose: () => void;
  handleSubmit: any;
  isLoading: boolean;
  isErrorTooltip: boolean;
  objectTooltip: {
    entity_block_field_id: number;
    name: string;
    field: string;
    block: string;
    tooltip: string;
  } | null;
}

export default function EditModal({
  setValue,
  handleClose,
  handleSubmit,
  isLoading,
  isErrorTooltip,
  objectTooltip,
}: IEditModalProps) {
  return (
    <Modal
      open={!!objectTooltip?.entity_block_field_id}
      onClose={handleClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={style}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: '1.2rem',
            }}
          >
            Edit Tooltip
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <TextField
          multiline
          label={`${objectTooltip?.name}→${objectTooltip?.block}→${objectTooltip?.field}`}
          rows={4}
          helperText={isErrorTooltip ? 'Validation fails' : ''}
          error={isErrorTooltip}
          sx={{
            width: '100%',
            textAlign: 'center',
          }}
          value={objectTooltip?.tooltip ? objectTooltip?.tooltip : ''}
          onChange={(e) => setValue((prev: any) => ({ ...prev, tooltip: e.target.value }))}
        />
        <Button
          disabled={isLoading}
          size='large'
          variant='contained'
          sx={{
            width: '100%',
          }}
          onClick={() => {
            handleSubmit();
          }}
        >
          Submit
        </Button>
      </Box>
    </Modal>
  );
}
