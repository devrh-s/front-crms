'use client';
import Date from '@/components/default/common/components/Date';
import MoreChips from '@/components/default/common/components/MoreChips';
import NameLink from '@/components/default/common/components/NameLink';
import Note from '@/components/default/common/components/Note';
import UserChip from '@/components/default/common/components/UserChip';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import { SocketContext } from '@/contexts/socketContext';
import useActions from '@/hooks/useActions';
import useFilters from '@/hooks/useFilters';
import useModal from '@/hooks/useModal';
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
import { commonDataBlocks, getCommonData } from './commonData';
import StepTempalteInfo from './StepTempalteInfo';
import TaskTemplatesCards from './TaskTemplatesCards';

import { useCopyToClipboard } from '@/hooks/useCopyToClickbord';
import CustomChip from '../../common/components/CustomChip';
import { IGuidesInfo, ITaskTemplatesFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const TaskTemplatesActions = dynamic(() => import('./TaskTemplatesActions'), {
  ssr: false,
});
const TaskTemplatesFilter = dynamic(() => import('./TaskTemplatesFilter'), {
  ssr: false,
});
const HTMLModal = dynamic(() => import('@/components/default/common/modals/HTMLModal/HTMLModal'), {
  ssr: false,
});
const Modal = dynamic(() => import('@/components/default/common/modals/Modal/Modal'), {
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

export default function TaskTemplates() {
  const [view, setView] = useState('table');
  const { echo } = useContext(SocketContext);
  const queryClient = useQueryClient();
  const { isAdmin, permissions } = useAuthStore();
  const { userProfile } = useUserProfile();
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<ITaskTemplatesFilters>();
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
  const [infoModal, setInfoModal] = useState<IGuidesInfo>({
    data: { name: '', id: '' },
  } as IGuidesInfo);
  const router = useRouter();
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const [description, setDescription] = useModal();
  const [isCopy, setIsCopy] = useState(false);
  const handleClickCopy = useCopyToClipboard();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: [
      'task-templates',
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
      const response = await apiGetData(`task-templates?${searchParams}`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Task Manager', 'Task Templates', permissions),
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
    queryKey: ['task-templates-common'],
    queryFn: async () => {
      const data = await getCommonData();
      return {
        ...data,
        availabilities,
      };
    },
    refetchOnWindowFocus: false,
    placeholderData: {
      frequencies: [],
      professions: [],
      task_templates: [],
      step_templates: [],
      users: [],
      availabilities,
    },
  });
  const handleSetModal = (data: any) => {
    setInfoModal({ data: data });
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'Actions',
        headerName: '',
        maxWidth: 1,
        cellClassName: 'table-actions',
        type: 'actions',
        hide: true,
        ...config.datagrid.column,
        getActions: (params: { id: number; row: any }) => {
          const actions = [
            <GridActionsCellItem
              key='Action Profile'
              icon={<VisibilityIcon />}
              onClick={() => router.push(`/task-templates/${params.id}`)}
              label='Profile'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`task-templates/${params.id}`)}
              label='Copy'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_task_templates',
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
              permissionType: 'delete_task_templates',
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
        description: 'Name',
        disableColumnMenu: true,
        display: 'flex',
        width: 300,
        renderCell: (params: GridRenderCellParams<any, any>) => {
          const href = `task-templates/${params.id}`;
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
        field: 'parent_task_templates',
        headerName: fields?.parent_task_templates ?? 'Parent tasks',
        description: 'Parent tasks',
        disableColumnMenu: true,
        width: 150,
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
              handleSetModal={(data: any) => window.open(`/task-templates/${data.id}`)}
              sx={sx}
            />
          );
        },
      },
      {
        field: 'action',
        headerName: fields?.action_id ?? 'Action',
        disableColumnMenu: true,
        description: 'Action',
        renderCell: (params: GridRenderCellParams<any, any>) => {
          const link = `/actions/${params?.value?.id}`;
          return <NameLink href={link} name={params?.value?.name} />;
        },
        width: 250,
      },
      {
        field: 'object',
        headerName: fields?.object_id ?? 'Object',
        description: 'Object',
        disableColumnMenu: true,
        display: 'flex',
        width: 200,
        renderCell: (params: GridRenderCellParams<any, any>) => {
          const link = `/objects/${params?.value?.id}`;
          return <NameLink href={link} name={params?.value?.name} />;
        },
      },
      {
        field: 'cost',
        disableColumnMenu: true,
        headerName: fields?.cost ?? 'Cost',
        description: 'Cost',
        width: 50,
      },
      {
        field: 'task_quantity',
        disableColumnMenu: true,
        headerName: fields?.task_quantity ?? 'Task Quantity',
        description: 'Task Quantity',
        width: 50,
      },
      {
        field: 'expected_hours',
        disableColumnMenu: true,
        headerName: fields?.expected_hours ?? 'Expected Hours',
        description: 'Expected Hours',
        width: 100,
      },
      {
        field: 'frequency',
        disableColumnMenu: true,
        headerName: fields?.frequency_id ?? 'Frequency',
        description: 'Frequency',
        width: 100,
        renderCell: (params: GridRenderCellParams<any>) => params.value?.name,
      },
      {
        field: 'professions',
        headerName: fields?.professions ?? 'Professions',
        description: 'Professions',
        disableColumnMenu: true,
        width: 200,
        valueFormatter: (value: IGuideType[]) => value.map((el: { name: string }) => el.name),
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
        field: 'step_templates',
        headerName: fields?.step_templates ?? 'Step Templates',
        description: 'Step Templates',
        disableColumnMenu: true,
        width: 200,
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
        field: 'description',
        disableColumnMenu: true,
        headerName: fields?.description ?? 'Description',
        description: 'Description',
        type: 'actions',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Note value={params.value} setNote={setDescription} />
        ),
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
        width: 150,
        valueFormatter: (value: string) => dayjs(value)?.format('DD-MM-YY'),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
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
              name: 'task-templates-common',
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
      <TaskTemplatesActions
        isCopy={isCopy}
        setIsCopy={setIsCopy}
        id={actionsData.id}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <TaskTemplatesCards
            rows={rows}
            loading={isFetching}
            commonData={commonData}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            paginationModel={paginationModel}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            pagePermissions={pagePermissions}
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
            view={view}
            rows={rows}
            columns={columns}
            loading={isFetching}
            rowCount={rowCount}
            availableImport
            availableExport
            handleSortModelChange={handleSortModelChange}
            availableAdd={isAdmin || !!pagePermissions['add_task_templates']}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_task_templates']}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            pageName='Task Templates'
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <TaskTemplatesCards
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
        />
      )}
      <TaskTemplatesFilter
        rows={rows}
        commonData={commonData}
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
      />
      <Modal
        title={`Step Template: ${infoModal?.data.name}`}
        open={!!infoModal?.data.name}
        link={`/step-templates/${infoModal?.data?.id}`}
        handleClose={() => setInfoModal({ data: { name: '' } } as IGuidesInfo)}
      >
        <StepTempalteInfo data={infoModal?.data as any} />
      </Modal>
      <HTMLModal html={description} handleClose={() => setDescription('')} />
      <DeleteModal
        rows={rows}
        open={deleteModal.open}
        ids={deleteModal.ids}
        query='task-templates'
        url='task-templates'
        handleClose={handleClose}
      />
    </Stack>
  );
}
