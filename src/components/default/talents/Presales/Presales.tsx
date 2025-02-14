'use client';
import CustomChip from '@/components/default/common/components/CustomChip';
import Date from '@/components/default/common/components/Date';
import MoreChips from '@/components/default/common/components/MoreChips';
import NameLink from '@/components/default/common/components/NameLink';
import Status from '@/components/default/common/components/Status';
import Text from '@/components/default/common/components/Text';
import UserChip from '@/components/default/common/components/UserChip';
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
import { useGuidesStore } from '@/zustand/guidesStore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from '@mui/x-data-grid';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { MouseEvent, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import SalariesCell from '../../common/components/SalariesCell';
import EmployeeActions from '../Employees/EmployeeActions';
import PresalesCards from './PresalesCards';
import { IPresalesFilters } from './PresalesFilter';
import { commonDataBlocks, getCommonData } from './commonData';

const PresaleActions = dynamic(() => import('./PresaleActions'), {
  ssr: false,
});
const PresalesFilter = dynamic(() => import('./PresalesFilter'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

export const genders = [
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

export default function Presales() {
  const router = useRouter();
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
  } = useFilters<IPresalesFilters>();
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
  const { actionsData: actionsDataEmployee, handleActions: handleActionsEmployee } = useActions();

  const { isAdmin, permissions } = useAuthStore();
  const { userProfile } = useUserProfile();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const handleClickCopy = useCopyToClipboard();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: ['presales', { paginationModel, sortOptions, debouncedSearchValue, applyFilters }],
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
      return await apiGetData(`presales?${searchParams}`);
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Talents', 'Presales', permissions),
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
    queryKey: ['presales-common'],
    queryFn: async () => {
      const data = await getCommonData();
      return {
        ...data,
        availabilities: [
          { id: 0, name: 'No' },
          { id: 1, name: 'Yes' },
        ],
        genders,
      };
    },
    refetchOnWindowFocus: false,
    placeholderData: {
      availabilities: [],
      genders,
    },
  });

  const columns: GridColDef<IPresaleShort>[] = useMemo(
    () => [
      {
        field: 'Actions',
        headerName: '',
        type: 'actions',
        ...config.datagrid.column,
        getActions: (params: { id: number; row: any }) => {
          const actions = [
            <GridActionsCellItem
              key='Action Profile'
              icon={<VisibilityIcon />}
              onClick={() => router.push(`presales/${params.id}`)}
              label='Profile'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`presales/${params.id}`)}
              label='Copy'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action To Employee'
              onClick={() => handleActionsEmployee(true, params.id)}
              icon={<GroupIcon />}
              disabled={params?.row?.employee_url}
              label='To Employee'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_presales',
              userId: userProfile?.id,
              ownerId: params.row.talents?.created_by?.id,
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
              permissionType: 'delete_presales',
              userId: userProfile?.id,
              ownerId: params.row.talents?.created_by?.id,
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
        field: 'names',
        headerName: fields?.names ?? 'Names',
        description: 'Names',
        disableColumnMenu: true,
        width: 200,
        valueFormatter: (value: { name: string }[]) => (value.length > 0 ? value[0].name : ''),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          const names = params.value.map((item: any) => ({
            id: item.id,
            name: `${item.translation.iso3}: ${item.name}`,
            link: params.row.presale_url,
          }));

          return <MoreChips data={names} sx={sx} />;
        },
      },
      {
        field: 'user',
        headerName: fields?.user_id ?? 'User',
        description: 'User',
        disableColumnMenu: true,
        width: 125,
        renderCell: (
          params: GridRenderCellParams<
            any,
            {
              id: number;
              name: string;
              image?: string;
            },
            string
          >
        ) => {
          if (!params.value) {
            return null;
          }
          return (
            <UserChip
              data={{
                name: params.value?.name,
                id: params.value.id,
                image: params.value.image,
              }}
            />
          );
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
            params.row.job_application_url && {
              id: 4,
              name: 'Job Application',
              link: params.row.job_application_url,
              bgColor: 'warning',
            },
          ].filter(Boolean);

          return <MoreChips data={links} sx={sx} />;
        },
      },
      {
        field: 'short_name',
        headerName: fields?.short_name ?? 'Short Name',
        description: 'Short Name',
        disableColumnMenu: true,
        width: 200,
      },
      {
        field: 'slug',
        headerName: fields?.slug ?? 'Slug',
        description: 'Slug',
        disableColumnMenu: true,
        width: 100,
      },
      {
        field: 'objects',
        headerName: fields?.objects ?? 'Objects',
        description: 'Objects',
        disableColumnMenu: true,
        display: 'flex',
        width: 250,
        valueFormatter: (value: IGuideType[]) => value?.map((el: { name: string }) => el.name),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const objects = params.row?.talents?.objects;
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };

          return <MoreChips data={objects} propName='name' sx={sx} />;
        },
      },
      {
        field: 'is_student',
        headerName: fields?.is_student ?? 'Is student',
        description: 'Is student',
        disableColumnMenu: true,
        width: 150,
        valueFormatter: (value) => (value ? 'Yes' : 'No'),
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
        description: 'Gender',
        disableColumnMenu: true,
        width: 90,
      },
      {
        field: 'country',
        headerName: fields?.country_id ?? 'Country',
        disableColumnMenu: true,
        description: 'Country',
        renderCell: (params) => <CustomChip label={params.value?.name} data={params.value} />,
        display: 'flex',
        width: 125,
      },
      {
        field: 'city',
        headerName: fields?.city_id ?? 'City',
        disableColumnMenu: true,
        description: 'City',
        valueFormatter: (value: ICity) => value?.name,
        display: 'flex',
        width: 125,
      },
      {
        field: 'inner_client',
        headerName: fields?.inner_client_id ?? 'Inner Client',
        description: 'Inner Client',
        disableColumnMenu: true,
        renderCell: (params) => {
          const inner_client = params.row?.talents?.inner_client;
          return (
            <NameLink href={`/inner-clients/${inner_client?.id}`} name={inner_client?.name ?? ''} />
          );
        },
        display: 'flex',
        width: 150,
      },
      {
        field: 'status',
        headerName: fields?.status_id ?? 'Status',
        description: 'Status',
        disableColumnMenu: true,
        renderCell: (params) => {
          const status = params.row?.talents?.status;
          return <Status name={status?.name} color={status?.color} />;
        },
        display: 'flex',
        width: 125,
      },
      {
        field: 'shift',
        headerName: fields?.shift_id ?? 'Shift',
        description: 'Shift',
        disableColumnMenu: true,
        renderCell: (params) => {
          const shift = params.row?.talents?.shift;
          return <Text text={shift?.name ?? ''} />;
        },
        display: 'flex',
        width: 175,
      },
      {
        field: 'professions',
        headerName: fields?.professions ?? 'Professions',
        description: 'Professions',
        disableColumnMenu: true,
        renderCell: (params) => {
          const professions = params.row?.talents?.professions;
          return (
            <Stack display={'flex'} flexDirection={'row'} gap={'1rem'}>
              {professions.map((item) => (
                <Status key={item.id} name={item.profession.name} color={item?.priority?.color} />
              ))}
            </Stack>
          );
        },
        display: 'flex',
        width: 100,
      },
      {
        field: 'managers',
        headerName: fields?.managers ?? 'Managers',
        description: 'Managers',
        disableColumnMenu: true,
        renderCell: (params) => {
          const managers = params.row?.talents?.managers;
          return (
            <Stack display={'flex'} flexDirection={'column'}>
              {managers?.map((manager: any) => <UserChip data={manager} key={manager.id} />)}
            </Stack>
          );
        },
        display: 'flex',
        width: 100,
      },
      {
        field: 'tools',
        headerName: fields?.tools ?? 'Tools',
        description: 'Tools',
        disableColumnMenu: true,
        renderCell: (params) => {
          const tools = params.row?.talents?.tools;
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };

          return <MoreChips data={tools} sx={sx} />;
        },
        display: 'flex',
        width: 100,
      },
      {
        field: 'task_templates',
        headerName: fields?.task_templates ?? 'Task Templates',
        description: 'Task Templates',
        disableColumnMenu: true,
        renderCell: (params) => {
          const task_templates = params.row?.talents?.task_templates;
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          return (
            <Stack display={'flex'} flexDirection={'column'}>
              <MoreChips data={task_templates} sx={sx} />
            </Stack>
          );
        },
        display: 'flex',
        width: 150,
      },
      {
        field: 'rates',
        headerName: fields?.rates ?? 'Rates',
        description: 'Rates',
        disableColumnMenu: true,
        renderCell: (params) => {
          const rates = params.row?.talents?.rates;
          return (
            <Stack flexDirection={'row'} gap={'1rem'}>
              {rates.map((item: any) => (
                <Stack key={item.id} flexDirection={'column'}>
                  <Text text={`${item.rate.name}`} />
                  <Text text={`${item.shift.name}`} />
                </Stack>
              ))}
            </Stack>
          );
        },
        display: 'flex',
        width: 300,
      },
      {
        field: 'salaries',
        headerName: fields?.salaries ?? 'Salaries',
        description: 'Salaries',
        disableColumnMenu: true,
        renderCell: (params) => {
          const salaries = params.row?.talents?.salaries;
          return <SalariesCell salaries={salaries} />;
        },
        display: 'flex',
        width: 300,
      },
      {
        field: 'contract_url',
        headerName: fields?.contract_url ?? 'Contract Url',
        description: 'Contract Url',
        disableColumnMenu: true,
        renderCell: (params) => {
          if (params.row?.talents?.contract_url) {
            return (
              <NameLink
                href={params.row?.talents?.contract_url}
                name={`${params.row?.talents?.contract_url}`}
              />
            );
          }
        },
        display: 'flex',
        width: 200,
      },
      {
        field: 'prices',
        headerName: fields?.prices ?? 'Prices',
        description: 'Prices',
        disableColumnMenu: true,
        renderCell: (params) => {
          const prices = params.row?.talents?.prices;
          return (
            <Stack flexDirection={'row'} gap={'1rem'}>
              {prices.map((item) => (
                <Stack key={item.id} flexDirection={'column'}>
                  <Text text={`${item.value} ${item.currency?.iso3}`} />
                  <Typography variant={'caption'}>{item.rate?.name}</Typography>
                  <Stack key={item.id} flexDirection={'row'}></Stack>
                </Stack>
              ))}
            </Stack>
          );
        },
        display: 'flex',
        width: 200,
      },
      {
        field: 'links',
        headerName: fields?.links ?? 'Links',
        disableColumnMenu: true,
        description: 'Links',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const links = params.row?.talents?.links;
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          return links && <MoreChips data={links} sx={sx} />;
        },
        width: 150,
      },
      {
        field: 'created_at',
        headerName: fields?.created_at ?? 'Created At',
        description: 'Created At',
        disableColumnMenu: true,
        display: 'flex',
        minWidth: 140,
        renderCell: (params) => <Date date={params.row.talents.created_at} />,
      },
      {
        field: 'created_by',
        headerName: fields?.created_by ?? 'Created By',
        description: 'Created By',
        disableColumnMenu: true,
        minWidth: 140,
        renderCell: (params) => {
          if (params.row.talents.created_by === null) {
            return null;
          }
          return <UserChip data={params.row.talents.created_by!} />;
        },
      },
    ],
    [fields, pagePermissions, isAdmin]
  );

  const handleChangeView = (_: MouseEvent<HTMLElement>, newView: string) => {
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
            name: 'presales-common',
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
      <PresaleActions
        id={actionsData.id}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      <EmployeeActions
        {...actionsDataEmployee}
        queryKey='presales'
        commonData={{}}
        isFromPresales
        handleActions={handleActionsEmployee}
      />
      {view === 'table' &&
        (mdDown ? (
          <PresalesCards
            rows={rows}
            commonData={commonData}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            toggleFilters={toggleFilters}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            searchValue={searchValue}
            handleSearch={handleSearch}
            pagePermissions={pagePermissions}
            view={view}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            handleActionsEmployee={handleActionsEmployee}
            isSmall
          />
        ) : (
          <CustomTable
            view={view}
            availableExport
            rows={rows}
            columns={columns}
            pageName='Presales'
            loading={isFetching}
            rowCount={rowCount}
            availableAdd={isAdmin || !!pagePermissions['add_presales']}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_presales']}
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
        <PresalesCards
          rows={rows}
          loading={isFetching}
          commonData={commonData}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          toggleFilters={toggleFilters}
          searchValue={searchValue}
          paginationModel={paginationModel}
          handlePagination={handlePagination}
          handleSearch={handleSearch}
          pagePermissions={pagePermissions}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
          handleActionsEmployee={handleActionsEmployee}
        />
      )}
      <PresalesFilter
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
        query='presales'
        url='presales'
        handleClose={handleClose}
      />
    </Stack>
  );
}
