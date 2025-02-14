'use client';
import Note from '@/components/default/common/components/Note';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import useActions from '@/hooks/useActions';
import { useCopyToClipboard } from '@/hooks/useCopyToClickbord';
import useFilters from '@/hooks/useFilters';
import useModal from '@/hooks/useModal';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import { apiGetData } from '@/lib/fetch';
import { checkPermission, getAppSearchParams, getPagePermissions } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import { useAuthStore } from '@/zustand/authStore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Chip, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from '@mui/x-data-grid';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Date from '../../common/components/Date';
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import Status from '../../common/components/Status';
import UserChip from '../../common/components/UserChip';
import HTMLModal from '../../common/modals/HTMLModal/HTMLModal';
import { getCommonData } from './commonData';
import PostTemplatesCards from './PostTemplatesCards';
import { IPostTemplatesFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const PostTemplatesActions = dynamic(() => import('./PostTemplatesActions'), {
  ssr: false,
});
const PostTemplatesFilter = dynamic(() => import('./PostTemplatesFilter'), {
  ssr: false,
});

const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

export default function PostTemplates() {
  const [view, setView] = useState('table');
  const dispatch = useDispatch();
  const { isAdmin, permissions } = useAuthStore();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IPostTemplatesFilters>();
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
  const [note, handleSetNote] = useModal();
  const router = useRouter();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);
  const handleClickCopy = useCopyToClipboard();
  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);
  const { isFetching, isError, data } = useQuery({
    queryKey: [
      'post-templates',
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
      const response = await apiGetData(`post-templates?${searchParams}`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Jobs', 'Post Templates', permissions),
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
    queryKey: ['post-templates-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      task_templates: [],
    },
  });

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
              onClick={() => router.push(`/post-templates/${params.id}`)}
              label='Profile'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`/post-templates/${params.id}`)}
              label='Copy'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_post_templates',
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
              permissionType: 'delete_post_templates',
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
        field: 'title',
        headerName: fields?.title ?? 'Title',
        display: 'flex',
        description: 'Title',
        width: 200,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams<any, number, string>) => {
          const href = `post-templates/${params.id}`;
          return <NameLink href={href} name={params.value} sx={{ pl: 0 }} />;
        },
      },
      {
        field: 'status',
        headerName: fields?.status_id ?? 'Status',
        description: 'Status',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Status name={params?.value?.name} color={params?.value?.color} />
        ),
      },
      // {
      //   field: 'full_post_template',
      //   headerName: 'Full Post Template',
      //   display: 'flex',
      //   description: 'Full Post Template',
      //   width: 200,
      //   disableColumnMenu: true,
      // },
      {
        field: 'job_template',
        headerName: fields?.job_template_id ?? 'Job Template',
        disableColumnMenu: true,
        description: 'Job Template',
        width: 200,
        renderCell: (params: GridRenderCellParams<any>) => {
          if (params.value) {
            const href = `job-templates/${params.value.id}`;
            return <NameLink href={href} name={params.value.title} sx={{ pl: 0 }} />;
          }
          return null;
        },
        display: 'flex',
      },
      {
        field: 'destination',
        headerName: fields?.destination_id ?? 'Destination',
        display: 'flex',
        description: 'Destination',
        width: 150,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams<any>) => (
          <Typography sx={{ textTransform: 'capitalize', fontSize: '14px' }}>
            {params?.value.replace(/_/g, ' ')}
          </Typography>
        ),
      },

      {
        field: 'translation',
        headerName: fields?.translation_id ?? 'Translation',
        description: 'Translation',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) =>
          params?.value?.name,
      },
      {
        field: 'languages',
        headerName: fields?.languages ?? 'Languages',
        disableColumnMenu: true,
        description: 'Languages',
        width: 150,
        display: 'flex',
        valueFormatter: (value: ITool[]) =>
          value?.map((el: { name: string }) => el.name).join(', '),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          return <MoreChips data={params.value ? params.value : []} propName='iso2' sx={sx} />;
        },
      },
      {
        field: 'profession',
        headerName: fields?.profession_id ?? 'Profession',
        description: 'Profession',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          if (params.value?.name) {
            return <Chip label={params.value?.name} />;
          }
          return null;
        },
      },
      {
        field: 'similar_profession',
        headerName: fields?.similar_profession_id ?? 'Similar Profession',
        description: 'Similar Profession',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        valueFormatter: (params: any) => params?.name,

        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          if (params.value) {
            return <Chip label={params.value?.name} />;
          }

          return null;
        },
      },
      {
        field: 'shift',
        headerName: fields?.shift_id ?? 'Shift',
        description: 'Shift',
        disableColumnMenu: true,
        display: 'flex',
        width: 190,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) =>
          params?.value?.name,
      },
      {
        field: 'job_template_tools',
        headerName: fields?.tools ?? 'Tools (Job Template)',
        disableColumnMenu: true,
        description: 'Tools (Job Template)',
        width: 200,
        display: 'flex',
        valueFormatter: (value: ITool[]) =>
          value?.map((el: { name: string }) => el.name).join(', '),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          return <MoreChips data={params.value ? params.value : []} propName='name' sx={sx} />;
        },
      },
      {
        field: 'task_templates',
        headerName: fields?.task_templates ?? 'Task Templates',
        disableColumnMenu: true,
        description: 'Task Templates',
        width: 200,
        display: 'flex',
        valueFormatter: (value: ITool[]) =>
          value?.map((el: { name: string }) => el.name).join(', '),
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
        field: 'role_overview',
        disableColumnMenu: true,
        headerName: fields?.role_overview ?? 'Role overview',
        description: 'Role overview',
        type: 'actions',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Note value={params.value} setNote={handleSetNote} />
        ),
      },
      {
        field: 'full_post_template',
        disableColumnMenu: true,
        headerName: fields?.full_post_template ?? 'Full Post Template',
        description: 'Full Post Template',
        width: 150,
        type: 'actions',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Note value={params.value} setNote={handleSetNote} />
        ),
      },
      {
        field: 'prompt',
        disableColumnMenu: true,
        headerName: fields?.prompt ?? 'Prompt',
        description: 'Prompt',
        type: 'actions',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Note value={params.value} setNote={handleSetNote} />
        ),
      },
      {
        field: 'created_at',
        disableColumnMenu: true,
        headerName: fields?.created_at ?? 'Created At',
        description: 'Created At',
        width: 150,
        display: 'flex',
        valueFormatter: (value: string) => dayjs(value)?.format('DD-MM-YY'),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
      },
      {
        field: 'created_by',
        disableColumnMenu: true,
        headerName: fields?.created_by ?? 'Created By',
        description: 'Created By',
        width: 150,
        display: 'flex',
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value !== null ? <UserChip data={params?.value} /> : null;
        },
      },
    ],
    [fields, pagePermissions, isAdmin]
  );

  const handleChangeView = (_: React.MouseEvent<HTMLElement>, newView: string) => {
    if (newView !== null) {
      clearSearch();
      clearSort();
      defaultPagination();
      setView((prev) => newView ?? prev);
    }
  };

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
      <PostTemplatesActions
        commonData={commonData}
        id={actionsData.id}
        visible={actionsData.visible}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <PostTemplatesCards
            rows={rows}
            loading={isFetching}
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
            pageName='Post Templates'
            loading={isFetching}
            rowCount={rowCount}
            availableImport
            availableExport
            handleSortModelChange={handleSortModelChange}
            availableAdd={isAdmin || !!pagePermissions['add_post_templates']}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_post_templates']}
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
        <PostTemplatesCards
          rows={rows}
          loading={isFetching}
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
        />
      )}
      <PostTemplatesFilter
        rows={rows}
        commonData={commonData}
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
      />
      <HTMLModal html={note} handleClose={() => handleSetNote('')} />
      <DeleteModal
        rows={rows}
        open={deleteModal.open}
        ids={deleteModal.ids}
        query='post-templates'
        url='post-templates'
        handleClose={handleClose}
      />
    </Stack>
  );
}
