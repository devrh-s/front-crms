'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Stack,
  Typography,
  ButtonGroup,
  Pagination,
  Tooltip,
  Button,
  Grid,
} from '@mui/material';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { mediaGet } from '@/lib/fetch';
import Folder from './Folder';
import Asset from './Asset';
import FolderModal from './FolderModal';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import UndoIcon from '@mui/icons-material/Undo';
import DeleteModal, { DeleteModalTypes } from './DeleteModal';
import AddAssetModal from './AddAssetModal';
import EditAssetModal from './EditAssetModal';
import usePagination from '@/hooks/usePagination';
import { getAppSearchParams } from '@/lib/helpers';
import config from '@/config';
import MediaSkeleton from './MediaSkeleton';
import type { IFolder, IAsset } from './types';

interface IMediaLibraryProps {
  slug?: string[];
}

const { MEDIA_SECRET } = config;

export default function MediaLibrary({ slug }: IMediaLibraryProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { paginationModel, handlePageNumber, handleRowCount } = usePagination({
    page: 0,
    pageSize: 16,
  });
  const [folderModal, setFolderModal] = useState<{ open: boolean; folder: IFolder | null }>({
    open: false,
    folder: null,
  });
  const [addAssetModal, setAddAssetModal] = useState(false);
  const [editAssetModal, setEditAssetModal] = useState<{ open: boolean; asset: IAsset | null }>({
    open: false,
    asset: null,
  });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: number | null;
    type: DeleteModalTypes;
  }>({ open: false, id: null, type: DeleteModalTypes.UNSET });
  const {
    data: { id, name, folders },
    isFetching: foldersFetching,
  } = useQuery({
    queryKey: [slug ? `media-folders-${slug.join('-')}` : 'media-folders'],
    queryFn: async () => {
      const response = await mediaGet(
        slug ? `folders/${slug.join('/')}?media=${MEDIA_SECRET}` : `folders?media=${MEDIA_SECRET}`
      );
      return response.data;
    },
    refetchOnWindowFocus: false,
    initialData: {
      id: null,
      name: '',
      folders: [],
      assets: [],
    },
    placeholderData: keepPreviousData,
  });

  const {
    data: { assets, total },
    isFetching: assetsFetching,
  } = useQuery({
    queryKey: [slug ? `media-assets-${slug.join('-')}` : 'media-assets', { paginationModel }],
    queryFn: async () => {
      const searchParams = getAppSearchParams({ paginationModel });
      if (MEDIA_SECRET) {
        searchParams.append('media', MEDIA_SECRET);
      }
      const response = await mediaGet(
        slug ? `assets/${slug.join('/')}?${searchParams}` : `assets?${searchParams}`
      );
      return response.data;
    },
    refetchOnWindowFocus: false,
    initialData: {
      id: null,
      name: '',
      folders: [],
      assets: [],
    },
    placeholderData: keepPreviousData,
  });

  const totalPages = total ? Math.ceil(total / paginationModel.pageSize) : 0;

  const fodlerOprions = useMemo(
    () => folders.map((el: IFolder) => ({ id: el.id, name: el.name })),
    [folders]
  );

  useEffect(() => {
    let timerID: ReturnType<typeof setTimeout>;
    if (foldersFetching || assetsFetching) {
      setIsLoading(true);
    } else {
      timerID = setTimeout(() => setIsLoading(false), 1000);
    }
    return () => {
      if (timerID) clearTimeout(timerID);
    };
  }, [foldersFetching, assetsFetching]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        position: 'relative',
        minHeight: 'calc(100dvh - 3rem)',
      }}
    >
      {isLoading && <MediaSkeleton />}
      {!isLoading && (
        <>
          <Stack flexDirection='row' justifyContent='space-between'>
            <Stack flexDirection='row' gap='1rem' alignItems='flex-end'>
              <Typography variant='h4' fontWeight={500}>
                Media Library
              </Typography>
              {slug && (
                <Stack>
                  <ButtonGroup variant='outlined' size='small' aria-label='Basic button group'>
                    <Tooltip title='Previous'>
                      <Button onClick={() => router.back()}>
                        <ArrowBackIosIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip title='Back'>
                      <Button onClick={() => router.push('/media')}>
                        <UndoIcon />
                      </Button>
                    </Tooltip>
                  </ButtonGroup>
                </Stack>
              )}
            </Stack>
            <Stack flexDirection='row' gap='1rem'>
              <Button
                variant='outlined'
                startIcon={<AddIcon />}
                onClick={() => setFolderModal({ open: true, folder: null })}
              >
                Add new folder
              </Button>
              <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={() => setAddAssetModal(true)}
              >
                Add new assets
              </Button>
            </Stack>
          </Stack>
          {folders?.length > 0 && (
            <Stack sx={{ padding: '1rem 0' }} gap='1rem'>
              <Typography>Folders&#40;{folders.length}&#41;</Typography>
              <Stack flexDirection='row' gap='1rem' flexWrap='wrap'>
                {folders.map((elem: IFolder) => (
                  <Folder
                    key={elem.id}
                    folder={elem}
                    handleOpenEdit={() => setFolderModal({ open: true, folder: elem })}
                    link={`/media${slug ? `/${slug.join('/')}` : ''}/${elem.slug}`}
                  />
                ))}
              </Stack>
            </Stack>
          )}
          {assets.length > 0 && (
            <Stack sx={{ padding: '1rem 0', flex: 1 }} gap='1rem'>
              <Typography>Assets&#40;{assets.length}&#41;</Typography>
              <Grid container spacing={2}>
                {assets.map((elem: IAsset) => (
                  <Asset
                    key={elem.id}
                    asset={elem}
                    handleEdit={() => setEditAssetModal({ open: true, asset: elem })}
                  />
                ))}
              </Grid>
            </Stack>
          )}
          {total > 16 && (
            <Stack flexDirection='row' justifyContent='flex-end' sx={{ paddingTop: '1rem' }}>
              <Pagination
                variant='outlined'
                color='primary'
                count={totalPages}
                page={paginationModel.page + 1}
                onChange={(_, page) => handlePageNumber(page - 1)}
              />
            </Stack>
          )}
          {!folders.length && !assets.length && (
            <Typography
              variant='h4'
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {slug ? 'This folder' : 'Media Library'} is empty.
            </Typography>
          )}
          <FolderModal
            open={folderModal.open}
            parentId={id}
            folder={folderModal.folder}
            name={name}
            slug={slug}
            folderOprions={fodlerOprions}
            handleOpenDelete={(id: number) =>
              setDeleteModal({ open: true, id, type: DeleteModalTypes.FOLDER })
            }
            handleClose={() => setFolderModal({ open: false, folder: null })}
          />
          <AddAssetModal
            open={addAssetModal}
            id={id}
            slug={slug}
            handleClose={() => setAddAssetModal(false)}
          />
          <EditAssetModal
            parentId={id}
            name={name}
            open={editAssetModal.open}
            asset={editAssetModal.asset}
            folderOprions={fodlerOprions}
            handleOpenDelete={(id: number) =>
              setDeleteModal({ open: true, id, type: DeleteModalTypes.ASSET })
            }
            slug={slug}
            handleClose={() => setEditAssetModal({ open: false, asset: null })}
          />
          <DeleteModal
            open={deleteModal.open}
            id={deleteModal.id}
            type={deleteModal.type}
            slug={slug}
            handleClose={() => {
              setDeleteModal({ open: false, id: null, type: DeleteModalTypes.UNSET });
              setFolderModal({ open: false, folder: null });
              setEditAssetModal({ open: false, asset: null });
            }}
          />
        </>
      )}
    </Box>
  );
}
