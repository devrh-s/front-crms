'use client';
import Status from '@/components/default/common/components/Status';
import UserChip from '@/components/default/common/components/UserChip';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import useActions from '@/hooks/useActions';
import { useCopyToClipboard } from '@/hooks/useCopyToClickbord';
import usePagination from '@/hooks/usePagination';
import { apiGetData } from '@/lib/fetch';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Stack, Theme, useMediaQuery } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from '@mui/x-data-grid';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import Date from '../../../../common/components/Date';
import Text from '../../../../common/components/Text';
import ProgressCards from './ProgressCards';

interface IProgressProps {
  id: number;
  value: string;
  index: string;
  commonData: ICommonData;
}

const ProgressActions = dynamic(() => import('./ProgressActions'), {
  ssr: false,
});

const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

export default function Progress({ value, index, id, commonData }: IProgressProps) {
  const [view, setView] = useState('table');
  const { actionsData, deleteModal, handleActions, handleDeleteModal, handleClose } = useActions();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const handleClickCopy = useCopyToClipboard();
  const { paginationModel, rowCount, handleRowCount, handlePagination, defaultPagination } =
    usePagination();

  const { isFetching, isError, data } = useQuery({
    queryKey: ['progress', { paginationModel }],
    queryFn: async () => {
      const response = await apiGetData(`edits/${id}/progress`);
      return response;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });
  const {
    data: rows,
    meta,
    fields,
  } = useMemo(() => {
    if (data) return data;
    return {
      data: [],
      meta: {},
      fields: {},
    };
  }, [data]);

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
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`edit-progress/${params.id}`)}
              label='Copy'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Edit'
              icon={<EditIcon />}
              onClick={() => handleActions(true, params.id)}
              label='Edit'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Delete'
              onClick={() => {
                handleDeleteModal(true, [params.id]);
              }}
              icon={<DeleteIcon />}
              label='Delete'
              showInMenu
            />,
          ];

          return actions;
        },
      },
      {
        field: 'id',
        headerName: 'ID',
        ...config.datagrid.column,
      },
      {
        field: 'type',
        headerName: fields?.type_id ?? 'Type',
        disableColumnMenu: true,
        description: 'Type',
        display: 'flex',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return <Text text={params?.value} />;
        },
        width: 200,
      },
      {
        field: 'entity_block',
        headerName: fields?.entity_block_id ?? 'Entity Block',
        disableColumnMenu: true,
        description: 'Entity Block',
        display: 'flex',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return <Text text={params?.value?.name} />;
        },
        width: 200,
      },
      {
        field: 'status',
        headerName: fields?.status_id ?? 'Status',
        description: 'Status',
        disableColumnMenu: true,
        type: 'actions',
        width: 200,
        renderCell: (params: GridRenderCellParams<any>) => {
          return <Status name={params.value?.name} color={params.value?.color} />;
        },
      },
      {
        field: 'done',
        headerName: fields?.done ?? 'Done',
        disableColumnMenu: true,
        description: 'Done',
        display: 'flex',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return <Text text={params?.value ? 'Yes' : 'No'} />;
        },
        width: 100,
      },
      {
        field: 'completed_at',
        disableColumnMenu: true,
        headerName: fields?.completed_at ?? 'Completed At',
        description: 'Completed At',
        display: 'flex',
        width: 250,
        valueFormatter: (value: string) => dayjs(value)?.format('DD-MM-YY'),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params?.value} />
        ),
      },
      {
        field: 'created_by',
        disableColumnMenu: true,
        headerName: fields?.created_by ?? 'Created By',
        description: 'Created By',
        display: 'flex',
        width: 250,
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
        width: 250,
        valueFormatter: (value: string) => dayjs(value)?.format('DD-MM-YY'),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params?.value} />
        ),
      },
    ],
    [fields]
  );

  const handleChangeView = (_: React.MouseEvent<HTMLElement>, newView: string) => {
    defaultPagination();
    setView((prev) => newView ?? prev);
  };

  useEffect(() => {
    if (meta?.total) {
      handleRowCount(meta?.total);
    }
  }, [meta]);

  return (
    value === index && (
      <Stack gap='2rem'>
        <ProgressActions
          commonData={commonData}
          id={actionsData.id}
          profile_id={id}
          handleActions={handleActions}
          visible={actionsData.visible}
        />
        {view === 'table' &&
          (mdDown ? (
            <ProgressCards
              rows={rows}
              loading={isFetching}
              view={view}
              handleChangeView={handleChangeView}
              handleDeleteModal={handleDeleteModal}
              handleActions={handleActions}
              isSmall
            />
          ) : (
            <CustomTable
              rows={rows}
              loading={isFetching}
              columns={columns}
              pageName='Progress'
              availableAdd={false}
              multiDeletePermission
              rowHeight={config.datagrid.rowHeight}
              handleChangeView={handleChangeView}
              paginationModel={paginationModel}
              handlePagination={handlePagination}
              handleDeleteModal={handleDeleteModal}
              rowCount={rowCount}
              hideToolbarFilters
              hideToolbarSearch
            />
          ))}
        {view === 'cards' && (
          <ProgressCards
            rows={rows}
            loading={isFetching}
            view={view}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
          />
        )}
        <DeleteModal
          rows={rows}
          open={deleteModal.open}
          ids={deleteModal.ids}
          query='progress'
          url='edit-progress'
          handleClose={handleClose}
        />
      </Stack>
    )
  );
}
