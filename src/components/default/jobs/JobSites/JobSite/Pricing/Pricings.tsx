'use client';
import Date from '@/components/default/common/components/Date';
import Text from '@/components/default/common/components/Text';
import UserChip from '@/components/default/common/components/UserChip';
import DeleteModal from '@/components/default/common/modals/DeleteModal/DeleteModal';
import JSONModal from '@/components/default/common/modals/JSONModal/JSONModal';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import { SocketContext } from '@/contexts/socketContext';
import useActions from '@/hooks/useActions';
import useFilters from '@/hooks/useFilters';
import useNotification from '@/hooks/useNotification';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import { apiCommonData, apiGetData, updateCommondData } from '@/lib/fetch';
import { getAppSearchParams, getCommonDataReq } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Stack, Theme, useMediaQuery } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from '@mui/x-data-grid';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import PricingActions from './PricingActions';
import PricingsCards from './PricingsCards';
import PricingsFilter from './PricingsFilter';
import { IPricingsFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

interface IPricingsProps {
  id: number;
  index: string;
  value: string;
}

const commonDataBlocks = {
  currencies: 'currencies?perPage=-1&isShort=1&isCommon=1',
  pricings: 'pricing-types?perPage=-1&isShort=1&isCommon=1',
  users: 'users?perPage=-1&isShort=1&isCommon=1',
};

const getCommonData = () => apiCommonData(commonDataBlocks);

export default function Pricings({ id, index, value }: IPricingsProps) {
  const [view, setView] = useState('table');
  const [description, setDescription] = useState('');
  const { echo } = useContext(SocketContext);
  const queryClient = useQueryClient();
  const showNotification = useNotification();
  const { actionsData, deleteModal, handleActions, handleDeleteModal, handleClose } = useActions();
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IPricingsFilters>();
  const {
    paginationModel,
    rowCount,
    handleRowCount,
    handlePagination,
    checkPagination,
    defaultPagination,
  } = usePagination();
  const { searchValue, debouncedSearchValue, handleSearch, clearSearch } = useSearch();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);

  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: ['pricings', { paginationModel, sortOptions, debouncedSearchValue, applyFilters }],
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
      const response = await apiGetData(`job-sites/${id}/pricings?${searchParams}`);
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
  }, [data, index]);

  const handleClickCopy = async (pricingId: number) => {
    try {
      const response = await queryClient.fetchQuery({
        queryKey: ['pricings', pricingId],
        queryFn: async () => {
          const response = await apiGetData(`/job-sites/${id}/pricings/${pricingId}`);
          return response.data;
        },
      });

      const json = JSON.stringify(response, null, 2);
      await navigator.clipboard.writeText(json);

      showNotification('Row copied to clipboard!', 'success');
    } catch (err) {
      showNotification(`Failed to copy row: ${err}`, 'error');
    }
  };

  const { data: commonData } = useQuery({
    queryKey: ['pricings-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      currencies: [],
      pricings: [],
    },
  });

  const changeDescription = (newDescription: string) => setDescription(newDescription);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'Actions',
        headerName: '',
        ...config.datagrid.column,
        type: 'actions',
        getActions: (params: { id: number }) => [
          <GridActionsCellItem
            key='Action Copy'
            icon={<ContentCopyIcon />}
            onClick={() => handleClickCopy(params.id)}
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
            key='Action Duplicate'
            icon={<CopyAllIcon />}
            onClick={() => handleActions(true, params.id, true)}
            label='Duplicate'
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
        ],
      },
      {
        field: 'id',
        headerName: 'ID',
        ...config.datagrid.column,
      },
      {
        field: 'pricing_type',
        headerName: fields?.pricing_type_id ?? 'Pricing Type',
        description: 'Pricing Type',
        disableColumnMenu: true,
        display: 'flex',
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value?.name} />
        ),
        flex: 1,
      },
      {
        field: 'package_name',
        headerName: fields?.package_name ?? 'Package Name',
        description: 'Package Name',
        disableColumnMenu: true,
        display: 'flex',
        flex: 1,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value} />
        ),
      },
      {
        field: 'price',
        headerName: fields?.price ?? 'Price',
        description: 'Price',
        disableColumnMenu: true,
        display: 'flex',
        flex: 1,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text
            text={`${params.row?.currency?.symbol}${params?.value}`}
            description={params.row?.currency?.name}
          />
        ),
      },
      {
        field: 'job_post_amount',
        headerName: fields?.job_post_amount ?? 'Job post amount',
        description: 'Job post amount',
        disableColumnMenu: true,
        display: 'flex',
        flex: 1,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text
            text={params?.value}
            // description={params.row?.currency?.name}
          />
        ),
      },
      {
        field: 'created_at',
        headerName: fields?.created_at ?? 'Created At',
        description: 'Created At',
        disableColumnMenu: true,
        display: 'flex',
        flex: 1,
        valueFormatter: (value: string) => dayjs(value)?.format('DD-MM-YY'),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
      },
      {
        field: 'created_by',
        headerName: fields?.created_by ?? 'Created By',
        description: 'Created By',
        disableColumnMenu: true,
        display: 'flex',
        flex: 1,
        valueFormatter: (value: IUser) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value !== null ? <UserChip data={params.value} /> : null;
        },
      },
    ],
    [fields]
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
            name: 'pricings-common',
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
    <Stack>
      <PricingActions
        id={actionsData.id}
        parentId={id}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <PricingsCards
            id={id}
            rows={rows}
            commonData={commonData}
            toggleFilters={toggleFilters}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            searchValue={searchValue}
            handleSearch={handleSearch}
            view={view}
            changeDescription={changeDescription}
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
            pageName='pricing'
            loading={isFetching}
            rowCount={rowCount}
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            multiDeletePermission={true}
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
        <PricingsCards
          id={id}
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
          changeDescription={changeDescription}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
        />
      )}
      <PricingsFilter
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
        query='pricings'
        url={`job-sites/${id}/pricings`}
        handleClose={handleClose}
      />
      <JSONModal json={description} handleClose={() => setDescription('')} />
    </Stack>
  );
}
