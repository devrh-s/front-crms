'use client';
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
import { checkPermission, getAppSearchParams, getPagePermissions } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import { useAuthStore } from '@/zustand/authStore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Stack, Theme, useMediaQuery } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
  GridTreeNodeWithRender,
} from '@mui/x-data-grid';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { commonDataBlocks, getCommonData } from './commonData';
import ContactsCards from './ContactsCards';
import { IContactsFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const ContactsActions = dynamic(() => import('./ContactsActions'), {
  ssr: false,
});
const ContactsFilter = dynamic(() => import('./ContactsFilter'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);
interface IContacts {
  url?: string;
  block?: string;
  page?: string;
  permType?: string;
}

export default function Contacts({
  url,
  block = 'Blocks',
  page = 'Blocks',
  permType = '',
}: IContacts) {
  const [view, setView] = useState('table');
  const { echo } = useContext(SocketContext);
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const { isAdmin, permissions } = useAuthStore();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
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
  } = useFilters<IContactsFilters>();

  const dispatch = useDispatch();
  const { isFetching, isError, data } = useQuery({
    queryKey: [
      url ?? 'contacts',
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
      const response = await apiGetData(
        url ? `${url}?${searchParams}` : `contacts?${searchParams}`
      );
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions(block, page, permissions),
    [permissions]
  );

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
    queryKey: ['contacts-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      tools: [],
    },
  });

  const columns: GridColDef[] = useMemo(() => {
    const baseColumns: GridColDef[] = [
      {
        field: 'Actions',
        headerName: '',
        type: 'actions',
        disableColumnMenu: true,
        width: 150,
        getActions: (params: GridRowParams<any>) => {
          const actions = [
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`/contacts/${params.id}`)}
              label='Copy'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: `edit${permType}_contacts`,
              isAdmin,
            })
          ) {
            actions.push(
              <GridActionsCellItem
                key='Action Edit'
                icon={<EditIcon />}
                onClick={() => handleActions(true, params.id as number)}
                label='Edit'
                showInMenu
              />
            );
          }
          if (
            checkPermission({
              pagePermissions,
              permissionType: `delete${permType}_contacts`,
              isAdmin,
            })
          ) {
            actions.push(
              <GridActionsCellItem
                key='Action Delete'
                onClick={() => handleDeleteModal(true, [params.id as number])}
                icon={<DeleteIcon />}
                label='Delete'
                showInMenu
              />
            );
          }
          return actions;
        },
      },
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
      },
      {
        field: 'value',
        headerName: fields?.value ?? 'Value',
        disableColumnMenu: true,
        description: 'Value',
        flex: 1,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <span>{params.row?.value || 'No value'}</span>
        ),
      },
      {
        field: 'tool',
        headerName: fields?.tool_id ?? 'Tool',
        description: 'Tool',
        disableColumnMenu: true,
        sortable: false,
        flex: 1,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <span>{params.row?.tool?.name || 'No tool'}</span>
        ),
      },
    ];

    if (!url) {
      baseColumns.push(
        {
          field: 'relation',
          headerName: fields?.block_id ?? 'Relation',
          description: 'Relation',
          disableColumnMenu: true,
          sortable: false,
          width: 350,
          renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
            <a href={`/${params.row?.relation?.url}`}>
              {params.row?.relation?.default_title || 'No relation'}
            </a>
          ),
        },
        {
          field: 'located_at',
          headerName: fields?.located_at_id ?? 'Located At',
          description: 'Located At',
          disableColumnMenu: true,
          width: 350,
          renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
            <span>{params.row.located_at?.name || 'No location'}</span>
          ),
        }
      );
    }

    return baseColumns;
  }, [fields, pagePermissions, isAdmin, url]);

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
              name: 'contacts-common',
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
    <Stack gap='2rem'>
      <ContactsActions
        id={actionsData.id}
        url={url}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <ContactsCards
            rows={rows}
            url={url}
            loading={isFetching}
            commonData={commonData}
            searchValue={searchValue}
            paginationModel={paginationModel}
            pagePermissions={pagePermissions}
            permType={permType}
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
            pageName='Contacts'
            loading={isFetching}
            rowCount={rowCount}
            // columnVisibilityModel={{
            //   relation: !url,
            //   located_at: !url,
            // }}
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            availableAdd={!!url && (isAdmin || !!pagePermissions[`add${permType}_contacts`])}
            multiDeletePermission={isAdmin || !!pagePermissions[`delete${permType}_contacts`]}
            handlePagination={handlePagination}
            searchValue={searchValue}
            toggleFilters={toggleFilters}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <ContactsCards
          rows={rows}
          url={url}
          loading={isFetching}
          commonData={commonData}
          searchValue={searchValue}
          paginationModel={paginationModel}
          pagePermissions={pagePermissions}
          permType={permType}
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
      <ContactsFilter
        rows={rows}
        commonData={commonData}
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
      />
      <DeleteModal
        rows={rows}
        open={deleteModal.open}
        ids={deleteModal.ids}
        query={url ?? 'contacts'}
        url={url ?? 'contacts'}
        handleClose={handleClose}
      />
    </Stack>
  );
}
