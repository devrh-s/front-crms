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
import { Box, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from '@mui/x-data-grid';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Date from '../../common/components/Date';
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import Note from '../../common/components/Note';
import Priority from '../../common/components/Priority';
import Status from '../../common/components/Status';
import Translation from '../../common/components/Translation';
import UserChip from '../../common/components/UserChip';
import { commonDataBlocks, getCommonData } from './commonData';
import DepartmentsCards from './DepartmentsCards';
import { IDeparmentFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const DepartmentActions = dynamic(() => import('./DepartmentActions'), {
  ssr: false,
});
const DepartmentsFilter = dynamic(() => import('./DepartmentsFilter'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);
const HTMLModal = dynamic(() => import('@/components/default/common/modals/HTMLModal/HTMLModal'), {
  ssr: false,
});

export default function Departments() {
  const router = useRouter();
  const [view, setView] = useState('table');
  const { echo } = useContext(SocketContext);
  const [description, setDescription] = useState('');
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IDeparmentFilters>(false);
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
  const { isAdmin, permissions } = useAuthStore();
  const { userProfile } = useUserProfile();
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);
  const handleClickCopy = useCopyToClipboard();
  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);
  const { isFetching, isError, data } = useQuery({
    queryKey: ['departments', { paginationModel, sortOptions, debouncedSearchValue, applyFilters }],
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
      const response = await apiGetData(`departments?${searchParams}`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Libraries', 'Departments', permissions),
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

  const changeDescription = (newDescription: string) => setDescription(newDescription);

  const { data: commonData } = useQuery({
    queryKey: ['departments-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      groups: [],
      statuses: [],
      priorities: [],
      users: [],
    },
  });

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'Actions',
        headerName: '',
        ...config.datagrid.column,
        cellClassName: 'table-actions',
        type: 'actions',
        getActions: (params: { id: number; row: any }) => {
          const actions = [
            <GridActionsCellItem
              key='Action Profile'
              icon={<VisibilityIcon />}
              onClick={() => router.push(`/departments/${params.id}`)}
              label='Profile'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`/departments/${params.id}`)}
              label='Copy'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_departments',
              userId: userProfile?.id,
              ownerId: params.row?.created_by?.id,
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
              permissionType: 'delete_departments',
              userId: userProfile?.id,
              ownerId: params.row?.created_by?.id,
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
        display: 'flex',
        width: 250,
        renderCell: (params: GridRenderCellParams<any, number, string>) => {
          const href = `departments/${params.id}`;
          return <NameLink href={href} name={params.value} />;
        },
      },
      {
        field: 'status',
        headerName: fields?.status_id ?? 'Status',
        description: 'Status',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Status name={params?.value?.name} color={params?.value?.color} />
        ),
      },
      {
        field: 'color',
        headerName: fields?.color ?? 'Color',
        disableColumnMenu: true,
        description: 'Color',
        width: 250,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <Typography>{params.value}</Typography>
            <Box
              sx={{
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                bgcolor: params.value,
              }}
            ></Box>
          </Box>
        ),
      },
      {
        field: 'translation',
        headerName: fields?.translation_id ?? 'Translation',
        description: 'Translation',
        disableColumnMenu: true,
        display: 'flex',
        width: 100,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Translation text={params?.value?.iso2} />
        ),
      },
      {
        field: 'library',
        headerName: fields?.library_id ?? 'Group',
        description: 'Group',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) =>
          params.value?.name,
      },
      {
        field: 'priority',
        headerName: fields?.priority_id ?? 'Priority',
        description: 'Priority',
        disableColumnMenu: true,
        display: 'flex',
        width: 100,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Priority priority={params?.value?.name} />
        ),
      },
      {
        field: 'image_icon',
        headerName: fields?.image_icon ?? 'Icon',
        description: 'Icon',
        disableColumnMenu: true,
        display: 'flex',
        align: 'center',
        width: 80,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          if (params.value) {
            return <Image src={params.value} width={40} height={40} alt='Icon' />;
          }
        },
      },

      {
        field: 'professions',
        headerName: fields?.professions ?? 'Professions',
        description: 'Professions',
        disableColumnMenu: true,
        display: 'flex',
        width: 200,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
          };
          return <MoreChips data={params.value} propName='name' sx={sx} />;
        },
      },
      {
        field: 'links',
        headerName: fields?.links ?? 'Links',
        description: 'Links',
        disableColumnMenu: true,
        display: 'flex',
        width: 200,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
          };
          return params.value && <MoreChips data={params.value} propName='name' sx={sx} />;
        },
      },
      {
        field: 'description',
        headerName: fields?.description ?? 'Description',
        description: 'Description',
        disableColumnMenu: true,
        type: 'actions',
        width: 250,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Note value={params?.value} setNote={changeDescription} />
        ),
      },
      {
        field: 'created_at',
        headerName: fields?.created_at ?? 'Created At',
        description: 'Created At',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
      },
      {
        field: 'created_by',
        headerName: fields?.created_by ?? 'Created By',
        description: 'Created By',
        disableColumnMenu: true,
        width: 150,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value !== null ? <UserChip data={params.value} /> : null;
        },
      },
    ],
    [fields, pagePermissions, isAdmin]
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
            name: 'departments-common',
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
      <DepartmentActions
        id={actionsData.id}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <DepartmentsCards
            rows={rows}
            commonData={commonData}
            toggleFilters={toggleFilters}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            searchValue={searchValue}
            handleSearch={handleSearch}
            pagePermissions={pagePermissions}
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
            availableExport
            availableImport
            pageName='departments'
            loading={isFetching}
            rowCount={rowCount}
            availableAdd={isAdmin || !!pagePermissions['add_departments']}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_departments']}
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <DepartmentsCards
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
      <DepartmentsFilter
        rows={rows}
        commonData={commonData}
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
      />
      <HTMLModal html={description} handleClose={() => setDescription('')} />
      <DeleteModal
        rows={rows}
        open={deleteModal.open}
        ids={deleteModal.ids}
        query='departments'
        url='departments'
        handleClose={handleClose}
      />
    </Stack>
  );
}
