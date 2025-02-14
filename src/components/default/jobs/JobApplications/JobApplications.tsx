'use client';
import Date from '@/components/default/common/components/Date';
import NameLink from '@/components/default/common/components/NameLink';
import Note from '@/components/default/common/components/Note';
import Status from '@/components/default/common/components/Status';
import Text from '@/components/default/common/components/Text';
import UserChip from '@/components/default/common/components/UserChip';
import CustomTable from '@/components/default/common/tables/CustomTable';
import CandidateActions from '@/components/default/talents/Candidates/CandidateActions';
import EmployeeActions from '@/components/default/talents/Employees/EmployeeActions';
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
import GroupIcon from '@mui/icons-material/Group';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Chip, Stack, Theme, useMediaQuery } from '@mui/material';
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
import MoreChips from '../../common/components/MoreChips';
import PresaleActions from '../../talents/Presales/PresaleActions';
import JobApplicationsCards from './JobApplicationsCards';
import { commonDataBlocks, getCommonData } from './commonData';
import { IJobApplicationsFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const JobApplicationActions = dynamic(() => import('./JobApplicationActions'), {
  ssr: false,
});
const JobApplicationsFilter = dynamic(() => import('./JobApplicationsFilter'), {
  ssr: false,
});
const HTMLModal = dynamic(() => import('@/components/default/common/modals/HTMLModal/HTMLModal'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

const genders = [
  {
    id: 'unknown',
    name: 'Unknown',
  },
  {
    id: 'male',
    name: 'Male',
  },
  {
    id: 'female',
    name: 'Female',
  },
];

const talent = [
  {
    id: 1,
    name: 'NO',
  },
  {
    id: 2,
    name: 'YES',
  },
];

export default function JobApplications() {
  const router = useRouter();
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const { echo } = useContext(SocketContext);
  const [view, setView] = useState('table');
  const [note, setNote] = useState('');
  const handleClickCopy = useCopyToClipboard();

  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IJobApplicationsFilters>('job-applications');
  const {
    paginationModel,
    rowCount,
    handleRowCount,
    handlePagination,
    checkPagination,
    defaultPagination,
  } = usePagination();
  const { isAdmin, permissions } = useAuthStore();
  const { searchValue, debouncedSearchValue, handleSearch, clearSearch } = useSearch();
  const { actionsData, deleteModal, handleActions, handleDeleteModal, handleClose } = useActions();
  const { actionsData: actionsDataCandidate, handleActions: handleActionsCandidate } = useActions();
  const { actionsData: actionsDataEmployee, handleActions: handleActionsEmployee } = useActions();
  const { actionsData: actionsDataPresale, handleActions: handleActionsPresale } = useActions();
  const { userProfile } = useUserProfile();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const queryClient = useQueryClient();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: [
      'job-applications',
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
      const response = await apiGetData(`job-applications?${searchParams}`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Jobs', 'Job Applications', permissions),
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
    queryKey: ['job-applications-common'],
    queryFn: async () => {
      const data = await getCommonData();
      return { ...data, genders, talent };
    },
    refetchOnWindowFocus: false,
    placeholderData: {
      countries: [],
      cities: [],
      users: [],
      statuses: [],
      job_posts: [],
      job_requests: [],
      accounts: [],
      communication_types: [],
      job_templates: [],
      tools: [],
      genders,
      messages: [],
      talent,
    },
  });

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'Actions',
        headerName: '',
        type: 'actions',
        ...config.datagrid.column,
        getActions: (params: { id: number; row: any }) => {
          const isTransfer =
            params?.row?.candidate_url || params?.row?.employee_url || params?.row?.presale_url;
          const actions = [
            <GridActionsCellItem
              key='Action Profile'
              icon={<VisibilityIcon />}
              onClick={() => router.push(`/job-applications/${params.id}`)}
              label='Profile'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action To Candidates'
              onClick={() => handleActionsCandidate(true, params.id)}
              icon={<GroupIcon />}
              disabled={isTransfer}
              label='To Candidates'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action To Employee'
              onClick={() => handleActionsEmployee(true, params.id)}
              icon={<GroupIcon />}
              disabled={isTransfer}
              label='To Employee'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action To Presales'
              onClick={() => handleActionsPresale(true, params.id)}
              icon={<GroupIcon />}
              disabled={isTransfer}
              label='To Presale'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`job-applications/${params.id}`)}
              label='Copy'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_job_applications',
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
            !isTransfer &&
            checkPermission({
              pagePermissions,
              permissionType: 'delete_job_applications',
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
        width: 300,
        display: 'flex',
        valueFormatter: (value: string) => value,
        renderCell: (params: GridRenderCellParams<any, number, string>) => {
          const href = `job-applications/${params.id}`;
          return <NameLink href={href} name={params.value} />;
        },
      },
      {
        field: 'links_to_profile',
        headerName: fields?.links_to_profile ?? 'Links to profile',
        description: 'Links to profile',
        disableColumnMenu: true,
        width: 200,
        valueFormatter: (value: { name: string }[]) => (value?.length > 0 ? value[0].name : ''),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          const links = [
            params.row.employee_url && {
              id: 1,
              name: 'Employee',
              link: params.row.employee_url,
              bgColor: 'secondary',
            },
            params.row.candidate_url && {
              id: 2,
              name: 'Candidate',
              link: params.row.candidate_url,
              bgColor: 'primary',
            },
            params.row.presale_url && {
              id: 3,
              name: 'Presale',
              link: params.row.presale_url,
              bgColor: 'error',
            },
          ].filter(Boolean);

          return <MoreChips data={links} sx={sx} />;
        },
      },
      {
        field: 'country',
        headerName: fields?.country_id ?? 'Country',
        disableColumnMenu: true,
        description: 'Country',
        valueFormatter: (value: ICountry) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <CustomChip label={params?.value?.name} data={params?.value} />
        ),
        display: 'flex',
        width: 150,
      },
      {
        field: 'city',
        headerName: fields?.city_id ?? 'City',
        disableColumnMenu: true,
        description: 'City',
        valueFormatter: (value: ICity) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value?.name} />
        ),
        display: 'flex',
        width: 100,
      },
      {
        field: 'birthday',
        headerName: fields?.birthday ?? 'Birthday',
        description: 'Birthday',
        disableColumnMenu: true,
        width: 140,
        align: 'center',
        display: 'flex',
        renderCell: (params) => <Date date={params.value} />,
      },
      {
        field: 'age',
        headerName: fields?.age ?? 'Age',
        description: 'Age',
        disableColumnMenu: true,
        width: 50,
        align: 'center',
      },
      {
        field: 'gender',
        headerName: fields?.gender ?? 'Gender',
        disableColumnMenu: true,
        description: 'Gender',
        align: 'center',
        valueFormatter: (value: string) => value,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value} />
        ),
        display: 'flex',
        width: 100,
      },
      {
        field: 'status',
        disableColumnMenu: true,
        headerName: fields?.status_id ?? 'Status',
        width: 200,
        description: 'Status',
        valueFormatter: (value: IStatus) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Status name={params?.value?.name} color={params?.value?.color} />
        ),
      },
      {
        field: 'communications',
        headerName: fields?.ja_communications ?? 'JA Communications',
        disableColumnMenu: true,
        valueFormatter: (value: IUser) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const data = params?.value?.map((el: any) => el?.communication_type);
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          return <MoreChips data={data} sx={sx} />;
        },
        description: 'Manager',
        display: 'flex',
        width: 150,
      },
      {
        field: 'contacts',
        headerName: fields?.contacts ?? 'Contacts',
        disableColumnMenu: true,
        valueFormatter: (value: IUser) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          console.log('params', params?.value);
          const data = params?.value?.map((el: any) => el?.tool);
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          return <MoreChips data={data} sx={sx} />;
        },
        description: 'Manager',
        display: 'flex',
        width: 150,
      },
      {
        field: 'manager',
        headerName: fields?.manager_id ?? 'Manager',
        disableColumnMenu: true,
        valueFormatter: (value: IUser) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <UserChip data={params?.value} />
        ),
        description: 'Manager',
        display: 'flex',
        width: 150,
      },
      {
        field: 'is_talent',
        headerName: fields?.is_talent ?? 'Is Talent',
        disableColumnMenu: true,
        description: 'Is Talent',
        valueFormatter: (value: number) => (value ? 'Yes' : 'No'),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value ? 'Yes' : 'No'} />
        ),
        display: 'flex',
        align: 'center',
        width: 100,
      },
      {
        field: 'sources',
        headerName: fields?.sources ?? 'Sources',
        description: 'Sources',
        disableColumnMenu: true,
        sortable: false,
        display: 'flex',
        width: 150,
        valueFormatter: (value: string[]) => value?.map((el) => ({ name: el })),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          if (params.value?.length > 0) {
            const data = params.value.map((el: string, i: number) => ({ name: el, id: i }));

            return <MoreChips data={data} propName='name' sx={sx} />;
          }
          return null;
        },
      },
      {
        field: 'professions',
        headerName: fields?.professions ?? 'Professions',
        description: 'Professions',
        disableColumnMenu: true,
        sortable: false,
        display: 'flex',
        width: 150,
        valueFormatter: (value: string[]) => value?.map((el) => ({ name: el })),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          if (params.value.length > 0) {
            return <MoreChips data={params.value} propName='name' sx={sx} />;
          }
          return null;
        },
      },
      {
        field: 'tools',
        headerName: fields?.tools ?? 'Tools',
        description: 'Tools',
        disableColumnMenu: true,
        sortable: false,
        display: 'flex',
        width: 150,
        valueFormatter: (value: string[]) => value?.map((el) => ({ name: el })),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const tools = params?.row.contacts?.map((el: any) => el?.tool);
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          if (tools?.length > 0) {
            return <MoreChips data={tools} propName='name' sx={sx} />;
          }
          return null;
        },
      },
      {
        field: 'job_posts',
        headerName: fields?.job_posts ?? 'Job Posts',
        description: 'Job Posts',
        disableColumnMenu: true,
        sortable: false,
        display: 'flex',
        width: 150,
        valueFormatter: (value: string[]) => value?.map((el) => ({ name: el })),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const job_posts = params?.row?.job_posts;
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          if (job_posts?.length > 0) {
            return <MoreChips data={job_posts} propName='name' sx={sx} />;
          }
          return null;
        },
      },
      {
        field: 'job_requests',
        headerName: fields?.job_requests ?? 'Job Requests',
        description: 'Job Requests',
        disableColumnMenu: true,
        sortable: false,
        display: 'flex',
        width: 150,
        valueFormatter: (value: string[]) => value?.map((el) => ({ name: el })),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const job_requests = params?.row?.job_requests;
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          if (job_requests?.length > 0) {
            return <MoreChips data={job_requests} propName='name' sx={sx} />;
          }
          return null;
        },
      },
      {
        field: 'created_by',
        disableColumnMenu: true,
        headerName: fields?.created_by ?? 'Created By',
        description: 'Created By',
        valueFormatter: (value: IUser) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value !== null ? <UserChip data={params?.value} /> : null;
        },
        width: 150,
      },
      {
        field: 'created_at',
        disableColumnMenu: true,
        headerName: fields?.created_at ?? 'Created At',
        description: 'Created At',
        valueFormatter: (value: string) => dayjs(value)?.format('DD-MM-YY'),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
        display: 'flex',
        width: 150,
      },
      {
        field: 'notes',
        disableColumnMenu: true,
        headerName: fields?.notes ?? 'Notes',
        description: 'Notes',
        type: 'actions',
        width: 100,
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
      echo.channel(`common-data`).listen('CommonDataChanged', (data: any) => {
        const { key } = data;
        const basicValue = commonDataBlocks[key as keyof typeof commonDataBlocks];
        const commonDataReq = { [key]: basicValue };
        // const commonDataReq = getCommonDataReq(key, commonDataBlocks);
        if (commonDataReq) {
          updateCommondData({
            name: 'job-applications-common',
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
      <JobApplicationActions
        id={actionsData.id}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      <CandidateActions
        {...actionsDataCandidate}
        commonData={{}}
        isFromJobApplications
        handleActions={handleActionsCandidate}
      />
      <PresaleActions
        {...actionsDataPresale}
        commonData={{}}
        isFromJobApplications
        handleActions={handleActionsPresale}
      />
      <EmployeeActions
        {...actionsDataEmployee}
        commonData={{}}
        isFromJobApplications
        handleActions={handleActionsEmployee}
      />
      {view === 'table' &&
        (mdDown ? (
          <JobApplicationsCards
            rows={rows}
            commonData={commonData}
            toggleFilters={toggleFilters}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            searchValue={searchValue}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            handleSearch={handleSearch}
            pagePermissions={pagePermissions}
            view={view}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            handleActionsCandidate={handleActionsCandidate}
            handleActionsEmployee={handleActionsEmployee}
            handleActionsPresale={handleActionsPresale}
            isSmall
          />
        ) : (
          <CustomTable
            view={view}
            rows={rows}
            columns={columns}
            pageName='Job Applications'
            loading={isFetching}
            rowCount={rowCount}
            availableAdd={isAdmin || !!pagePermissions['add_job_applications']}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_job_applications']}
            availableExport
            availableImport
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
        <JobApplicationsCards
          rows={rows}
          pagePermissions={pagePermissions}
          loading={isFetching}
          commonData={commonData}
          toggleFilters={toggleFilters}
          searchValue={searchValue}
          paginationModel={paginationModel}
          handlePagination={handlePagination}
          handleSearch={handleSearch}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
          handleActionsCandidate={handleActionsCandidate}
          handleActionsEmployee={handleActionsEmployee}
          handleActionsPresale={handleActionsPresale}
        />
      )}
      <JobApplicationsFilter
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
        query='job-applications'
        url='job-applications'
        handleClose={handleClose}
      />
    </Stack>
  );
}
