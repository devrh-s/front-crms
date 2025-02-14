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
import useUserProfile from '@/hooks/useUserProfile';
import { apiGetData, updateCommondData } from '@/lib/fetch';
import {
  checkPermission,
  getAppSearchParams,
  getCommonDataReq,
  getPagePermissions,
} from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import { useAuthStore } from '@/zustand/authStore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Date from '../../common/components/Date';
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import UserChip from '../../common/components/UserChip';
import { commonDataBlocks, getCommonData } from './commonData';
import GPTsCards from './GPTsCards';
import { IGPTsFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const GPTsActions = dynamic(() => import('./GPTsActions'), {
  ssr: false,
});
const GPTsFilters = dynamic(() => import('./GPTsFilter'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

export default function GPTs({ url }: { url?: string }) {
  const [view, setView] = useState('table');
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const { echo } = useContext(SocketContext);
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IGPTsFilters>();
  const {
    paginationModel,
    rowCount,
    handleRowCount,
    handlePagination,
    checkPagination,
    defaultPagination,
  } = usePagination();
  const { isAdmin, permissions } = useAuthStore();
  const { userProfile } = useUserProfile();
  const { searchValue, debouncedSearchValue, handleSearch, clearSearch } = useSearch();
  const { actionsData, deleteModal, handleActions, handleDeleteModal, handleClose } = useActions();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);
  const handleClickCopy = useCopyToClipboard();

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: [url ?? 'gpts', { paginationModel, sortOptions, debouncedSearchValue, applyFilters }],
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
      const response = await apiGetData(url ? `${url}?${searchParams}` : `gpts?${searchParams}`);
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

  const pagePermissions = useMemo(
    () => getPagePermissions('Account Manager', 'GPTS', permissions),
    [permissions]
  );

  const { data: commonData } = useQuery({
    queryKey: ['gpts-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      entities: [],
      tools: [],
      task_templates: [],
      links: [],
      accounts: [],
    },
  });

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
              key='Action Profile'
              icon={<VisibilityIcon />}
              onClick={() => router.push(`/gpts/${params.id}`)}
              label='Profile'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`/gpts/${params.id}`)}
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
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_gpts',
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
          }
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'delete_gpts',
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
        align: 'center',
        ...config.datagrid.column,
      },
      {
        field: 'name',
        headerName: fields?.name ?? 'Name',
        disableColumnMenu: true,
        description: 'Name',
        width: 250,
        renderCell: (params: GridRenderCellParams<any, number, string>) => {
          const href = `gpts/${params.id}`;
          return <NameLink href={href} name={params.value} />;
        },
      },
      {
        field: 'type',
        headerName: fields?.type_id ?? 'Type',
        disableColumnMenu: true,
        description: 'Type',
        width: 100,
        renderCell: (params: GridRenderCellParams<any, any, string>) => {
          return params.value;
        },
      },
      {
        field: 'link',
        headerName: fields?.link ?? 'Link',
        description: 'Link',
        disableColumnMenu: true,
        width: 100,
        renderCell: (params: GridRenderCellParams<any, string>) => {
          const href = params.value ?? '';
          return <NameLink href={href} name={'Link'} />;
        },
      },
      {
        field: 'links',
        headerName: fields?.links ?? 'Files',
        description: 'Files',
        disableColumnMenu: true,
        width: 200,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          return <MoreChips data={params.value} propName='name' sx={sx} />;
        },
      },
      {
        field: 'tools',
        headerName: fields?.tools ?? 'Tools',
        description: 'Tools',
        disableColumnMenu: true,
        width: 200,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          return <MoreChips data={params.value} propName='name' sx={sx} />;
        },
      },

      {
        field: 'entities',
        headerName: fields?.entities ?? 'Entities',
        description: 'Entities',
        disableColumnMenu: true,
        width: 200,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          return <MoreChips data={params.value} propName='name' sx={sx} />;
        },
      },
      {
        field: 'task_templates',
        headerName: fields?.task_templates ?? 'Task Templates',
        description: 'Task Templates',
        disableColumnMenu: true,
        width: 200,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          return <MoreChips data={params.value} propName='name' sx={sx} />;
        },
      },
      {
        field: 'custom_instructions_link',
        headerName: fields?.custom_instructions_link ?? 'Custom instructions links',
        description: 'Link',
        disableColumnMenu: true,
        width: 250,
        renderCell: (params: GridRenderCellParams<any, string>) => {
          const href = params.value ?? '';
          return <NameLink href={href} name={'Custom instructions link'} />;
        },
      },
      {
        field: 'owner',
        headerName: fields?.owner_id ?? 'Owner',
        description: 'Owner',
        disableColumnMenu: true,
        width: 150,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value !== null ? <UserChip data={params.value} /> : null;
        },
      },
      {
        field: 'created_by',
        disableColumnMenu: true,
        headerName: fields?.created_by ?? 'Created By',
        description: 'Created By',
        width: 150,
        valueFormatter: (value: IUser) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value !== null ? <UserChip data={params.value} /> : null;
        },
      },
      {
        field: 'created_at',
        disableColumnMenu: true,
        headerName: fields?.created_at ?? 'Created At',
        description: 'Created At',
        display: 'flex',
        width: 150,
        valueFormatter: (value: string) => dayjs(value)?.format('DD-MM-YY'),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params?.value} />
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
      echo.channel(`common-data`).listen('CommonDataChanged', (data: any) => {
        const { key } = data;
        const commonDataReq = getCommonDataReq(key, commonDataBlocks);
        if (commonDataReq) {
          updateCommondData({
            name: 'gpts-common',
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
      <GPTsActions
        id={actionsData.id}
        url={url}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <GPTsCards
            rows={rows}
            commonData={commonData}
            toggleFilters={toggleFilters}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            pagePermissions={pagePermissions}
            searchValue={searchValue}
            handleSearch={handleSearch}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            view={view}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            isSmall={true}
          />
        ) : (
          <CustomTable
            view={view}
            rows={rows}
            columns={columns}
            loading={isFetching}
            rowCount={rowCount}
            availableExport={!url}
            availableImport={!url}
            availableAdd={isAdmin || !!pagePermissions['add_gpts']}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_gpts']}
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            pageName='GPTs'
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <GPTsCards
          rows={rows}
          loading={isFetching}
          commonData={commonData}
          toggleFilters={toggleFilters}
          searchValue={searchValue}
          paginationModel={paginationModel}
          pagePermissions={pagePermissions}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          handlePagination={handlePagination}
          handleSearch={handleSearch}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
          isSmall={false}
        />
      )}
      <GPTsFilters
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
        query='gpts'
        url={url ?? 'gpts'}
        handleClose={handleClose}
      />
    </Stack>
  );
}
