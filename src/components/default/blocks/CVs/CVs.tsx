'use client';
import CustomChip from '@/components/default/common/components/CustomChip';
import Date from '@/components/default/common/components/Date';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import { SocketContext } from '@/contexts/socketContext';
import useActions from '@/hooks/useActions';
import { useCopyToClipboard } from '@/hooks/useCopyToClickbord';
import useFilters from '@/hooks/useFilters';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import { apiGetData, updateCommondData } from '@/lib/fetch';
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
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Note from '../../common/components/Note';
import HTMLModal from '../../common/modals/HTMLModal/HTMLModal';
import { commonDataBlocks, getCommonData } from './commonData';
import CVsCards from './CVsCards';
import { ICVsFilters } from './CVsFilter';
import { useGuidesStore } from '@/zustand/guidesStore';

const CVsActions = dynamic(() => import('./CVsActions'), {
  ssr: false,
});
const CVsFilter = dynamic(() => import('./CVsFilter'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

interface ICVsProps {
  url?: string;
}

export default function CVs({ url }: ICVsProps) {
  const [view, setView] = useState('table');
  const [note, setNote] = useState('');
  const { echo } = useContext(SocketContext);
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
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
  const queryClient = useQueryClient();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);
  const handleClickCopy = useCopyToClipboard();
  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<ICVsFilters>();

  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const { isFetching, isError, data } = useQuery({
    queryKey: [url ?? 'cvs', { paginationModel, sortOptions, debouncedSearchValue, applyFilters }],
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
      const response = await apiGetData(url ? `${url}?${searchParams}` : `cvs?${searchParams}`);
      return response;
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

  const { data: commonData } = useQuery({
    queryKey: ['cvs-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      tools: [],
    },
  });

  const columns: GridColDef<ICV>[] = useMemo(
    () => [
      {
        field: 'Actions',
        headerName: '',
        type: 'actions',
        ...config.datagrid.column,
        getActions: (params: { id: number }) => [
          <GridActionsCellItem
            key='Action Copy'
            icon={<ContentCopyIcon />}
            onClick={() => handleClickCopy(`/${url || 'cvs'}/${params.id}`)}
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
            key='Action Delete'
            onClick={() => {
              handleDeleteModal(true, [params.id]);
            }}
            icon={<DeleteIcon />}
            label='Delete'
            showInMenu
          />,
          <GridActionsCellItem
            key='Action Duplicate'
            icon={<CopyAllIcon />}
            onClick={() => handleActions(true, params.id, true)}
            label='Duplicate'
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
        field: 'company_name',
        headerName: fields?.company_name ?? 'Company Name',
        description: 'Company Name',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
      },
      {
        field: 'specialisation',
        headerName: fields?.specialisation ?? 'Specialisation',
        description: 'Specialisation',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
      },
      {
        field: 'note',
        disableColumnMenu: true,
        headerName: fields?.note ?? 'Notes',
        description: 'Notes',
        type: 'actions',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Note value={params.value} setNote={setNote} />
        ),
      },
      {
        field: 'country',
        headerName: fields?.country_id ?? 'Country',
        disableColumnMenu: true,
        description: 'Country',
        renderCell: (params) => <CustomChip label={params.value?.name} data={params.value} />,
        display: 'flex',
        width: 140,
      },
      {
        field: 'start_date',
        headerName: fields?.start_date ?? 'Start Date',
        description: 'Start Date',
        disableColumnMenu: true,
        display: 'flex',
        renderCell: (params) => <Date date={params.row.start_date} />,
        width: 140,
      },
      {
        field: 'end_date',
        headerName: fields?.end_date ?? 'End Date',
        description: 'End Date',
        disableColumnMenu: true,
        display: 'flex',
        renderCell: (params) => {
          if (!params.row.end_date) {
            return null;
          }
          return <Date date={params.row.end_date} />;
        },
        width: 140,
      },
      {
        field: 'cv_type',
        headerName: fields?.cv_type_id ?? 'CV Type',
        description: 'CV Type',
        disableColumnMenu: true,
        display: 'flex',
        valueFormatter: (value: any) => value?.name,
        width: 120,
      },
      {
        field: 'professions',
        headerName: fields?.professions ?? 'Professions',
        description: 'Professions',
        disableColumnMenu: true,
        display: 'flex',
        valueFormatter: (value: any[]) => value.map((item) => item?.name).join(', '),
        width: 200,
      },
      {
        field: 'industries',
        headerName: fields?.industries ?? 'Industries',
        description: 'Industries',
        disableColumnMenu: true,
        display: 'flex',
        valueFormatter: (value: any[]) => value.map((item) => item.name).join(', '),
        width: 200,
      },
      {
        field: 'sub_industries',
        headerName: fields?.subIndustries ?? 'Sub Industries',
        description: 'Sub Industries',
        disableColumnMenu: true,
        display: 'flex',
        valueFormatter: (value: any[]) => value.map((item) => item.name).join(', '),
        width: 200,
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
              name: 'cvs-common',
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
  }, [meta]);

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
      <CVsActions
        id={actionsData.id}
        url={url}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <CVsCards
            rows={rows}
            url={url}
            loading={isFetching}
            commonData={commonData}
            searchValue={searchValue}
            paginationModel={paginationModel}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            handlePagination={handlePagination}
            handleSearch={handleSearch}
            toggleFilters={toggleFilters}
            view={view}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            isSmall
          />
        ) : (
          <CustomTable
            view={view}
            rows={rows}
            columns={columns}
            pageName='CVs'
            loading={isFetching}
            rowCount={rowCount}
            availableAdd={!!url}
            // columnVisibilityModel={{
            //   relation: !url,
            //   located_at: !url,
            // }}
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            searchValue={searchValue}
            toggleFilters={toggleFilters}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            rowHeight={config.datagrid.rowHeight}
            multiDeletePermission
          />
        ))}
      {view === 'cards' && (
        <CVsCards
          rows={rows}
          url={url}
          loading={isFetching}
          commonData={commonData}
          searchValue={searchValue}
          paginationModel={paginationModel}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          handlePagination={handlePagination}
          toggleFilters={toggleFilters}
          handleSearch={handleSearch}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
        />
      )}
      <CVsFilter
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
        query={url ?? 'cvs'}
        url={url ?? 'cvs'}
        handleClose={handleClose}
      />
    </Stack>
  );
}
