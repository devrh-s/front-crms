import { useState, ChangeEvent } from 'react';
import { styled, alpha, Theme } from '@mui/material/styles';
import { Stack, InputBase, IconButton, Button, Collapse, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette.primary.main, 1),
  color: '#fff',
  borderRadius: '3px',
  marginRight: theme.spacing(2),
  height: '100%',

  padding: '0.1rem 0.1rem',

  marginLeft: theme.spacing(3),
  width: 'auto',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

interface ICustomSeachProps {
  searchValue: string;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function CustomSearch({ searchValue, handleSearch }: ICustomSeachProps) {
  const [open, setOpen] = useState(false);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  return (
    <>
      <Collapse
        orientation='horizontal'
        in={open}
        collapsedSize={0}
        sx={{
          '& .MuiCollapse-wrapperInner': {
            '& div:first-child': {
              marginRight: 0,
            },
          },
        }}
      >
        <Search>
          <Stack
            justifyContent='center'
            alignSelf='center'
            sx={{
              borderBottom: 'none',
            }}
          >
            <IconButton
              size='small'
              onClick={() => setOpen(false)}
              sx={{
                position: 'absolute',
                height: '100%',
                zIndex: 50,
                color: '#fff',
              }}
            >
              <SearchIcon />
            </IconButton>
            <StyledInputBase
              value={searchValue}
              onChange={handleSearch}
              placeholder='Search…'
              inputProps={{ 'aria-label': 'search' }}
            />
          </Stack>
        </Search>
      </Collapse>
      {!open && (
        <Button
          sx={{
            minWidth: '0',
            width: '2.5rem',
            height: '2.5rem',
          }}
          variant='contained'
          onClick={() => setOpen(true)}
        >
          <SearchIcon
            sx={{
              width: '22px',
              height: '22px',
            }}
          />
        </Button>
      )}
    </>
  );
}
