import { Box, Typography } from '@mui/material';
import ReactPlayer from 'react-player';
import NameLink from '../../common/components/NameLink';
interface IGuideFormatProps {
  data: IGuideFormatType;
}

export default function GuideFormat({ data }: IGuideFormatProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <NameLink
        href={data.link}
        name={data?.link?.length > 35 ? `${data.link.slice(0, 35)}...` : data.link}
        sx={{ textTransform: 'lowercase', pl: 0 }}
      />

      {data.object && <Typography>Object: {data.object.name}</Typography>}

      {data.format && (
        <>
          {data.format.name.toLowerCase() === 'mp4' && (
            <ReactPlayer
              width={'100%'}
              height={'auto'}
              style={{ aspectRatio: 1.77 }}
              url={data.link}
            />
          )}
          {data.format.name.toLowerCase() === 'jpeg' ||
            (data.format.name.toLowerCase() === 'png' && (
              <img
                src={data.link}
                style={{
                  width: '100%',
                  height: 'auto',
                }}
                alt={data.object.name}
              />
            ))}
        </>
      )}

      {data.description ? (
        <Box>
          Description:{' '}
          <Box
            dangerouslySetInnerHTML={{
              __html: data.description,
            }}
            alignSelf='flex-start'
          />
        </Box>
      ) : null}
    </Box>
  );
}
