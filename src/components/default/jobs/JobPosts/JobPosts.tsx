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
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import CustomChip from '../../common/components/CustomChip';
import CustomLink from '../../common/components/CustomLink';
import Date from '../../common/components/Date';
import FilterLink from '../../common/components/FilterLink';
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import Note from '../../common/components/Note';
import Status from '../../common/components/Status';
import Text from '../../common/components/Text';
import Translation from '../../common/components/Translation';
import UserChip from '../../common/components/UserChip';
import JobPostsCards from './JobPostsCards';
import { commonDataBlocks, getCommonData } from './commonData';
import { IJobPostsFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const JobPostActions = dynamic(() => import('./JobPostActions'), {
  ssr: false,
});
const JobPostsFilter = dynamic(() => import('./JobPostsFilter'), {
  ssr: false,
});
const HTMLModal = dynamic(() => import('@/components/default/common/modals/HTMLModal/HTMLModal'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

interface IJobPosts {
  url?: string;
}

export default function JobPosts({ url }: IJobPosts) {
  const router = useRouter();
  const [view, setView] = useState('table');
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const { echo } = useContext(SocketContext);
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
  } = useFilters<IJobPostsFilters>('job-posts');
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
  const [description, handleSetDescription] = useModal();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const handleClickCopy = useCopyToClipboard();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);
  const { isFetching, isError, data } = useQuery({
    queryKey: [
      url ?? 'job-posts',
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
        url ? `${url}?${searchParams}` : `job-posts?${searchParams}`
      );
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Jobs', 'Job Posts', permissions),
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
    queryKey: ['job-posts-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      job_accounts: [],
      accounts: [],
      users: [],
      statuses: [],
      countries: [],
      cities: [],
      job_templates: [],
      currencies: [],
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
              onClick={() => router.push(`/job-posts/${params.id}`)}
              label='Profile'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`/job-posts/${params.id}`)}
              label='Copy'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_job_posts',
              userId: userProfile?.id,
              ownerId: params.row.published_by.id,
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
            {
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
          }
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'delete_job_posts',
              userId: userProfile?.id,
              ownerId: params.row.published_by.id,
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
        minWidth: 250,
        renderCell: (params: GridRenderCellParams<any, number, string>) => {
          const href = `job-posts/${params.id}`;
          return <NameLink href={href} name={params.value} />;
        },
      },
      {
        field: 'slug',
        headerName: fields?.slug ?? 'slug',
        disableColumnMenu: true,
        description: 'slug',
        minWidth: 150,
      },
      {
        field: 'sum_jas',
        headerName: fields?.sum_jas ?? 'Sum jas',
        description: 'Sum jas',
        disableColumnMenu: true,
        width: 80,
        display: 'flex',
        align: 'center',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <FilterLink
            link={'/job-applications'}
            label={params.value}
            filterPage='job-applications'
            filterName='job-posts'
            filterValue={{
              value: [params?.row?.id],
              mode: 'standard',
            }}
          />
        ),
      },
      {
        field: 'link',
        headerName: fields?.link ?? 'Link',
        description: 'Link',
        disableColumnMenu: true,
        width: 60,
        display: 'flex',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          if (params?.value) {
            return <CustomLink link={params?.value} label='Link' />;
          }
          return null;
        },
      },
      {
        field: 'contact_accounts',
        headerName: fields?.contact_accounts ?? 'Contact Accounts',
        description: 'Contact Accounts',
        disableColumnMenu: true,
        sortable: false,
        display: 'flex',
        width: 160,
        valueFormatter: (value: { name: string }[]) => value.map((el) => el.name).join(', '),
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
        field: 'status',
        headerName: fields?.status_id ?? 'Status',
        description: 'Status',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Status name={params?.value?.name} color={params?.value?.color} />
        ),
      },
      {
        field: 'translation',
        disableColumnMenu: true,
        display: 'flex',
        headerName: fields?.translation_id ?? 'Translation',
        description: 'Translation',
        align: 'center',
        valueFormatter: (value: IStatus) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Translation text={params?.value?.iso2} />
        ),
        width: 100,
      },
      {
        field: 'country',
        headerName: fields?.country_id ?? 'Country',
        description: 'Country',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        valueFormatter: (value: { name: string }) => value?.name ?? '',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <CustomChip label={params.value?.name} data={params?.row?.country} />
        ),
      },
      {
        field: 'city',
        headerName: fields?.city_id ?? 'City',
        description: 'City',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params.value?.name} />
        ),
      },
      {
        field: 'account',
        headerName: fields?.account_id ?? 'Account',
        description: 'Account',
        display: 'flex',
        minWidth: 150,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value?.name} />
        ),
      },
      {
        field: 'job_account',
        headerName: fields?.job_account_id ?? 'Job Account',
        description: 'Job Account',
        disableColumnMenu: true,
        display: 'flex',
        width: 120,
        valueFormatter: (value: { name: string }) => value?.name ?? '',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params.value?.name} />
        ),
      },

      {
        field: 'inner_client',
        headerName: fields?.inner_client_id ?? 'Inner Client',
        description: 'Inner Client',
        disableColumnMenu: true,
        display: 'flex',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const inner_client = params.row.inner_client;
          return (
            <NameLink
              href={`/inner-clients/${inner_client?.id}`}
              name={inner_client?.name ?? ''}
              sx={{ pl: 0 }}
            />
          );
        },
        width: 150,
      },
      {
        field: 'post_template',
        headerName: fields?.post_template_id ?? 'Post Template',
        description: 'Post Template',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        valueFormatter: (value: { title: string }) => value?.title,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return (
            <NameLink
              href={`/post-templates/${params.value?.id}`}
              name={params.value?.title ?? ''}
              sx={{ pl: 0 }}
            />
          );
        },
      },
      {
        field: 'shift',
        headerName: fields?.shift_id ?? 'Shift',
        description: 'Shift',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params.value?.name} />
        ),
      },
      {
        field: 'cost',
        headerName: fields?.cost ?? 'Cost',
        disableColumnMenu: true,
        width: 70,
        display: 'flex',
        valueGetter: (params: any, row: any) => {
          return `${row?.currency?.symbol}${row?.cost}`;
        },
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value} description={params.row?.currency?.name} />
        ),
      },
      {
        field: 'full_post',
        disableColumnMenu: true,
        headerName: fields?.full_post ?? 'Full Post',
        description: 'Full Post',
        type: 'actions',
        width: 80,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Note value={params.value} setNote={handleSetDescription} />
        ),
      },

      {
        field: 'published_site',
        headerName: fields?.published_site ?? 'Published Site',
        description: 'Published Site',
        disableColumnMenu: true,
        display: 'flex',
        width: 120,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) =>
          params.value === 0 ? 'NO' : 'YES',
      },
      {
        field: 'publish_date',
        headerName: fields?.publish_date ?? 'Publish Date',
        description: 'Publish Date',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
      },
      {
        field: 'end_date',
        headerName: fields?.end_date ?? 'End Date',
        description: 'End Date',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) =>
          params.value && <Date date={params.value} />,
      },
      {
        field: 'planned_date',
        headerName: fields?.planned_date ?? 'Planned Date',
        description: 'Planned Date',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
      },
      {
        field: 'published_by',
        headerName: fields?.published_by ?? 'Published By',
        description: 'Published By',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <UserChip data={params.value} />
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
              name: 'job-posts-common',
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
      <JobPostActions
        id={actionsData.id}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
        url={url}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <JobPostsCards
            rows={rows}
            pagePermissions={pagePermissions}
            commonData={commonData}
            toggleFilters={toggleFilters}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            searchValue={searchValue}
            handleSearch={handleSearch}
            view={view}
            url={url}
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
            pageName='job posts'
            loading={isFetching}
            rowCount={rowCount}
            availableExport
            availableImport
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            availableAdd={isAdmin || !!pagePermissions['add_job_posts']}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_job_posts']}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <JobPostsCards
          rows={rows}
          pagePermissions={pagePermissions}
          commonData={commonData}
          toggleFilters={toggleFilters}
          paginationModel={paginationModel}
          handlePagination={handlePagination}
          searchValue={searchValue}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          handleSearch={handleSearch}
          url={url}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
        />
      )}
      <JobPostsFilter
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
        query='job-posts'
        url='job-posts'
        handleClose={handleClose}
      />
    </Stack>
  );
}
