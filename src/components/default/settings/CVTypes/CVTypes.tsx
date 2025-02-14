'use client';
import CustomTable from '@/components/default/common/tables/CustomTable';
import useActions from '@/hooks/useActions';
import { useCopyToClipboard } from '@/hooks/useCopyToClickbord';
import useFilters from '@/hooks/useFilters';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import { apiGetData } from '@/lib/fetch';
import { getAppSearchParams } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Stack, Theme, useMediaQuery } from '@mui/material';
import { GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import CVTypesCards from './CVTypesCards';
import { ICVTypeFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const CVTypesActions = dynamic(() => import('./CVTypesActions'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

export default function CVTypes() {
  const [view, setView] = useState('table');
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const { filters, filtersOpen, applyFilters, toggleFilters } = useFilters<ICVTypeFilters>();
  const {
    paginationModel,
    rowCount,
    handleRowCount,
    handlePagination,
    checkPagination,
    defaultPagination,
  } = usePagination();
  const { searchValue, debouncedSearchValue, handleSearch, clearSearch } = useSearch();
  const { actionsData, deleteModal, handleActions, handleDeleteModal, handleClose } = useActions();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const handleClickCopy = useCopyToClipboard();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: ['cv-types', { paginationModel, sortOptions, debouncedSearchValue, applyFilters }],
    queryFn: async () => {
      if (checkPagination(paginationModel)) {
        return Promise.reject();
      }
      const searchParams = getAppSearchParams({
        paginationModel,
        sortOptions,
        debouncedSearchValue,
        filters,
      });
      dispatch(changeSearchParams(searchParams.toString()));
      return await apiGetData(`cv-types?${searchParams}`);
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const {
    data: rows,
    meta,
    fields,
    count_edits: countEdits,
    entity_block_id: entityBlockId,
  } = useMemo(() => {
    if (data) return data;
    return {
      data: [],
      meta: {},
      fields: {},
      count_edits: 0,
      entity_block_id: null,
    };
  }, [data]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'Actions',
        headerName: '',
        disableColumnMenu: true,
        type: 'actions',
        width: 50,
        getActions: (params: { id: number }) => [
          <GridActionsCellItem
            key='Action Edit'
            icon={<EditIcon />}
            onClick={() => handleActions(true, params.id)}
            label='Edit'
            showInMenu
          />,
          <GridActionsCellItem
            key='Action Copy'
            icon={<ContentCopyIcon />}
            onClick={() => handleClickCopy(`/cv-types/${params.id}`)}
            label='Copy'
            showInMenu
          />,
          <GridActionsCellItem
            key='Action Duplicate'
            icon={<CopyAllIcon />}
            onClick={() => handleActions(true, params.id, true)}
            label='Duplicate'
            showInMenu
          />,
          <GridActionsCellItem
            key='Action Delete'
            onClick={() => {
              handleDeleteModal(true, [params.id]);
            }}
            icon={<DeleteIcon />}
            label='Delete'
            showInMenu
          />,
        ],
      },
      {
        field: 'id',
        headerName: 'ID',
        disableColumnMenu: true,
        flex: 1,
        width: 50,
      },
      {
        field: 'name',
        headerName: fields?.name ?? 'Name',
        disableColumnMenu: true,
        description: 'Name',
        width: 800,
      },
    ],
    [fields]
  );

  const handleChangeView = (_: React.MouseEvent<HTMLElement>, newView: string) => {
    clearSearch();
    clearSort();
    defaultPagination();
    setView((prev) => newView ?? prev);
  };

  useEffect(() => {
    if (meta?.total) {
      handleRowCount(meta?.total);
    }
    if (entityBlockId) {
      dispatch(
        setEditsData({
          countEdits,
          entityBlockId,
        })
      );
      setGuidesData({ entityBlockId });
    }
  }, [meta, countEdits, entityBlockId]);

  return (
    <Stack gap='2rem'>
      <CVTypesActions
        id={actionsData.id}
        visible={actionsData.visible}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <CVTypesCards
            rows={rows}
            searchValue={searchValue}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            handleSearch={handleSearch}
            view={view}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            isSmall
          />
        ) : (
          <CustomTable
            hideToolbarFilters
            view={view}
            rows={rows}
            columns={columns}
            pageName='CV types'
            loading={isFetching}
            rowCount={rowCount}
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            searchValue={searchValue}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            multiDeletePermission
            availableExport
            availableImport
          />
        ))}
      {view === 'cards' && (
        <CVTypesCards
          rows={rows}
          loading={isFetching}
          toggleFilters={toggleFilters}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          searchValue={searchValue}
          paginationModel={paginationModel}
          handlePagination={handlePagination}
          handleSearch={handleSearch}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
        />
      )}
      <DeleteModal
        rows={rows}
        open={deleteModal.open}
        ids={deleteModal.ids}
        query='cv-types'
        url='cv-types'
        handleClose={handleClose}
      />
    </Stack>
  );
}
