'use client';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import { SocketContext } from '@/contexts/socketContext';
import useActions from '@/hooks/useActions';
import { useCopyToClipboard } from '@/hooks/useCopyToClickbord';
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
import CustomChip from '../../common/components/CustomChip';
import Date from '../../common/components/Date';
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import Note from '../../common/components/Note';
import Text from '../../common/components/Text';
import UserChip from '../../common/components/UserChip';
import GuidesInfo from '../components/GuidesInfo';
import { commonDataBlocks, getCommonData } from './commonData';
import StepTemplatesCards from './StepTemplatesCards';
import { IGuidesInfo, IStepTemplatesFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const StepTemplatesActions = dynamic(() => import('./StepTemplatesActions'), {
  ssr: false,
});
const ChecklistItemsCards = dynamic(() => import('./StepTemplatesCards'), {
  ssr: false,
});
const HTMLModal = dynamic(() => import('@/components/default/common/modals/HTMLModal/HTMLModal'), {
  ssr: false,
});
const StepTemplatesFilter = dynamic(() => import('./StepTemplatesFilter'), {
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

export default function StepTemplates() {
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
  } = useFilters<IStepTemplatesFilters>();
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
  const [infoModal, setInfoModal] = useState<IGuidesInfo>({ name: '', guides: [] });
  const router = useRouter();
  const [description, setDescription] = useModal();
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const handleClickCopy = useCopyToClipboard();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: [
      'step-templates',
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
      const response = await apiGetData(`step-templates?${searchParams}`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Task Manager', 'Step Templates', permissions),
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
    queryKey: ['step-templates-common'],
    queryFn: async () => {
      const data = await getCommonData();
      return {
        ...data,
        availabilities,
      };
    },
    refetchOnWindowFocus: false,
    placeholderData: {
      checklist_items: [],
      guides: [],
      tools: [],
      availabilities,
    },
  });
  const handleSetModal = (data: IGuidesInfo) => {
    setInfoModal({ guides: data.guides, name: data.name, id: data.id });
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'Actions',
        headerName: '',
        cellClassName: 'table-actions',
        type: 'actions',
        ...config.datagrid.column,
        getActions: (params: { id: number; row: any }) => {
          const actions = [
            <GridActionsCellItem
              key='Action Profile'
              icon={<VisibilityIcon />}
              onClick={() => router.push(`/step-templates/${params.id}`)}
              label='Profile'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`/step-templates/${params.id}`)}
              label='Copy'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_step_templates',
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
              permissionType: 'delete_step_templates',
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
          const href = `step-templates/${params.id}`;
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
        field: 'hours_planned',
        headerName: fields?.hours_planned ?? 'Hours Planned',
        description: 'Hours Planned',
        disableColumnMenu: true,
        display: 'flex',
        width: 140,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value} />
        ),
      },
      {
        field: 'checklist_items',
        headerName: fields?.checklist_items ?? 'Checklist items',
        description: 'Checklist items',
        disableColumnMenu: true,
        display: 'flex',
        width: 450,
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
        width: 200,
        valueFormatter: (value: string) => dayjs(value)?.format('DD-MM-YY'),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
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
              name: 'step-templates-common',
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
      <StepTemplatesActions
        id={actionsData.id}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
        handleSetModal={handleSetModal}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
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
            availableAdd={isAdmin || !!pagePermissions['add_step_templates']}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_step_templates']}
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            pageName='Step Templates'
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <StepTemplatesCards
          rows={rows}
          loading={isFetching}
          commonData={commonData}
          toggleFilters={toggleFilters}
          searchValue={searchValue}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          paginationModel={paginationModel}
          pagePermissions={pagePermissions}
          handlePagination={handlePagination}
          handleSearch={handleSearch}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
        />
      )}
      <StepTemplatesFilter
        rows={rows}
        commonData={commonData}
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
      />
      <Modal
        title={`Checklict Item: ${infoModal.name}`}
        link={`/checklist-items/${infoModal.id}`}
        open={!!infoModal.name}
        handleClose={() => setInfoModal({ name: '', guides: [] })}
      >
        <GuidesInfo guides={infoModal.guides} />
      </Modal>
      <HTMLModal html={description} handleClose={() => setDescription('')} />
      <DeleteModal
        rows={rows}
        open={deleteModal.open}
        ids={deleteModal.ids}
        query='step-templates'
        url='step-templates'
        handleClose={handleClose}
      />
    </Stack>
  );
}
