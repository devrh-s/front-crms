import { useEffect } from 'react';
import {
  Modal,
  TextField,
  Paper,
  Typography,
  IconButton,
  Button,
  Stack,
  Card,
  CardContent,
  CardMedia,
  Tooltip,
  Divider,
} from '@mui/material';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaPut } from '@/lib/fetch';
import CloseIcon from '@mui/icons-material/Close';
import useNotification from '@/hooks/useNotification';
import ReactPlayer from 'react-player';
import { formatSize, getFileExt } from '@/lib/helpers';
import dayjs from 'dayjs';
import { grey } from '@mui/material/colors';
import type { IAsset } from './types';
import config from '@/config';
import ReactAudioPlayer from 'react-audio-player';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

const { MEDIA_URL, MEDIA_SECRET } = config;

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  padding: '1rem 0',
};

interface IFormInputs {
  name: string;
  folder_id?: string;
}

interface IEditAssetModalProps {
  open: boolean;
  folderOprions: IOption[];
  slug?: string[];
  parentId: number | null;
  asset: IAsset | null;
  name: string;
  handleOpenDelete: (id: number) => void;
  handleClose: () => void;
}

export default function EditAssetModal({
  open,
  asset,
  parentId,
  name,
  slug,
  folderOprions,
  handleOpenDelete,
  handleClose,
}: IEditAssetModalProps) {
  const defaultFolder = {
    id: parentId ?? '0',
    name: name ?? 'Media Library',
  };
  const showNotification = useNotification();
  const { register, control, setValue, handleSubmit } = useForm<IFormInputs>();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => mediaPut(`assets/${asset?.id}`, data),
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

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = { ...data };
    if (!commonData?.folder_id || +commonData.folder_id === 0) {
      delete commonData.folder_id;
    }
    mutation.mutate(commonData);
  };

  const downloadFile = async (fileUrl: string) => {
    const blob = await fetch(fileUrl).then((res) => res.blob());
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileUrl.split('/').pop()?.split('?')[0] || 'unknown';
    document.body.append(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    if (asset) {
      setValue('name', asset.name);
    } else {
      setValue('name', '');
    }
    setValue('folder_id', parentId ? `${parentId}` : '0');
  }, [parentId, asset]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby='parent-modal-title'
      aria-describedby='parent-modal-description'
    >
      <Paper elevation={0} sx={{ ...style, minWidth: 375, width: { xs: '80%', lg: '50%' } }}>
        <Stack flexDirection='row' justifyContent='space-between' sx={{ padding: '0 5px' }}>
          <Typography variant='h5' textAlign='center' sx={{ width: '100%' }}>
            Details
          </Typography>
          <IconButton color='error' size='small' onClick={handleClose}>
            <CloseIcon fontSize='small' />
          </IconButton>
        </Stack>
        <Divider />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack
            flexDirection='row'
            alignItems='flex-start'
            gap='1rem'
            sx={{ width: '100%', padding: '1rem', flexDirection: { xs: 'column', md: 'row' } }}
          >
            <Card sx={{ flex: 1, width: { xs: '100%', md: 'unset' } }}>
              <Stack
                alignItems='center'
                justifyContent='center'
                sx={{
                  padding: '1rem',
                  position: 'relative',
                  background: `repeating-conic-gradient(rgba(24, 24, 38, 0.2) 0% 25%,transparent 0% 50%) 50%/20px 20px`,
                }}
              >
                {asset?.type === 'image' && (
                  <>
                    <Tooltip title='Download' placement='top'>
                      <IconButton
                        onClick={() =>
                          downloadFile(`${MEDIA_URL}/${asset.url}?media=${MEDIA_SECRET}`)
                        }
                        sx={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                        }}
                      >
                        <FileDownloadIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                    <CardMedia
                      sx={{ height: 140, backgroundSize: 'contain', width: '100%' }}
                      image={`${MEDIA_URL}/${asset.url}?media=${MEDIA_SECRET}`}
                      title={asset?.name}
                    />
                  </>
                )}
                {asset?.type === 'file' && (
                  <>
                    <Tooltip title='Download' placement='top'>
                      <IconButton
                        onClick={() =>
                          downloadFile(`${MEDIA_URL}/${asset.url}?media=${MEDIA_SECRET}`)
                        }
                        sx={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                        }}
                      >
                        <FileDownloadIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                    <InsertDriveFileOutlinedIcon sx={{ fontSize: '3rem' }} />
                    <Typography>{getFileExt(asset?.name)}</Typography>
                  </>
                )}
                {asset?.type === 'video' && (
                  <ReactPlayer
                    width={'auto'}
                    height={140}
                    playing={false}
                    controls
                    muted={true}
                    volume={0.5}
                    style={{ aspectRatio: 1.77 }}
                    url={`${MEDIA_URL}/${asset.url}?media=${MEDIA_SECRET}`}
                  />
                )}
                {asset?.type === 'audio' && (
                  <ReactAudioPlayer
                    src={`${MEDIA_URL}/${asset.url}?media=${MEDIA_SECRET}`}
                    controls
                  />
                )}
              </Stack>
            </Card>
            <Stack gap='1rem' sx={{ flex: 1, width: { xs: '100%', md: 'unset' } }}>
              <Card>
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    bgcolor: grey[200],
                  }}
                >
                  <Stack justifyContent='space-evenly' flexDirection='row'>
                    <Stack alignItems='center'>
                      <Typography textTransform='uppercase'>Size</Typography>
                      <Typography>{formatSize(asset?.size ?? 0)}</Typography>
                    </Stack>
                    <Stack alignItems='center'>
                      <Typography textTransform='uppercase'>Date</Typography>
                      <Typography>
                        {asset?.createdAt ? dayjs(asset.createdAt).format('DD/MM/YYYY') : '&nbsp;'}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack justifyContent='space-evenly' flexDirection='row'>
                    <Stack alignItems='center'>
                      <Typography textTransform='uppercase'>Extension</Typography>
                      <Typography>{getFileExt(asset?.url ?? '')}</Typography>
                    </Stack>
                    <Stack alignItems='center'>
                      <Typography textTransform='uppercase'>Asset id</Typography>
                      <Typography>{asset?.id}</Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Stack gap='1rem'>
                    <TextField
                      variant='standard'
                      type='name'
                      label='File name'
                      InputLabelProps={{ shrink: true }}
                      // error={!!errors.name}
                      // helperText={errors.name ? errors.name : ''}
                      sx={{ minWidth: '15rem', flex: 1 }}
                      fullWidth
                      {...register('name')}
                    />
                    <Controller
                      name='folder_id'
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        return (
                          <CustomSingleSelect
                            label='Location'
                            field={field}
                            required
                            options={[defaultFolder, ...folderOprions]}
                            error={error}
                            style={{
                              minWidth: '15rem',
                              flex: 1,
                            }}
                          />
                        );
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Stack>
          <Divider />
          <Stack
            flexDirection='row'
            justifyContent='flex-end'
            gap='1rem'
            sx={{ padding: '1rem 1rem 0' }}
          >
            {asset && (
              <Button variant='outlined' color='error' onClick={() => handleOpenDelete(asset.id)}>
                Delete
              </Button>
            )}
            <Button variant='contained' type='submit'>
              Update
            </Button>
          </Stack>
        </form>
      </Paper>
    </Modal>
  );
}
