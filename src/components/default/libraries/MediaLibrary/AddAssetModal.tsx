import Image from 'next/image';
import { useState, useMemo, useEffect, DragEvent, useRef, ChangeEvent } from 'react';
import {
  Modal,
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  IconButton,
  Button,
  Stack,
  Divider,
  useMediaQuery,
  LinearProgress,
  linearProgressClasses,
  Alert,
  Theme,
  Grow,
  styled,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaUpload } from '@/lib/fetch';
import CloseIcon from '@mui/icons-material/Close';
import useNotification from '@/hooks/useNotification';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ReactPlayer from 'react-player';
import ReactAudioPlayer from 'react-audio-player';
import { getFileExt } from '@/lib/helpers';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import useUserProfile from '@/hooks/useUserProfile';
import type { View } from './types';
import { v4 as uuidv4 } from 'uuid';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  padding: '1rem 0',
};

interface IFolderModalProps {
  open: boolean;
  id?: number;
  slug?: string[];
  handleClose: () => void;
}

interface ISinglePreviewProps {
  file: File;
  handleDelete: () => void;
}

interface IMultiplePreviewProps {
  file: File | null;
  progress: number;
}

interface IChunkData {
  chunk: any;
  totalChunks: number;
  currentChunk: number;
  originalFileName: string;
  folderId?: number;
  userId?: number;
  fileName: string;
}

const AnimatedBackground = styled('div')({
  '@keyframes move': {
    '100%': {
      backgroundPosition: '0% 0%',
    },
  },
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  backgroundImage:
    'repeating-linear-gradient(-45deg, transparent, transparent 1rem, #e0e0e0 1rem, #e0e0e0 2rem);',
  backgroundPosition: '100% 100%',
  backgroundSize: '200% 200%',
  zIndex: -1,
  opacity: 0,
  transition: 'opacity .2s ease-in-out',
  animation: 'move 10s linear infinite;',
});

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[800],
    }),
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: '#1a90ff',
    ...theme.applyStyles('dark', {
      backgroundColor: '#308fe8',
    }),
  },
}));

const allowedImageTypes = /.jpg|.jpeg|.png|.svg|.webp/;
const allowedFileTypes = /.xls|.xlsx|.doc|.docx|.pdf/;
const allowedAudioTypes = /.mp3/;
const allowedVideoTypes = /.mp4|.mkv|.mov/;

const getAllowedTypes = (view: View) => {
  if (view === 'image') {
    return allowedImageTypes.source.split('|').join(' ');
  }
  if (view === 'file') {
    return allowedFileTypes.source.split('|').join(' ');
  }
  if (view === 'audio') {
    return allowedAudioTypes.source.split('|').join(' ');
  }
  if (view === 'video') {
    return allowedVideoTypes.source.split('|').join(' ');
  }
};

const checkUploadAvailable = (previewVisible: boolean, filesReady: boolean) =>
  previewVisible && filesReady;

async function uploadChunk({
  chunk,
  totalChunks,
  currentChunk,
  originalFileName,
  folderId,
  userId,
  fileName,
}: IChunkData) {
  const formData = new FormData();
  formData.append('file', chunk);
  formData.append('totalChunks', `${totalChunks}`);
  formData.append('chunkNumber', `${currentChunk}`);
  formData.append('filename', fileName);
  formData.append('originalname', originalFileName);
  if (userId) {
    formData.append('user_id', `${userId}`);
  }
  if (folderId) {
    formData.append('folder_id', `${folderId}`);
  }
  await mediaUpload('assets', formData);
}

