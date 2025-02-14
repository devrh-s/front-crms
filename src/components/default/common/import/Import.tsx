import { useState } from 'react';
import { Button, useMediaQuery, Tooltip, Theme } from '@mui/material';
import ImportDrawer from './ImportDrawer';
import FileUploadIcon from '@mui/icons-material/FileUpload';

interface IImportProps {
  pageName: string;
}

export default function Import({ pageName }: IImportProps) {
  const [visible, setVisible] = useState(false);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const hide = () => setVisible(false);

  return (
    <>
      <Tooltip title={`Import ${pageName}`} placement='top'>
        <Button
          variant='contained'
          size={'small'}
          onClick={() => setVisible(true)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 'unset',
            width: '40px',
            height: '40px',
            padding: !mdDown ? '6px 16px' : '3px 8px',
          }}
        >
          <FileUploadIcon />
        </Button>
      </Tooltip>
      <ImportDrawer visible={visible} pageName={pageName} hide={hide} />
    </>
  );
}
