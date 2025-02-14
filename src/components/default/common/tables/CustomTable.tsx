// @ts-nocheck
import { Box, LinearProgress } from '@mui/material';
import { DataGrid, GridRowParams, GridSlots } from '@mui/x-data-grid';
import { useEffect, useRef, useState } from 'react';
import CustomToolbar from '../UI/CustomToolbar/CustomToolbar';
import { ITableProps } from './types';

export default function CustomTable({
  rows,
  view,
  searchValue,
  pageName,
  rowCount,
  paginationModel,
  columns,
  loading,
  hideCheckboxes,
  rowHeight,
  colHeaderHeight,
  hideToolbarColumns,
  hideToolbarFilters,
  hideToolbarSearch,
  hideToolbarViewToggle,
  columnVisibilityModel,
  multiDeletePermission,
  styles,
  showCalendar = false,
  showBoard = false,
  isAllSelectable = true,
  availableAdd = true,
  availableImport = false,
  availableExport = false,
  handleSearch,
  toggleFilters,
  handleChangeView,
  handleDeleteModal,
  handleActions,
  handlePagination,
  handleSortModelChange,
  disableColumnSorting,
}: ITableProps) {
  const [selectionModel, setSelectionModel] = useState([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeElemId, setActiveElemId] = useState<null | number>(null);
  const open = Boolean(anchorEl);
  const ref = useRef<HTMLDivElement | null>(null);

  const handleClose = () => {
    setAnchorEl(null);
    setActiveElemId(null);
  };

  useEffect(() => {
    if (ref?.current) {
      const offsetTop = ref.current.offsetTop;
      ref.current.style.height = `calc(100dvh - ${offsetTop}px)`;
    }
  }, [ref.current]);

  return (
    <Box
      sx={{
        width: '100%',
        '.customScroll::-webkit-scrollbar-thumb': {
          height: '1.8rem',
        },
      }}
    >
      <Box ref={ref} sx={{ width: '100%', padding: '.5rem 0 .5rem' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={!rows[0]?.id && ((row) => row.table_name)}
          getRowHeight={() => rowHeight}
          sortingMode='server'
          rowCount={rowCount}
          isRowSelectable={(params: GridRowParams) => {
            if (!isAllSelectable) {
              if (params.row.language_id === 1 && params.row.name === 'English') {
                return false;
              }
              if (params.row.name === 'Primary' || params.row.name === 'Secondary') {
                return false;
              }
            }
            return true;
          }}
          onSortModelChange={handleSortModelChange}
          paginationModel={paginationModel}
          columnVisibilityModel={columnVisibilityModel}
          onPaginationModelChange={handlePagination}
          showCellVerticalBorder
          showColumnVerticalBorder
          columnHeaderHeight={colHeaderHeight ?? 30}
          sx={{
            ...styles,
            '& .MuiDataGrid-cell.chips-cell': {
              padding: '0 0 0 10px',
            },
            '& .MuiDataGrid-footerContainer': {
              minHeight: 'unset',
            },
            '& .MuiTablePagination-toolbar': {
              minHeight: 'unset',
            },
            '&': {
              scrollBehavior: 'smooth',
              scrollbarGutter: 'stable',
            },
            '& .MuiDataGrid-scrollbar': {
              '--size': '8px',
            },
            '& ::-webkit-scrollbar': {
              height: '8px !important',
              background: 'white',
              borderRadius: '5px',
            },
            '& ::-webkit-scrollbar-thumb': {
              background: '#808080',
              borderRadius: '8px',
            },
          }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[15, 25, 50, 100]}
          checkboxSelection={!hideCheckboxes}
          slots={{
            loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
            toolbar: CustomToolbar,
          }}
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newRowSelectionModel: any) => {
            setSelectionModel(newRowSelectionModel);
          }}
          disableColumnSorting={disableColumnSorting}
          slotProps={{
            pagination: {
              showFirstButton: true,
              showLastButton: true,
            },

            toolbar: {
              view,
              rows,
              searchValue,
              selectionModel,
              pageName: pageName,
              hideToolbarColumns,
              hideToolbarFilters,
              hideToolbarSearch,
              hideToolbarViewToggle,
              isTable: true,
              availableAdd,
              availableImport,
              availableExport,
              multiDeletePermission,
              showCalendar,
              showBoard,
              handleSearch,
              toggleFilters,
              setSelectionModel,
              handleDeleteModal,
              handleChangeView,
              handleActions,
            },
            row: {
              onContextMenu: (event) => {
                event.preventDefault();

                if (!event.currentTarget) {
                  return;
                }
                const rowId = Number(
                  (event.currentTarget as HTMLDivElement).getAttribute('data-id')
                );

                const record = rows.find((row: any) => row.id === rowId);

                if (!record) {
                  return;
                }
                setAnchorEl(event.target as HTMLDivElement);
                setActiveElemId(record.id);
              },
              style: { cursor: 'context-menu' },
            },
          }}
          paginationMode='server'
          loading={loading}
        />
        {/* {open && handleActions && handleDeleteModal && (
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
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => handleActions(true, activeElemId)}>
              <EditIcon /> Edit
            </MenuItem>
            <MenuItem onClick={() => handleDeleteModal(true, [activeElemId] as number[])}>
              <DeleteIcon /> Delete
            </MenuItem>
          </Menu>
        )} */}
      </Box>
    </Box>
  );
}
