'use client';

import { useEffect, useState } from 'react';
import { Typography, Stack, Box } from '@mui/material';
import useBookmarks from '@/hooks/useBookmarks';
import ReactPlayer from 'react-player';
import { usePathname } from 'next/navigation';
import { useGuidesStore } from '@/zustand/guidesStore';
import { useQuery } from '@tanstack/react-query';
import { apiGetData } from '@/lib/fetch';
import AddGuide from './AddGuide';
import NameLink from '@/components/default/common/components/NameLink';
import GuidesDrawer from '../../../GuidesDrawer/GuidesDrawer';

interface IGuidFormat {
  description: string;
  id: number;
  link: string;
  guide_name: string;
  guide_url: string;
}
interface IAppGuidesProps {
  visible: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function AppGuides({ visible, handleActions }: IAppGuidesProps) {
  const pathname = usePathname();
  const clearGuidesData = useGuidesStore((store) => store.clearGuidesData);
  const entityBlockId = useGuidesStore((store) => store.entityBlockId);
  const progressableId = useGuidesStore((store) => store.progressableId);
  const progressableType = useGuidesStore((store) => store.progressableType);

  const [fullScreen, setFullScreen] = useState(false);
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['rules', 'text', 'video', 'image'],
    visible
  );

  const { data: guides } = useQuery({
    queryKey: ['guides-per-page', entityBlockId],
    queryFn: async () => {
      let URL;
      if (entityBlockId) URL = `guides-per-page?entity_block_id=${entityBlockId}`;
      else
        URL = `guides-per-page?progressable_type=${progressableType}&progressable_id=${progressableId}`;

      const response = await apiGetData(URL);
      return response;
    },
    enabled: !!entityBlockId || !!progressableType,
  });

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const hideHandler = () => {
    handleActions(false);
  };

  useEffect(() => {
    clearGuidesData();
  }, [pathname]);

  return (
    <GuidesDrawer
      title='Guides'
      visible={visible}
      activeBookmark={activeBookmark}
      bookmarks={bookmarks}
      changeActiveBookmark={changeActiveBookmark}
      hideHandler={hideHandler}
      fullScreenHandler={fullScreenHandler}
      fullScreen={fullScreen}
      toggleBookmarkError={toggleBookmarkError}
    >
      <AddGuide fullScreen={fullScreen} />
      {activeBookmark === 'rules' && (
        <GuidesAction items={guides?.rules ?? []} activeBookmark={activeBookmark} />
      )}
      {activeBookmark === 'text' && (
        <GuidesAction items={guides?.text ?? []} activeBookmark={activeBookmark} />
      )}
      {activeBookmark === 'video' && (
        <GuidesAction items={guides?.video ?? []} activeBookmark={activeBookmark} />
      )}
      {activeBookmark === 'image' && (
        <GuidesAction items={guides?.image ?? []} activeBookmark={activeBookmark} />
      )}
    </GuidesDrawer>
  );
}

const GuidesAction = ({
  items,
  activeBookmark,
}: {
  items: IGuidFormat[];
  activeBookmark: string;
}) => {
  return (
    <Stack gap='1rem'>
      {!items.length && <Typography>No guides</Typography>}
      {items?.map((el) => (
        <Stack
          key={el?.id}
          gap='1rem'
          sx={{
            position: 'relative',
            border: '1px solid #555252',
            padding: '1rem',
            borderRadius: '6px',
          }}
        >
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {el.guide_name}
          </Typography>
          <Stack gap={'0.5rem'}>
            {activeBookmark === 'image' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={el.link}
                alt='guide image'
                style={{
                  width: '100%',
                  height: 'auto',
                }}
              />
            )}
            {activeBookmark === 'video' && <VideoPlayer url={el.link} />}
            <Box
              dangerouslySetInnerHTML={{
                __html: el.description,
              }}
            />
            {(activeBookmark === 'rules' || activeBookmark === 'text') && el.link && (
              <NameLink
                href={el.link}
                name='Link'
                sx={{ color: (theme) => theme.palette.primary }}
              />
            )}
            <NameLink
              href={el.guide_url}
              name='Go to guide'
              sx={{ color: (theme) => theme.palette.primary }}
            />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};

const VideoPlayer = ({ url }: { url: string }) => {
  const [isVideoAvailable, setIsVideoAvailable] = useState(true);

  const handleError = () => {
    setIsVideoAvailable(false);
  };

  return (
    <Box
      sx={{
        width: '100%',
        aspectRatio: '1.77',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
      }}
    >
      {isVideoAvailable ? (
        <ReactPlayer width='100%' height='100%' url={url} controls onError={handleError} />
      ) : (
        <Typography variant='h6' color='#000'>
          Video Unavailable
        </Typography>
      )}
    </Box>
  );
};
