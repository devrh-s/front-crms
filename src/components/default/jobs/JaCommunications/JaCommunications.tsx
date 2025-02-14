'use client';
import Date from '@/components/default/common/components/Date';
import Note from '@/components/default/common/components/Note';
import Text from '@/components/default/common/components/Text';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import { SocketContext } from '@/contexts/socketContext';
import useActions from '@/hooks/useActions';
import { useCopyToClipboard } from '@/hooks/useCopyToClickbord';
import useFilters from '@/hooks/useFilters';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import useUserProfile from '@/hooks/useUserProfile';
import { apiGetData, updateCommondData } from '@/lib/fetch';
import { checkPermission, getAppSearchParams, getPagePermissions } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import { useAuthStore } from '@/zustand/authStore';
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
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import UserChip from '../../common/components/UserChip';
import JaCommunicationsCards from './JaCommunicationsCards';
import { commonDataBlocks, getCommonData } from './commonData';
import { IJaCommunicationsFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const JaCommunicationActions = dynamic(() => import('./JaCommunicationActions'), {
  ssr: false,
});
const JaCommunicationsFilter = dynamic(() => import('./JaCommunicationsFilter'), {
  ssr: false,
});
const HTMLModal = dynamic(() => import('@/components/default/common/modals/HTMLModal/HTMLModal'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

interface IJaCommunications {
  url?: string;
  communications?: any;
}

export default function JaCommunications({ url, communications }: IJaCommunications) {
  const [view, setView] = useState('table');
  const [note, setNote] = useState('');
  const { echo } = useContext(SocketContext);
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IJaCommunicationsFilters>();
  const {
    paginationModel,
    rowCount,
    handleRowCount,
    handlePagination,
    checkPagination,
    defaultPagination,
  } = usePagination();
  const { isAdmin, permissions } = useAuthStore();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const { userProfile } = useUserProfile();
  const { searchValue, debouncedSearchValue, handleSearch, clearSearch } = useSearch();
  const { actionsData, deleteModal, handleActions, handleDeleteModal, handleClose } = useActions();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const handleClickCopy = useCopyToClipboard();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);
  const { isFetching, isError, data } = useQuery({
    queryKey: [
      url ?? 'ja-communications',
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
        url ? `${url}?${searchParams}` : `ja-communications?${searchParams}`
      );
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
    queryKey: ['ja-communications-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      countries: [],
      actions: [],
      currencies: [],
      pricings: [],
      users: [],
    },
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Jobs', 'Ja Communications', permissions),
    [permissions]
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'Actions',
        headerName: '',
        type: 'actions',
        ...config.datagrid.column,
        getActions: (params: { id: number; row: any }) => {
          const actions = [
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`ja-communications/${params.id}`)}
              label='Copy'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_communications',
              userId: userProfile?.id,
              ownerId: params.row.created_by?.id,
              isAdmin,
            })
          ) {
            actions.push(
              <GridActionsCellItem
                key='Action Edit'
                icon={<EditIcon />}
                onClick={() => handleActions(true, params.id)}
                label='Edit'
                showInMenu
              />
            );
            actions.push(
              <GridActionsCellItem
                key='Action Duplicate'
                icon={<CopyAllIcon />}
                onClick={() => handleActions(true, params.id, true)}
                label='Duplicate'
                showInMenu
              />
            );
          }
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'delete_communications',
              userId: userProfile?.id,
              ownerId: params.row.created_by?.id,
              isAdmin,
            })
          ) {
            actions.push(
              <GridActionsCellItem
                key='Action Delete'
                onClick={() => {
                  handleDeleteModal(true, [params.id]);
                }}
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
        ...config.datagrid.column,
        width: 50,
      },
      {
        field: 'job_application',
        headerName: fields?.job_application_id ?? 'Job Application',
        description: 'Job Application',
        disableColumnMenu: true,
        display: 'flex',
        width: 300,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <NameLink
            name={params?.value?.name}
            href={`job-applications/${params?.row?.job_application?.id}`}
          />
        ),
      },
      {
        field: 'account',
        headerName: fields?.account_id ?? 'Account',
        description: 'Account',
        disableColumnMenu: true,
        display: 'flex',
        width: 200,
        valueFormatter: (value: any) => value?.name ?? '',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <NameLink name={params?.value?.name} href={`accounts/${params?.value?.id}`} />
        ),
      },
      {
        field: 'accountTool',
        headerName: fields?.account_tool_id ?? 'Account Tool',
        description: 'Account',
        disableColumnMenu: true,
        display: 'flex',
        width: 200,
        renderCell: (params) => {
          return params.row?.account?.tool ? <UserChip data={params.row?.account?.tool} /> : '';
        },
      },
      {
        field: 'channel',
        headerName: fields?.channel_id ?? 'Channel',
        description: 'Channel',
        disableColumnMenu: true,
        display: 'flex',
        width: 200,
        valueFormatter: (params: any) => params?.value ?? '',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return <Text text={params.row?.channel?.value} />;
        },
      },
      {
        field: 'channelTool',
        headerName: fields?.channel_tool_id ?? 'Channel Tool',
        description: 'Channel Tool',
        disableColumnMenu: true,
        display: 'flex',
        width: 200,
        renderCell: (params) => {
          return params.row?.account?.tool ? <UserChip data={params.row?.channel?.tool} /> : '';
        },
      },
      {
        field: 'communication_type',
        headerName: fields?.communication_type__id ?? 'Communication Type',
        description: 'Communication Type',
        disableColumnMenu: true,
        display: 'flex',
        align: 'center',
        width: 100,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value?.name} />
        ),
      },
      {
        field: 'messages',
        headerName: fields?.messages ?? 'Messages',
        description: 'Messages',
        disableColumnMenu: true,
        width: 250,
        sortable: false,
        display: 'flex',
        cellClassName: 'chips-cell',
        valueFormatter: (params: any) => params.map((el: any) => el.title).join(', '),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            display: 'flex',
            alignItems: 'center',
          };
          return <MoreChips data={params.value} propName='title' sx={sx} />;
        },
      },
      {
        field: 'followup_time',
        disableColumnMenu: true,
        headerName: fields?.followup_time ?? 'Followup Time',
        description: 'Followup Time',
        display: 'flex',
        valueFormatter: (params: any) => (params?.value ? dayjs(params?.value) : ''),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params.value} />
        ),
        width: 150,
      },
      {
        field: 'followup_date',
        disableColumnMenu: true,
        headerName: fields?.followup_date ?? 'Followup Date',
        description: 'Followup Date',
        display: 'flex',
        valueFormatter: (params: any) => dayjs(params.value),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
        width: 150,
      },
      {
        field: 'created_at',
        disableColumnMenu: true,
        headerName: fields?.created_at ?? 'Created At',
        description: 'Created At',
        display: 'flex',
        valueFormatter: (params: any) => dayjs(params.value),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
        width: 150,
      },
      {
        field: 'created_by',
        disableColumnMenu: true,
        headerName: fields?.created_by ?? 'Created By',
        description: 'Created By',
        display: 'flex',
        width: 150,
        valueFormatter: (value: any) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value !== null ? <UserChip data={params.value} /> : null;
        },
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
    ],
    [fields, userProfile, pagePermissions, isAdmin]
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
              name: 'ja-communications-common',
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
      <JaCommunicationActions
        id={actionsData.id}
        visible={actionsData.visible}
        url={url}
        commonData={commonData}
        handleActions={handleActions}
        jobApplicationHidden={true}
        isDuplicate={actionsData.isDuplicate}
        communications={communications}
      />
      {view === 'table' &&
        (mdDown ? (
          <JaCommunicationsCards
            rows={rows}
            commonData={commonData}
            toggleFilters={toggleFilters}
            paginationModel={paginationModel}
            pagePermissions={pagePermissions}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            handlePagination={handlePagination}
            searchValue={searchValue}
            handleSearch={handleSearch}
            view={view}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            availableAdd={!!url}
            isSmall
          />
        ) : (
          <CustomTable
            view={view}
            rows={rows}
            columns={columns}
            pageName='ja communications'
            loading={isFetching}
            rowCount={rowCount}
            availableExport
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            availableAdd={(isAdmin || !!pagePermissions['add_communications']) && !!url}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_communications']}
            searchValue={searchValue}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            // availableAdd={!!url}
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <JaCommunicationsCards
          rows={rows}
          loading={isFetching}
          commonData={commonData}
          pagePermissions={pagePermissions}
          toggleFilters={toggleFilters}
          searchValue={searchValue}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          paginationModel={paginationModel}
          handlePagination={handlePagination}
          handleSearch={handleSearch}
          view={view}
          availableAdd={!!url}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
        />
      )}
      <JaCommunicationsFilter
        rows={rows}
        filters={filters}
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
        query={url ?? 'ja-communications'}
        url='ja-communications'
        handleClose={handleClose}
      />
    </Stack>
  );
}
