'use client';
import NameLink from '@/components/default/common/components/NameLink';
import Note from '@/components/default/common/components/Note';
import DeleteModal from '@/components/default/common/modals/DeleteModal/DeleteModal';
import HTMLModal from '@/components/default/common/modals/HTMLModal/HTMLModal';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import { SocketContext } from '@/contexts/socketContext';
import useActions from '@/hooks/useActions';
import useFilters from '@/hooks/useFilters';
import useNotification from '@/hooks/useNotification';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import { apiCommonData, apiGetData, updateCommondData } from '@/lib/fetch';
import { getAppSearchParams } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Stack, Theme, useMediaQuery } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from '@mui/x-data-grid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import GuideFormatsActions from './FormatsActions';
import GuideFormatsCards from './FormatsCards';
import GuideFormatsFilter from './FormatsFilter';
import { IGuideFormatsFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const commonDataBlocks = {
  objects: 'objects?perPage=-1&isShort=1&isCommon=1',
  formats: 'formats?perPage=-1&isShort=1&isCommon=1',
};
interface IGuideFormatsType {
  id: number;
  value: string;
  index: string;
}

const getCommonData = () => apiCommonData(commonDataBlocks);

export default function GuideFormats({ id, value, index }: IGuideFormatsType) {
  const [view, setView] = useState('table');
  const { echo } = useContext(SocketContext);
  const queryClient = useQueryClient();
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IGuideFormatsFilters>();
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
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [note, setNote] = useState('');
  const [cardsStorageActive, setCardsStorageActive] = useState(false);
  const showNotification = useNotification();
  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const {
    isFetching,
    isError,
    data: { data: rows, meta, fields, count_edits: countEdits, entity_block_id: entityBlockId },
  } = useQuery({
    queryKey: [
      'guide-formats',
      { paginationModel, sortOptions, debouncedSearchValue, applyFilters },
    ],
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
      const response = await apiGetData(`guides/${id}/guide-formats?${searchParams}`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: {
      data: [],
      meta: {},
      fields: {},
      count_edits: 0,
      entity_block_id: null,
    },
  });

  const { data: commonData } = useQuery({
    queryKey: ['guide-formats-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      objects: [],
      formats: [],
    },
  });

  const handleClickCopy = async (formatId: number) => {
    try {
      const response = await queryClient.fetchQuery({
        queryKey: ['job-site', formatId],
        queryFn: async () => {
          const response = await apiGetData(`guides/${id}/guide-formats/${formatId}`);
          return response.data;
        },
      });

      const json = JSON.stringify(response, null, 2);
      await navigator.clipboard.writeText(json);

      showNotification('Row copied to clipboard!', 'success');
    } catch (err) {
      showNotification(`Failed to copy row: ${err}`, 'error');
    }
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'Actions',
        headerName: '',
        maxWidth: 1,
        cellClassName: 'table-actions',
        type: 'actions',
        ...config.datagrid.column,
        getActions: (params: { id: number }) => [
          <GridActionsCellItem
            key='Action Copy'
            icon={<ContentCopyIcon />}
            onClick={() => handleClickCopy(params.id)}
            label='Copy'
            showInMenu
          />,
          <GridActionsCellItem
            key='Action Edit'
            icon={<EditIcon />}
            onClick={() => handleActions(true, params.id)}
            label='Edit'
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
        ...config.datagrid.column,
      },
      {
        field: 'link',
        headerName: fields?.link ?? 'Link',
        description: 'Link',
        disableColumnMenu: true,
        display: 'flex',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <NameLink
            href={params.value}
            name='Link'
            sx={{ color: (theme) => theme.palette.primary }}
          />
        ),

        flex: 2,
      },
      {
        field: 'object',
        headerName: fields?.object_id ?? 'Object',
        description: 'Object',
        disableColumnMenu: true,
        display: 'flex',
        flex: 2,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value?.name;
        },
      },
      {
        field: 'format',
        headerName: fields?.format_id ?? 'Format',
        description: 'Format',
        disableColumnMenu: true,
        display: 'flex',
        flex: 2,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value?.name;
        },
      },
      {
        field: 'description',
        disableColumnMenu: true,
        headerName: fields?.description ?? 'Description',
        description: 'Notes',
        type: 'actions',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Note value={params.value} setNote={setNote} />
        ),
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
    if (echo) {
      echo
        .channel(`common-data`)
        .listen('CommonDataChanged', (data: { key: keyof typeof commonDataBlocks }) => {
          const { key } = data;
          const basicValue = commonDataBlocks[key];
          const commonDataReq = { [key]: basicValue };
          if (commonDataReq) {
            updateCommondData({
              name: 'guide-formats-common',
              commonDataReq,
              queryClient,
            });
          }
        });
    }
    return () => echo?.leave(`common-data`);
  }, [echo]);

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
    value === index && (
      <Stack gap='2rem'>
        <GuideFormatsActions
          id={actionsData.id}
          visible={actionsData.visible}
          commonData={commonData}
          handleActions={handleActions}
          isDuplicate={actionsData.isDuplicate}
          url={`guides/${id}/guide-formats`}
        />
        {view === 'table' &&
          (mdDown ? (
            <GuideFormatsCards
              rows={rows}
              loading={isFetching}
              commonData={commonData}
              toggleFilters={toggleFilters}
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
              url={`guides/${id}/guide-formats`}
            />
          ) : (
            <CustomTable
              view={view}
              rows={rows}
              columns={columns}
              loading={isFetching}
              rowCount={rowCount}
              availableImport
              handleSortModelChange={handleSortModelChange}
              paginationModel={paginationModel}
              handlePagination={handlePagination}
              toggleFilters={toggleFilters}
              searchValue={searchValue}
              handleSearch={handleSearch}
              handleChangeView={handleChangeView}
              handleDeleteModal={handleDeleteModal}
              handleActions={handleActions}
              pageName='Formats'
              rowHeight={config.datagrid.rowHeight}
            />
          ))}
        {view === 'cards' && (
          <GuideFormatsCards
            rows={rows}
            loading={isFetching}
            commonData={commonData}
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
            url={`guides/${id}/guide-formats`}
          />
        )}
        <GuideFormatsFilter
          rows={rows}
          commonData={commonData}
          handleSetFilters={handleSetFilters}
          open={filtersOpen}
          toggleFilters={toggleFilters}
          handleApplyFilters={handleApplyFilters}
        />
        <HTMLModal html={note} handleClose={() => setNote('')} />
        <DeleteModal
          rows={rows}
          open={deleteModal.open}
          ids={deleteModal.ids}
          query={`guide-formats`}
          url={`guides/${id}/guide-formats`}
          handleClose={handleClose}
        />
      </Stack>
    )
  );
}
