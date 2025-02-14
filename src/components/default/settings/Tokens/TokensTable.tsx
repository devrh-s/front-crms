'use client';

import Date from '@/components/default/common/components/Date';
import config from '@/config';
import { SocketContext } from '@/contexts/socketContext';
import useActions from '@/hooks/useActions';
import useFilters from '@/hooks/useFilters';
import useModal from '@/hooks/useModal';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import { apiGetData, updateCommondData } from '@/lib/fetch';
import { getAppSearchParams } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import DeleteIcon from '@mui/icons-material/Delete';
import { Stack, Theme, useMediaQuery } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from '@mui/x-data-grid';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dispatch, SetStateAction, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Note from '../../common/components/Note';
import Text from '../../common/components/Text';
import UserChip from '../../common/components/UserChip';
import DeleteModal from '../../common/modals/DeleteModal/DeleteModal';
import HTMLModal from '../../common/modals/HTMLModal/HTMLModal';
import CustomTable from '../../common/tables/CustomTable';
import { commonDataBlocks, getCommonData } from './commonData';
import TokensCards from './TokensCards';
import TokensFilter from './TokensFilter';
import { ITokensFilters, TokensVariant } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

interface ITokensTableProps {
  setTokensVariant: Dispatch<SetStateAction<TokensVariant>>;
}

export default function TokensTable({ setTokensVariant }: ITokensTableProps) {
  const [view, setView] = useState('table');
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const { echo } = useContext(SocketContext);
  const { deleteModal, handleDeleteModal, handleClose } = useActions();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [description, handleSetDescription] = useModal();
  const {
    paginationModel,
    rowCount,
    handleRowCount,
    handlePagination,
    checkPagination,
    defaultPagination,
  } = usePagination();
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<ITokensFilters>();
  const { searchValue, debouncedSearchValue, handleSearch, clearSearch } = useSearch();
  const queryClient = useQueryClient();

  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { data } = useQuery({
    queryKey: ['tokens', { paginationModel, sortOptions, debouncedSearchValue, applyFilters }],
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
      const response = await apiGetData(`tokens?${searchParams}`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const onClickAdd = () => {
    setTokensVariant(TokensVariant.SETTINGS);
  };

  const { data: commonData } = useQuery({
    queryKey: ['tokens'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      users: [],
    },
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
        ...config.datagrid.column,
        type: 'actions',
        getActions: (params: { id: number; row: any }) => {
          const actions = [
            <GridActionsCellItem
              key='Action Delete'
              onClick={() => {
                handleDeleteModal(true, [params.id]);
              }}
              icon={<DeleteIcon />}
              label='Delete'
              showInMenu
            />,
          ];

          return actions;
        },
      },

      {
        field: 'id',
        headerName: 'ID',
        ...config.datagrid.column,
      },
      {
        field: 'name',
        headerName: fields?.name ?? 'Name',
        description: 'Name',
        disableColumnMenu: true,
        flex: 1,
        renderCell: (params: GridRenderCellParams<{ name: string }>) => {
          return (
            <Text
              text={params?.row?.name}
              style={{ display: 'flex', alignItems: 'center', height: '100%' }}
            />
          );
        },
      },
      {
        field: 'token',
        headerName: fields?.token ?? 'Token',
        description: 'Token',
        disableColumnMenu: true,
        flex: 1,
        renderCell: (params: GridRenderCellParams<{ token: string }>) => {
          return (
            <Text
              text={params?.row?.token}
              style={{ display: 'flex', alignItems: 'center', height: '100%' }}
            />
          );
        },
      },
      {
        field: 'description',
        headerName: fields?.description ?? 'Description',
        description: 'Description',
        disableColumnMenu: true,
        flex: 1,
        renderCell: (params: GridRenderCellParams<{ description: string }>) => {
          return <Note value={params?.row?.description} setNote={handleSetDescription} />;
        },
      },
      {
        field: 'created_at',
        disableColumnMenu: true,
        headerName: fields?.created_at ?? 'Created At',
        description: 'Created At',
        flex: 1,
        display: 'flex',
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value !== null ? <Date date={params.value} /> : null;
        },
      },
      {
        field: 'expired_at',
        disableColumnMenu: true,
        headerName: fields?.expired_at ?? 'Expired At',
        description: 'Expired At',
        flex: 1,
        display: 'flex',
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value !== null ? <Date date={params.value} /> : null;
        },
      },
      {
        field: 'created_by',
        disableColumnMenu: true,
        headerName: fields?.created_by ?? 'Created By',
        description: 'Created By',
        flex: 1,
        display: 'flex',
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value !== null ? <UserChip data={params?.value} /> : null;
        },
      },
    ],
    [fields]
  );

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
              name: 'tokens',
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

  const handleChangeView = (_: React.MouseEvent<HTMLElement>, newView: string) => {
    clearSearch();
    clearSort();
    defaultPagination();
    setView((prev) => newView ?? prev);
  };

  return (
    <Stack gap='2rem'>
      {view === 'table' &&
        (mdDown ? (
          <TokensCards
            rows={rows}
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
            handleActions={onClickAdd}
            isSmall={true}
          />
        ) : (
          <CustomTable
            view={view}
            rows={rows}
            columns={columns}
            rowCount={rowCount}
            availableAdd
            multiDeletePermission
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={onClickAdd}
            pageName='Tokens'
            rowHeight={config.datagrid.rowHeight}
            availableExport
            availableImport
          />
        ))}
      {view === 'cards' && (
        <TokensCards
          rows={rows}
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
          handleActions={onClickAdd}
          isSmall={false}
        />
      )}
      <TokensFilter
        commonData={commonData}
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
      />
      <HTMLModal html={description} handleClose={() => handleSetDescription('')} />
      <DeleteModal
        rows={rows}
        open={deleteModal.open}
        ids={deleteModal.ids}
        query='tokens'
        url='tokens'
        handleClose={handleClose}
      />
    </Stack>
  );
}