function ImagePreview({ file, handleDelete }: ISinglePreviewProps) {
  const [fileUrl, setFileUrl] = useState<any>('');

  useEffect(() => {
    if (file?.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = function (e) {
        setFileUrl(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
    if (file) {
      setFileUrl(URL.createObjectURL(file));
    }
  }, [file]);

  return (
    <Stack
      sx={{
        position: 'relative',
        border: (theme) => `1px dotted ${theme.palette.primary.main}`,
        padding: '1.5rem',
        width: 'max-content',
      }}
    >
      <IconButton
        color='error'
        size='small'
        onClick={handleDelete}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
        }}
      >
        <CloseIcon fontSize='small' />
      </IconButton>
      <Image src={fileUrl} height={100} width={100} alt='New user image' />
    </Stack>
  );
}

function FilePreview({ file, handleDelete }: ISinglePreviewProps) {
  return (
    <Stack
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        border: (theme) => `1px dotted ${theme.palette.primary.main}`,
        padding: '2rem',
        width: 'max-content',
      }}
    >
      <IconButton
        color='error'
        size='small'
        onClick={handleDelete}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
        }}
      >
        <CloseIcon fontSize='small' />
      </IconButton>
      <InsertDriveFileOutlinedIcon sx={{ fontSize: '3rem' }} />
      <Typography>{getFileExt(file.name)}</Typography>
    </Stack>
  );
}

function VideoPreview({ file, progress }: IMultiplePreviewProps) {
  const [fileUrl, setFileUrl] = useState<any>('');

  useEffect(() => {
    if (file) {
      setFileUrl(URL.createObjectURL(file));
    }
  }, [file]);

  return (
    <Stack
      sx={{
        position: 'relative',
      }}
    >
      {progress > 0 && (
        <Stack
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, .7)',
          }}
        >
          <Stack justifyContent='center' alignItems='center' gap='1rem' sx={{ height: '100%' }}>
            <Box sx={{ width: '50%' }}>
              <BorderLinearProgress variant='determinate' value={progress} />
            </Box>
            <Typography sx={{ color: '#fff', fontSize: '1.2rem' }}>
              {Math.round(progress)}/100%
            </Typography>
          </Stack>
        </Stack>
      )}
      <ReactPlayer
        width={400}
        height={'auto'}
        playing={true}
        muted={true}
        style={{ aspectRatio: 1.77 }}
        url={fileUrl}
      />
    </Stack>
  );
}

function AudioPreview({ file, progress }: IMultiplePreviewProps) {
  const [fileUrl, setFileUrl] = useState<any>('');

  useEffect(() => {
    if (file) {
      setFileUrl(URL.createObjectURL(file));
    }
  }, [file]);

  return (
    <Stack
      sx={{
        position: 'relative',
      }}
    >
      {progress > 0 && (
        <Stack
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, .7)',
          }}
        >
          <Stack justifyContent='center' alignItems='center' gap='1rem' sx={{ height: '100%' }}>
            <Box sx={{ width: '50%' }}>
              <BorderLinearProgress variant='determinate' value={progress} />
            </Box>
            <Typography sx={{ color: '#fff', fontSize: '1.2rem' }}>
              {Math.round(progress)}/100%
            </Typography>
          </Stack>
        </Stack>
      )}
      <ReactAudioPlayer src={fileUrl} controls />
    </Stack>
  );
}

