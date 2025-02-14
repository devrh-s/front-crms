import { MouseEvent } from 'react';
import { Paper, Typography, Stack, IconButton } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import Link from 'next/link';
import EditIcon from '@mui/icons-material/Edit';
import type { IFolder } from './types';

interface IFolderProps {
  folder: IFolder;
  link: string;
  handleOpenEdit: () => void;
}

export default function Folder({ folder, link, handleOpenEdit }: IFolderProps) {
  const handleEdit = (e: MouseEvent) => {
    e.preventDefault();
    handleOpenEdit();
  };

  return (
    <Paper
      elevation={2}
      component={Link}
      href={link}
      sx={{
        display: 'flex',
        gap: '1rem',
        flexDirection: 'row',
        cursor: 'pointer',
        padding: '.5rem',
        minWidth: 240,
        position: 'relative',
        '&:hover .media-edit-btn': {
          visibility: 'visible',
          opacity: 1,
        },
      }}
    >
      <IconButton color='primary' sx={{ backgroundColor: 'rgba(25, 118, 210, 0.04)' }}>
        <FolderIcon />
      </IconButton>
      <IconButton
        className='media-edit-btn'
        size='small'
        color='info'
        onClick={handleEdit}
        sx={{
          visibility: 'hidden',
          opacity: 0,
          position: 'absolute',
          top: '5px',
          right: '5px',
          transition: 'all .2s ease-in',
        }}
      >
        <EditIcon sx={{ fontSize: '1rem' }} />
      </IconButton>
      <Stack>
        <Typography>{folder?.name}</Typography>
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          {folder.folders?.length ?? 0} folder, {folder?.assets ?? 0} assets
        </Typography>
      </Stack>
    </Paper>
  );
}
