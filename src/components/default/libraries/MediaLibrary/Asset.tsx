import {
  Card,
  CardMedia,
  CardContent,
  Stack,
  Typography,
  IconButton,
  Button,
  Grid,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import ReactPlayer from 'react-player';
import EditIcon from '@mui/icons-material/Edit';
import { formatSize } from '@/lib/helpers';
import type { IAsset } from './types';
import ReactAudioPlayer from 'react-audio-player';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import config from '@/config';

interface AssetProps {
  asset: IAsset;
  handleEdit: () => void;
}

const { MEDIA_URL, MEDIA_SECRET } = config;

export default function Asset({ asset, handleEdit }: AssetProps) {
  const assetNameData = asset.name?.split('.');
  const type = asset.type;
  const extName = assetNameData[assetNameData.length - 1];
  const assetShortName = assetNameData[0].slice(0, 20);
  const assetName =
    assetShortName === assetNameData[0]
      ? assetShortName + '.' + extName
      : assetShortName + '...' + extName;
  return (
    <Grid item xs={12} md={6} xl={3}>
      <Card
        sx={{
          height: 240,
          position: 'relative',
          cursor: 'pointer',
          '&:hover .media-edit-btn': {
            visibility: 'visible',
            opacity: 1,
          },
        }}
      >
        <IconButton
          className='media-edit-btn'
          size='small'
          color='primary'
          onClick={handleEdit}
          sx={{
            visibility: 'hidden',
            opacity: 0,
            position: 'absolute',
            top: '5px',
            right: '5px',
            transition: 'all .2s ease-in',
            bgcolor: grey[100],
            '&:hover': {
              bgcolor: grey[200],
            },
          }}
        >
          <EditIcon sx={{ fontSize: '1.2rem' }} />
        </IconButton>
        <Stack
          alignItems='center'
          justifyContent='center'
          sx={{
            height: 140,
            background: `repeating-conic-gradient(rgba(24, 24, 38, 0.2) 0% 25%,transparent 0% 50%) 50%/20px 20px`,
          }}
        >
          {type === 'image' && (
            <CardMedia
              sx={{ height: 140, backgroundSize: 'contain', width: '100%' }}
              image={`${MEDIA_URL}/${asset.url}?media=${MEDIA_SECRET}`}
              title={asset?.name}
            />
          )}
          {type === 'file' && <InsertDriveFileOutlinedIcon sx={{ fontSize: '3rem' }} />}
          {type === 'video' && (
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
            <ReactAudioPlayer src={`${MEDIA_URL}/${asset.url}?media=${MEDIA_SECRET}`} controls />
          )}
        </Stack>

        <CardContent>
          <Stack flexDirection='row' justifyContent='space-between' alignItems='flex-start'>
            <Typography gutterBottom>{assetName}</Typography>
            <Button variant='contained' disabled>
              {asset.type}
            </Button>
          </Stack>
          <Typography variant='body2' textTransform='uppercase' sx={{ color: 'text.secondary' }}>
            {extName}, Size: {formatSize(asset.size)}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}
