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
import { checkPermission, getAppSearchParams, getPagePermissions } from '@/lib/helpers';
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
import CustomChip from '../../common/components/CustomChip';
import Date from '../../common/components/Date';
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import UserChip from '../../common/components/UserChip';
import GuideInfo from '../components/GuideInfo';
import ChecklistItemsCards from './ChecklistItemsCards';
import { commonDataBlocks, getCommonData } from './commonData';
import { IChecklistItemsFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const ChecklistItemsActions = dynamic(() => import('./ChecklistItemsActions'), {
  ssr: false,
});
const CheklistItemsFilter = dynamic(() => import('./ChecklistitemsFilter'), {
  ssr: false,
});
const Modal = dynamic(() => import('../../common/modals/Modal/Modal'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

const availabilities = [
  { id: 0, name: 'No' },
  { id: 1, name: 'Yes' },
];

export default function ChecklistItems() {
  const [view, setView] = useState('table');
  const { userProfile } = useUserProfile();
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
  } = useFilters<IChecklistItemsFilters>();
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
  const { isAdmin, permissions } = useAuthStore();
  const router = useRouter();
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const [infoModal, setInfoModal] = useState<IGuideType | null>(null);
  const [cardsStorageActive, setCardsStorageActive] = useState(false);
  const handleClickCopy = useCopyToClipboard();
  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);
  const handleSetModal = (data: IGuideType) => {
    setInfoModal({ ...data });
  };
  const { isFetching, isError, data } = useQuery({
    queryKey: [
      'checklist-items',
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
      const response = await apiGetData(`checklist-items?${searchParams}`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Task Manager', 'Checklist Items', permissions),
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
    queryKey: ['checklist-items-common'],
    queryFn: async () => {
      const data = await getCommonData();
      return {
        ...data,
        availabilities,
      };
    },
    refetchOnWindowFocus: false,
    placeholderData: {
      guides: [],
      users: [],
      placements: [],
      availabilities,
    },
  });

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'Actions',
        headerName: '',
        maxWidth: 1,
        cellClassName: 'table-actions',
        type: 'actions',
        ...config.datagrid.column,
        getActions: (params: { id: number; row: any }) => {
          const actions = [
            <GridActionsCellItem
              key='Action Profile'
              icon={<VisibilityIcon />}
              onClick={() => router.push(`/checklist-items/${params.id}`)}
              label='Profile'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`/checklist-items/${params.id}`)}
              label='Copy'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_checklist_items',
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
              permissionType: 'delete_checklist_items',
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
      },
      {
        field: 'name',
        headerName: fields?.name ?? 'Name',
        disableColumnMenu: true,
        description: 'Name',
        width: 250,
        renderCell: (params: GridRenderCellParams<any, number, string>) => {
          const href = `checklist-items/${params.id}`;
          const isDraft = rows.find((obj: any) => obj.id === params?.row?.id)?.is_draft === 1;

          return (
            <Stack flexDirection={'row'} gap={1} alignItems={'center'}>
              <NameLink href={href} name={params.value} />
              {isDraft && <CustomChip data={{ name: 'Draft', bgColor: 'error' }} />}
            </Stack>
          );
        },
      },
      {
        field: 'object',
        headerName: fields?.object_id ?? 'Object',
        description: 'Object',
        disableColumnMenu: true,
        display: 'flex',
        width: 140,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any>) => {
          const link = `/objects/${params?.value?.id}`;
          return <NameLink href={link} name={params?.value?.name} />;
        },
      },
      {
        field: 'tool',
        headerName: fields?.tool_id ?? 'Tool',
        description: 'Tool',
        disableColumnMenu: true,
        display: 'flex',
        width: 140,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any>) => {
          return <NameLink href={params?.value?.link} name={params?.value?.name} />;
        },
      },
      {
        field: 'action',
        headerName: fields?.action_id ?? 'Action',
        description: 'Action',
        disableColumnMenu: true,
        display: 'flex',
        width: 140,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any>) => {
          const link = `/actions/${params?.value?.id}`;
          return <NameLink href={link} name={params?.value?.name} />;
        },
      },
      {
        field: 'placement',
        headerName: fields?.placement_id ?? 'Placement',
        disableColumnMenu: true,
        description: 'Placement',
        width: 150,
        renderCell: (params: GridRenderCellParams<any, any, string>) => {
          const href = `placements/${params.value?.id}`;
          return <NameLink href={href} name={params.value?.name} sx={{ pl: 0 }} />;
        },
      },
      {
        field: 'guides',
        headerName: fields?.guides ?? 'Guides',
        description: 'Guides',
        disableColumnMenu: true,
        display: 'flex',
        width: 350,
        valueFormatter: (value: IGuideType[]) => value.map((el: { name: string }) => el.name),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          return (
            <MoreChips
              data={params.value}
              propName='name'
              sx={sx}
              handleSetModal={handleSetModal}
            />
          );
        },
      },
      {
        field: 'created_by',
        disableColumnMenu: true,
        headerName: fields?.created_by ?? 'Created By',
        description: 'Created By',
        display: 'flex',
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
          <Date date={params.value} />
        ),
      },
      {
        field: 'updated_at',
        disableColumnMenu: true,
        headerName: fields?.updated_at ?? 'Updated At',
        description: 'Updated At',
        display: 'flex',
        width: 150,
        valueFormatter: (value: string) => dayjs(value)?.format('DD-MM-YY'),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          if (params.value) {
            return <Date date={params.value} />;
          }
          return null;
        },
      },
    ],
    [fields, pagePermissions, isAdmin, rows]
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
              name: 'checklist-items-common',
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
      <ChecklistItemsActions
        id={actionsData.id}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <ChecklistItemsCards
            rows={rows}
            loading={isFetching}
            commonData={commonData}
            toggleFilters={toggleFilters}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            searchValue={searchValue}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            pagePermissions={pagePermissions}
            handleSearch={handleSearch}
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
            loading={isFetching}
            rowCount={rowCount}
            availableImport
            availableExport
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            handleSearch={handleSearch}
            availableAdd={isAdmin || !!pagePermissions['add_checklist_items']}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_checklist_items']}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            pageName='Checklist Items'
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <ChecklistItemsCards
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
          pagePermissions={pagePermissions}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
        />
      )}
      <CheklistItemsFilter
        rows={rows}
        commonData={commonData}
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
      />
      <Modal
        title={`${infoModal && infoModal.name} (ID:${infoModal && infoModal.id})`}
        open={!!infoModal}
        link={`./guides/${infoModal && infoModal.id}`}
        handleClose={() => setInfoModal(null)}
      >
        <GuideInfo guide={infoModal} />
      </Modal>
      <DeleteModal
        rows={rows}
        open={deleteModal.open}
        ids={deleteModal.ids}
        query='checklist-items'
        url='checklist-items'
        handleClose={handleClose}
      />
    </Stack>
  );
}
