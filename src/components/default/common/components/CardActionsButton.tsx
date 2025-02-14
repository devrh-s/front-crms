import { useCopyToClipboard } from '@/hooks/useCopyToClickbord';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/navigation';
import { MouseEvent } from 'react';

interface ICardActionButtonsProps {
  id: number;
  open: boolean;
  anchorEl: HTMLElement | null;
  availableEdit?: boolean;
  visibleProfile?: boolean;
  availableDelete?: boolean;
  availableToEmployee?: boolean;
  availableToCandidates?: boolean;
  availableToPresale?: boolean;
  disableEdit?: boolean;
  disabledToPresale?: boolean;
  disabledToEmployee?: boolean;
  disabledDuplicate?: boolean;
  handleClick: (event: MouseEvent<HTMLElement>) => void;
  handleClose: () => void;
  handleActions: (visible: boolean, id?: number | null, isDuplicate?: boolean) => void;
  handleDeleteModal?: (open: boolean, ids?: number[]) => void;
  handleActionsCandidate?: (visible: boolean, id?: number | null) => void;
  handleActionsEmployee?: (visible: boolean, id?: number | null) => void;
  handleActionsPresale?: (visible: boolean, id?: number | null) => void;
  url?: string;
  sx?: {
    [key: string]: string | number;
  };
  isTransfer?: boolean;
}

export default function CardActionsButton({
  id,
  open,
  anchorEl,
  availableEdit,
  availableDelete,
  availableToEmployee,
  availableToCandidates,
  availableToPresale,
  disabledToPresale,
  disabledToEmployee,
  url,
  sx,
  disableEdit = false,
  disabledDuplicate = false,
  visibleProfile = true,
  handleClick,
  handleClose,
  handleActions,
  handleDeleteModal,
  handleActionsCandidate,
  handleActionsEmployee,
  handleActionsPresale,
  isTransfer,
}: ICardActionButtonsProps) {
  const router = useRouter();
  const handleClickCopy = useCopyToClipboard();

  return (
    <div>
      <IconButton
        aria-label='more'
        id='long-button'
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup='true'
        onClick={handleClick}
        sx={sx}
      >
        <MoreVertIcon color='primary' />
      </IconButton>
      <Menu
        id='long-menu'
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiSvgIcon-root': {
            color: 'rgba(0, 0, 0, 0.54)',
          },
        }}
      >
        {url && visibleProfile && (
          <MenuItem
            onClick={() => router.push(url)}
            sx={{
              gap: '.5rem',
            }}
          >
            <VisibilityIcon /> Profile
          </MenuItem>
        )}
        <MenuItem
          onClick={() => handleClickCopy(`${url}`)}
          sx={{
            gap: '.5rem',
          }}
        >
          <ContentCopyIcon /> Copy
        </MenuItem>
        {availableToCandidates && handleActionsCandidate && (
          <MenuItem
            onClick={() => handleActionsCandidate(true, id)}
            disabled={isTransfer}
            sx={{
              gap: '.5rem',
            }}
          >
            <GroupIcon /> To Candidates
          </MenuItem>
        )}
        {availableToEmployee && handleActionsEmployee && (
          <MenuItem
            onClick={() => handleActionsEmployee(true, id)}
            disabled={isTransfer || disabledToEmployee}
            sx={{
              gap: '.5rem',
            }}
          >
            <GroupIcon /> To Employee
          </MenuItem>
        )}
        {availableToPresale && handleActionsPresale && (
          <MenuItem
            onClick={() => handleActionsPresale(true, id)}
            disabled={isTransfer || disabledToPresale}
            sx={{
              gap: '.5rem',
            }}
          >
            <GroupIcon /> To Presale
          </MenuItem>
        )}
        {availableEdit && (
          <>
            <MenuItem
              onClick={() => handleActions(true, id)}
              disabled={disableEdit}
              sx={{
                gap: '.5rem',
              }}
            >
              <EditIcon /> Edit
            </MenuItem>
            {!disabledDuplicate && (
              <MenuItem
                onClick={() => handleActions(true, id, true)}
                disabled={disableEdit}
                sx={{
                  gap: '.5rem',
                }}
              >
                <CopyAllIcon /> Duplicate
              </MenuItem>
            )}
          </>
        )}
        {availableDelete && handleDeleteModal && (
          <MenuItem
            onClick={() => handleDeleteModal(true, [id])}
            disabled={disableEdit}
            sx={{
              gap: '.5rem',
            }}
          >
            <DeleteIcon /> Delete
          </MenuItem>
        )}
      </Menu>
    </div>
  );
}
