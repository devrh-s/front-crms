import { useState, useEffect } from 'react';
import {
  Dialog,
  TextField,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import useNotification from '@/hooks/useNotification';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiDeleteData } from '@/lib/fetch';

interface IDeleteModalProps {
  open: boolean;
  ids: number[];
  url: string;
  rows: Array<any>;
  query: string;
  handleClose: () => void;
}

export default function DeleteModal({
  open,
  url,
  rows,
  ids,
  query,
  handleClose,
}: IDeleteModalProps) {
  const showNotification = useNotification();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const element = ids?.length === 1 ? rows.find((el) => el.id === ids[0]) : null;
  const name = element?.name ?? null;
  const title = element?.title ?? null;
  const deleteText = name || title;

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => apiDeleteData(`${url}/${ids}`, reason),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [query],
        });
        showNotification('Successfully deleted', 'success');
        handleClose();
      }
    },
    onError: (responseError: ResponseError) => {
      const errorMessage = responseError.response?.data?.message || 'Something went wrong';
      const reasonError = responseError.response?.data?.error?.reason?.[0] || 'Unknown error';

      showNotification(`${responseError.status}: ${errorMessage}`, 'error');
      setError(reasonError);
      setReason('');
    },
  });

  useEffect(() => {
    if (open) {
      setError('');
      setReason('');
    }
  }, [open]);

  const handleDelete = async () => deleteMutation.mutate();

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
          gap: '1rem',
        }}
      >
        <DialogContentText id='alert-dialog-description'>
          {`Are you sure, you want to remove ${deleteText ? `"${deleteText}"` : 'selected elements'}?`}
        </DialogContentText>
        <TextField
          variant='standard'
          type='email'
          placeholder='Please, enter reason'
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={!!error}
          helperText={error}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Return</Button>
        <Button onClick={handleDelete} disabled={!reason}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
