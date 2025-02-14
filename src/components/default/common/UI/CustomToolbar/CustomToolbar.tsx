import CustomSearch from '@/components/default/common/UI/CustomSearch/CustomSearch';
import { apiGetFile } from '@/lib/fetch';
import { getQueryName } from '@/lib/helpers';
import { IRootState } from '@/redux/store';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import GetAppIcon from '@mui/icons-material/GetApp';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  ButtonGroup,
  IconButton,
  Stack,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { GridToolbarColumnsButton } from '@mui/x-data-grid';
import { MouseEvent, useState } from 'react';
import { useSelector } from 'react-redux';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TodayIcon from '@mui/icons-material/Today';
import UndoIcon from '@mui/icons-material/Undo';
import Import from '../../import/Import';

export default function CustomToolbar({
  view,
  searchValue,
  selectionModel,
  handleDeleteModal,
  toggleFilters,
  handleSearch,
  handleChangeView,
  handleActions,
  hideToolbarColumns,
  hideToolbarFilters,
  hideToolbarViewToggle,
  multiDeletePermission,
  isTable,
  pageName,
  handleCalendarNext,
  handleCalendarPrev,
  handleCalendarView,
  handleCalendarToday,
  hideToolbarSearch = false,
  showCalendar = false,
  availableAdd = true,
  availableImport = false,
  availableExport = false,
  showBoard = false,
}: any) {
  const [exportLoading, setExportLoading] = useState(false);
  const [calendarViewToggle, setCalendarViewToggle] = useState('dayGridMonth');
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));
  const selectedIds = selectionModel ?? [];
  const queryName = getQueryName(pageName);
  const searchParams = useSelector((state: IRootState) => state.searchParams);

  const handleExportData = async () => {
    setExportLoading(true);
    await apiGetFile(`${queryName}-export?${searchParams}`);
    setExportLoading(false);
  };

  return (
    <Stack
      flexDirection='row'
      alignItems='center'
      justifyContent={!isTable || selectedIds.length === 0 ? 'space-between' : 'flex-end'}
      className={mdDown ? 'mobile' : ''}
      sx={{
        height: '3rem',
        padding: '0 1rem',
        position: 'relative',
        borderBottom: '1px solid rgba(224, 224, 224, 1)',
        '&.mobile': {
          p: '0',
          pb: '1rem',
          flexDirection: 'column',
          gap: '1rem',
          height: 'auto',
        },
      }}
    >
      {(!isTable || selectedIds.length === 0) && (
        <>
          <Stack flexDirection='row' alignItems='center'>
            {view !== 'calendar' && (
              <Typography
                variant='h6'
                className={mdDown ? 'mobile' : ''}
                sx={{
                  fontSize: '1.2rem',
                  textTransform: 'capitalize',
                  '&.mobile': {
                    fontSize: '1rem',
                  },
                }}
              >
                {pageName}
              </Typography>
            )}
            {view === 'calendar' && (
              <Stack>
                <ButtonGroup variant='outlined' size='small' aria-label='Basic button group'>
                  <Tooltip title='Previous'>
                    <Button onClick={handleCalendarPrev}>
                      <ArrowBackIosIcon />
                    </Button>
                  </Tooltip>
                  <Tooltip title='Next'>
                    <Button onClick={handleCalendarNext}>
                      <ArrowForwardIosIcon />
                    </Button>
                  </Tooltip>
                  <Tooltip title='Back'>
                    <Button onClick={handleCalendarToday}>
                      <UndoIcon />
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </Stack>
            )}
            {handleActions && availableAdd && (
              <IconButton size='small' color='primary' onClick={() => handleActions(true)}>
                <AddCircleOutlineIcon
                  className={mdDown ? 'mobile' : ''}
                  sx={{
                    width: '1.5rem',
                    height: '1.5rem',
                  }}
                />
              </IconButton>
            )}
          </Stack>
          {view === 'calendar' && (
            <Typography
              variant='h6'
              className={mdDown ? 'mobile' : ''}
              sx={(theme) => ({
                fontSize: '1.2rem',
                textTransform: 'capitalize',
                [theme.breakpoints.up('lg')]: {
                  position: 'absolute',
                  left: '50%',
                  top: '40%',
                  width: 'max-content',
                  transform: 'translate(-50%, -50%)',
                },
                '&.mobile': {
                  fontSize: '1rem',
                },
              })}
            >
              {pageName}
            </Typography>
          )}
          <Stack
            flexDirection='row'
            gap={mdDown ? '1rem' : '1.5rem'}
            className={mdDown ? 'mobile' : ''}
            sx={{
              '&.mobile': {
                flexDirection: 'row-reverse',
                justifyContent: 'space-between',
              },
            }}
          >
            <Stack flexDirection='row' gap='2px' alignItems={mdDown ? 'center' : 'stretch'}>
              {!hideToolbarSearch && (
                <CustomSearch searchValue={searchValue} handleSearch={handleSearch} />
              )}
              {!hideToolbarFilters && (
                <Button
                  sx={{
                    minWidth: '0',
                    width: '2.5rem',
                    height: '2.5rem',
                  }}
                  size='small'
                  variant={view === 'calendar' ? 'outlined' : 'contained'}
                  onClick={toggleFilters(true)}
                >
                  <FilterAltIcon />
                </Button>
              )}

              {view === 'calendar' && (
                <ToggleButtonGroup
                  size='small'
                  value={calendarViewToggle}
                  onChange={(_: MouseEvent<HTMLElement>, newValue: string) => {
                    setCalendarViewToggle(newValue);
                    handleCalendarView(newValue);
                  }}
                  exclusive
                >
                  <Tooltip title='Month'>
                    <ToggleButton
                      color={calendarViewToggle === 'dayGridMonth' ? 'primary' : 'info'}
                      value='dayGridMonth'
                      disabled={calendarViewToggle === 'dayGridMonth'}
                    >
                      <CalendarTodayIcon />
                    </ToggleButton>
                  </Tooltip>
                  <Tooltip title='Week'>
                    <ToggleButton
                      color={calendarViewToggle === 'dayGridMonth' ? 'primary' : 'info'}
                      value='dayGridWeek'
                      disabled={calendarViewToggle === 'dayGridWeek'}
                    >
                      <DateRangeIcon />
                    </ToggleButton>
                  </Tooltip>
                  <Tooltip title='Day'>
                    <ToggleButton
                      color={calendarViewToggle === 'dayGridMonth' ? 'primary' : 'info'}
                      value='timeGridDay'
                      disabled={calendarViewToggle === 'timeGridDay'}
                    >
                      <TodayIcon />
                    </ToggleButton>
                  </Tooltip>
                  <Tooltip title='List'>
                    <ToggleButton
                      color={calendarViewToggle === 'dayGridMonth' ? 'primary' : 'info'}
                      value='listWeek'
                      disabled={calendarViewToggle === 'listWeek'}
                    >
                      <FormatListBulletedIcon />
                    </ToggleButton>
                  </Tooltip>
                </ToggleButtonGroup>
              )}

              {availableImport && <Import pageName={pageName} />}
              {availableExport && (
                <Tooltip title={`Export ${pageName}`} placement='top'>
                  <LoadingButton
                    loading={exportLoading}
                    variant='contained'
                    onClick={handleExportData}
                    size={'small'}
                    loadingPosition='start'
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 'unset',
                      width: '40px',
                      height: '40px',
                    }}
                  >
                    {!exportLoading && <GetAppIcon />}
                  </LoadingButton>
                </Tooltip>
              )}
              {!hideToolbarColumns && isTable && (
                <GridToolbarColumnsButton
                  slotProps={{
                    button: {
                      variant: 'contained',
                      sx: {
                        height: '2.5rem',
                      },
                    },
                  }}
                />
              )}
            </Stack>
            {!hideToolbarViewToggle && (
              <ToggleButtonGroup
                sx={{
                  alignItems: 'center',
                }}
                value={view}
                exclusive
                onChange={handleChangeView}
                aria-label='text alignment'
              >
                <ToggleButton
                  sx={{
                    minWidth: '0',
                    width: '2.5rem',
                    height: '2.5rem',
                  }}
                  value='table'
                  disabled={view === 'table' ? true : false}
                  color={view ? 'primary' : 'standard'}
                  aria-label='left aligned'
                >
                  <TableRowsIcon />
                </ToggleButton>
                <ToggleButton
                  sx={{
                    minWidth: '0',
                    width: '2.5rem',
                    height: '2.5rem',
                  }}
                  value='cards'
                  disabled={view === 'cards' ? true : false}
                  color={view ? 'primary' : 'standard'}
                  aria-label='centered'
                >
                  <DashboardCustomizeIcon />
                </ToggleButton>
                {showCalendar && (
                  <ToggleButton
                    sx={{
                      minWidth: '0',
                      width: '2.5rem',
                      height: '2.5rem',
                    }}
                    value='calendar'
                    disabled={view === 'calendar' ? true : false}
                    color={view ? 'primary' : 'standard'}
                    aria-label='centered'
                  >
                    <CalendarMonthIcon />
                  </ToggleButton>
                )}
                {showBoard && (
                  <ToggleButton
                    sx={{
                      minWidth: '0',
                      width: '2.5rem',
                      height: '2.5rem',
                    }}
                    value='board'
                    disabled={view === 'board' ? true : false}
                    color={view ? 'primary' : 'standard'}
                    aria-label='centered'
                  >
                    <ViewWeekIcon />
                  </ToggleButton>
                )}{' '}
              </ToggleButtonGroup>
            )}
          </Stack>
        </>
      )}
      {isTable && multiDeletePermission && selectedIds.length > 0 && (
        <Stack flexDirection='row' alignItems='center'>
          {multiDeletePermission !== 'all' && (
            <Typography color='error'>Only allowed elements will be deleted</Typography>
          )}
          <IconButton onClick={() => handleDeleteModal(true, selectedIds)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      )}
    </Stack>
  );
}
