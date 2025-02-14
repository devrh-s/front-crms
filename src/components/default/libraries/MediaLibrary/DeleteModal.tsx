import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Divider,
  Typography,
} from '@mui/material';
import useNotification from '@/hooks/useNotification';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { mediaDelete } from '@/lib/fetch';

export enum DeleteModalTypes {
  FOLDER = 'folders',
  ASSET = 'assets',
  UNSET = '',
}

interface IDeleteModalProps {
  open: boolean;
  id: number | null;
  type: DeleteModalTypes;
  slug?: string[];
  handleClose: () => void;
}

export default function DeleteModal({ id, slug, open, type, handleClose }: IDeleteModalProps) {
  const showNotification = useNotification();

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () => mediaDelete(`${type}/${id}`),
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [slug ? `media-folders-${slug.join('-')}` : 'media-folders'],
        }),
        queryClient.invalidateQueries({
          queryKey: [slug ? `media-assets-${slug.join('-')}` : 'media-assets'],
        }),
      ]);
      handleClose();
      showNotification('Successfully created', 'success');
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      showNotification(`${status}: ${error ?? 'Something went wrong'}`, 'error');
    },
  });

  const handleDelete = async () => {
    if (type !== DeleteModalTypes.UNSET) {
      deleteMutation.mutate();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: 375,
          '&.MuiDialogContent-root': { padding: '1rem 0' },
        }}
      >
        <DialogContentText
          id='alert-dialog-description'
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '.5rem',
          }}
        >
          <Typography variant='h5' textAlign='center'>
            Confirmation
          </Typography>
          <Divider sx={{ width: '100%' }} />

          <ErrorOutlineIcon color='error' />
          <Typography textAlign='center'>Are you sure?</Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Return</Button>
        <Button color='error' variant='outlined' onClick={handleDelete}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