export default function AddAssetModal({ id, slug, open, handleClose }: IFolderModalProps) {
  const { userProfile } = useUserProfile();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const showNotification = useNotification();
  const bgRef = useRef<HTMLDivElement>(null);
  const [uploadingProgress, setUploadingProgress] = useState(0);
  const [view, setView] = useState<View>('image');
  const [files, setFiles] = useState<File[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const isMultiple = view === 'image' || view === 'file';
  const isSingle = view === 'video' || view === 'audio';

  const isUploadAvailable = checkUploadAvailable(
    previewVisible,
    isMultiple ? !!files.length : !!file
  );
  const queryClient = useQueryClient();

  const isInvalid = useMemo(() => {
    if (view === 'image' && files.length) {
      return files.some((file) => {
        const extension = `.${getFileExt(file.name)}`;
        return !allowedImageTypes.test(extension.toLowerCase());
      });
    }
    if (view === 'file' && files.length) {
      return files.some((file) => {
        const extension = `.${getFileExt(file.name)}`;
        return !allowedFileTypes.test(extension.toLowerCase());
      });
    }
    if (view === 'video' && file) {
      const extension = `.${getFileExt(file.name)}`;
      return !allowedVideoTypes.test(extension.toLowerCase());
    }
    if (view === 'audio' && file) {
      const extension = `.${getFileExt(file.name)}`;
      return !allowedAudioTypes.test(extension.toLowerCase());
    }
    return false;
  }, [files, file, view]);

  const clearAllFiles = (type?: View) => {
    if (type === 'image' || type === 'file') setFiles([]);
    if (type === 'video' || type === 'audio') setFile(null);
    if (!type) {
      setFiles([]);
      setFile(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadMultipleMutation = useMutation({
    mutationFn: ({ data, id, userId }: { data: File[]; id?: number; userId?: number }) => {
      const formData = new FormData();
      data.forEach((file) => {
        formData.append('files', file);
      });
      if (id) {
        formData.append('folder_id', `${id}`);
      }
      if (userId) {
        formData.append('user_id', `${userId}`);
      }
      return mediaUpload('assets/multiple', formData);
    },
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
      showNotification('Files successfully uploaded', 'success');
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      showNotification(`${status}: ${error ?? 'Something went wrong'}`, 'error');
    },
  });

  const uploadSingleMutation = useMutation({
    mutationFn: ({ data, id }: { data: File | null; id?: number }) => uploadFile(data, id),
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
      showNotification('File successfully uploaded', 'success');
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      showNotification(`${status}: ${error ?? 'Something went wrong'}`, 'error');
    },
  });

  const isLoading = uploadMultipleMutation.isPending || uploadSingleMutation.isPending;

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      if (isMultiple) {
        setFiles((prev) => [...prev, ...files]);
      }
      if (isSingle) {
        setFile(files[0]);
      }
      setPreviewVisible(true);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (bgRef.current) {
      bgRef.current.style.opacity = '1';
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (bgRef.current) {
      bgRef.current.style.opacity = '0';
    }
  };

  const handleAddAsset = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (file) {
      if (isMultiple) {
        setFiles((prev) => [...prev, file]);
      }
      if (isSingle) {
        setFile(file);
      }
      setPreviewVisible(true);
    }
  };

  const uploadFile = async (dataFile: File | null, id?: number) => {
    if (dataFile) {
      const file = dataFile;
      const chunkSize = 1024 * 1024;
      const totalChunks = Math.ceil(file.size / chunkSize);
      let startByte = 0;
      const divider = file.name.lastIndexOf('.');
      const extension = file.name.substring(divider + 1);
      const name = file.name.substring(0, divider);
      const fullName = `${name}_${uuidv4()}.${extension}`;
      for (let i = 1; i <= totalChunks; i++) {
        const endByte = Math.min(startByte + chunkSize, file.size);
        const chunk = file.slice(startByte, endByte);
        const progressValue = (i / totalChunks) * 100;
        await uploadChunk({
          chunk,
          totalChunks,
          currentChunk: i,
          originalFileName: file.name,
          fileName: fullName,
          userId: userProfile?.id,
          folderId: id,
        });
        startByte = endByte;
        setUploadingProgress(progressValue);
      }
      setUploadingProgress(0);
    }
  };

  const handleUpload = () => {
    if (isMultiple) {
      uploadMultipleMutation.mutate({ data: files, id, userId: userProfile?.id });
    }
    if (isSingle) {
      uploadSingleMutation.mutate({ data: file, id });
    }
  };

  const handleChangeView = (_: React.SyntheticEvent, newValue: View) => {
    clearAllFiles();
    setView(newValue);
  };

  useEffect(() => {
    if (!open) {
      setPreviewVisible(false);
      clearAllFiles();
    }
  }, [open]);

  useEffect(() => {
    if (isMultiple) {
      if (!files.length) setPreviewVisible(false);
    }
    if (isSingle) {
      if (!file) setPreviewVisible(false);
    }
  }, [file, files, view]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby='parent-modal-title'
      aria-describedby='parent-modal-description'
    >
      <Paper elevation={0} sx={{ ...style, width: '100%', maxWidth: !mdDown ? 800 : 375 }}>
        <Stack flexDirection='row' justifyContent='space-between' sx={{ padding: '0 5px' }}>
          <Typography variant='h5' textAlign='center' sx={{ width: '100%' }}>
            Add new assets
          </Typography>
          <IconButton color='error' size='small' onClick={handleClose}>
            <CloseIcon fontSize='small' />
          </IconButton>
        </Stack>
        <Divider />
        <Grow in={isInvalid} style={{ transformOrigin: '0 0 0' }}>
          <Alert
            variant='filled'
            severity='warning'
            sx={{ margin: '1rem 1rem 0', display: isInvalid ? 'flex' : 'none' }}
          >
            Invalid file format. Available formats is: {getAllowedTypes(view)}
          </Alert>
        </Grow>
        {!previewVisible && (
          <Stack gap='1rem' sx={{ padding: '1rem' }}>
            <Stack>
              <Box sx={{ width: '100%' }}>
                <Tabs
                  value={view}
                  onChange={handleChangeView}
                  textColor='primary'
                  indicatorColor='primary'
                >
                  <Tab value='image' label='Images' />
                  <Tab value='video' label='Video' />
                  <Tab value='audio' label='Audio' />
                  <Tab value='file' label='Files' />
                </Tabs>
              </Box>
            </Stack>
            <Stack
              component='label'
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              justifyContent='center'
              alignItems='center'
              sx={{
                width: '100%',
                minHeight: '15rem',
                position: 'relative',
                border: '1px dashed grey',
                borderRadius: '.5rem',
                cursor: 'pointer',
                ':hover div': {
                  opacity: '1 !important',
                },
              }}
            >
              <AnimatedBackground ref={bgRef} />
              <Stack
                alignItems='center'
                gap='1rem'
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <AddBoxIcon color='primary' />
                <Typography variant='h5'>Drag & Drop</Typography>
              </Stack>
              <VisuallyHiddenInput type='file' onChange={handleAddAsset} />
            </Stack>
          </Stack>
        )}
        {previewVisible && (
          <Stack
            gap='1rem'
            flexDirection='row'
            justifyContent='center'
            flexWrap='wrap'
            alignItems='center'
            sx={{ padding: '1rem', paddingTop: '3rem', minHeight: '20rem', position: 'relative' }}
          >
            <Button
              variant='contained'
              color='primary'
              size='small'
              startIcon={<AddBoxIcon />}
              onClick={() => setPreviewVisible(false)}
              sx={{
                position: 'absolute',
                top: '5px',
                right: '5px',
              }}
            >
              Add assets
            </Button>
            {view === 'image' &&
              files.map((image, index) => (
                <ImagePreview
                  key={`image-${index}`}
                  file={image}
                  handleDelete={() => removeFile(index)}
                />
              ))}
            {view === 'file' &&
              files.map((file, index) => (
                <FilePreview
                  key={`file-${index}`}
                  file={file}
                  handleDelete={() => removeFile(index)}
                />
              ))}
            {view === 'video' && <VideoPreview file={file} progress={uploadingProgress} />}
            {view === 'audio' && <AudioPreview file={file} progress={uploadingProgress} />}
          </Stack>
        )}
        {isUploadAvailable && (
          <>
            <Divider />
            <Stack flexDirection='row' justifyContent='flex-end' sx={{ padding: '.5rem 1rem 0' }}>
              <Button
                variant='contained'
                type='submit'
                onClick={handleUpload}
                disabled={isLoading || isInvalid}
              >
                Upload assets
              </Button>
            </Stack>
          </>
        )}
      </Paper>
    </Modal>
  );
}
