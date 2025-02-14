'use client';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import { SocketContext } from '@/contexts/socketContext';
import useActions from '@/hooks/useActions';
import useFilters from '@/hooks/useFilters';
import useNotification from '@/hooks/useNotification';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import { apiGetData, apiUpdateData, updateCommondData } from '@/lib/fetch';
import { getAppSearchParams } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, IconButton, Stack, Theme, useMediaQuery } from '@mui/material';
import { GridColDef, GridRenderCellParams, GridTreeNodeWithRender } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import MoreChips from '../../common/components/MoreChips';
import { commonDataBlocks, getCommonData } from './commonData';
import EntityBlockFieldsCards from './EntityBlockFieldsCards';
import { IEntityTypeFieldsFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const EntityTypeFieldsFilter = dynamic(() => import('./EntityBlockFieldsFilter'), {
  ssr: false,
});
const EditModal = dynamic(() => import('./components/EditModal/EditModal'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

export default function EntityBlockFields() {
  const [view, setView] = useState('table');
  const { echo } = useContext(SocketContext);
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const queryClient = useQueryClient();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IEntityTypeFieldsFilters>();
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
  const [rows, setRows] = useState<IEntityBlockFieldType[]>([]);
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: [
      'entity-blocks-fields',
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
      const response = await apiGetData(`entity-blocks-fields?${searchParams}`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: {
      data: [],
      meta: {},
      fields: {},
    },
  });

  const {
    data: entity,
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
    queryKey: ['entity-blocks-fields-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      blocks: [],
      languages: [],
      entity_types: [],
    },
  });

  const [objectTooltip, setObjectTooltip] = useState<{
    entity_block_field_id: number;
    name: string;
    field: string;
    block: string;
    tooltip: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorTooltip, setIsErrorTooltip] = useState(false);
  const showNotification = useNotification();

  const findByEntityBlockFieldId = (data: any, id: number) => {
    const field = data.fields.find((field: any) => field.entity_block_field_id === id);
    if (field) {
      return {
        entity_block_field_id: field.entity_block_field_id,
        field: field.front_name,
        name: data.name,
        block: data.block_name,
        tooltip: field.tooltip,
      };
    }

    return null;
  };
  const handleClick = (id: number, row: IEntityBlockFieldType) => {
    setObjectTooltip(findByEntityBlockFieldId(row, id));
  };

  const closeEditModal = () => {
    setObjectTooltip(null);
  };

  const updateMutation = useMutation({
    mutationFn: async (data: any) =>
      apiUpdateData(`entity-blocks-fields/${objectTooltip?.entity_block_field_id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['entity-blocks-fields'],
        });
        closeEditModal();
        showNotification('Successfully updated', 'success');
      } else if (result?.error) {
        showNotification('Something went wrong', 'error');
        setIsErrorTooltip(true);
      }
    },
  });
  const handleSubmit = () =>
    updateMutation.mutate({
      tooltip: objectTooltip?.tooltip,
    });

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'groupId',
        headerName: 'ID',
        ...config.datagrid.column,
        renderCell: (params) => {
          const isGroupHeader = params.row.isGroupHeader;
          if (!isGroupHeader) {
            return null;
          }
          return params.value;
        },
      },
      {
        field: 'name',
        headerName: fields?.name ?? 'Name',
        disableColumnMenu: true,
        description: 'Name',
        display: 'flex',
        width: 250,
        renderCell: (params) => {
          const isGroupHeader = params.row.isGroupHeader;
          const groupId = params.row.groupId;
          const isExpanded = !params.row.isGroupHidden;
          if (!isGroupHeader) {
            return null;
          }
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {isGroupHeader && (
                <IconButton size='small' onClick={() => toggleGroupVisibility(groupId)}>
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
              <span>{params.value}</span>
            </div>
          );
        },
      },
      {
        field: 'entity_type_name',
        headerName: fields?.entity_type_id ?? 'Entity Type',
        disableColumnMenu: true,
        description: 'Entity Type',
        display: 'flex',
        width: 250,
        renderCell: (params) => {
          const isGroupHeader = params.row.isGroupHeader;
          if (!isGroupHeader) {
            return null;
          }
          return params.value;
        },
      },
      {
        field: 'block_name',
        headerName: fields?.block ?? 'Block',
        disableColumnMenu: true,
        description: 'Block',
        display: 'flex',
        width: 250,
      },
      {
        field: 'fields',
        headerName: fields?.fields ?? 'Fields',
        disableColumnMenu: true,
        description: 'Fields',
        display: 'flex',
        width: 700,

        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value ? (
            <Box
              sx={{
                p: '4px 0',
                height: config.datagrid.rowHeight,
                maxHeight: '100%',
                overflowY: 'auto',
              }}
            >
              <MoreChips
                data={params.value}
                propName='front_name'
                handleSetModal={(data: any) => handleClick(data.entity_block_field_id, params.row)}
              />
            </Box>
          ) : null;
        },
      },
    ],
    [fields]
  );

  const createRows = (data: any) => {
    let seenGroupIds = new Set();
    let i = 0;
    const newData = data?.flatMap((item: any) => {
      return item.blocks.map((block: any) => {
        i = i + 1;

        const isGroupHeader = !seenGroupIds.has(item.id);
        if (isGroupHeader) {
          seenGroupIds.add(item.id);
        }

        return {
          id: i,
          isGroupHeader: isGroupHeader,
          groupId: item.id,
          name: item.name,
          isGroupHidden: true,
          entity_type_name: item.entity_type?.name,
          entity_type_id: item.entity_type?.id,
          block_name: block.name,
          block_id: block.id,
          fields: block.fields,
        };
      });
    });
    return newData ?? [];
  };

  const handleChangeView = (_: React.MouseEvent<HTMLElement>, newView: string) => {
    clearSearch();
    clearSort();
    defaultPagination();
    setView((prev) => newView ?? prev);
  };
  const toggleGroupVisibility = (groupId: number) => {
    setRows((prevRows) => {
      return prevRows.map((row) => {
        if (row.groupId === groupId) {
          return {
            ...row,
            isGroupHidden: !row.isGroupHidden,
          };
        }

        return row;
      });
    });
  };
  const visibleRows = rows.filter((row) => !row.isGroupHidden || row.isGroupHeader);

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
              name: 'entity-blocks-fields-common',
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
    if (data) {
      setRows(createRows(data?.data));
      handleRowCount(data?.meta?.total);
    }
  }, [data, meta, countEdits, entityBlockId]);

  return (
    <Stack gap='2rem'>
      {view === 'table' &&
        (mdDown ? (
          <EntityBlockFieldsCards
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
            view={view}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
          />
        ) : (
          <CustomTable
            view={view}
            rows={visibleRows}
            columns={columns}
            pageName='Entity blocks fields'
            loading={isFetching}
            rowCount={rowCount}
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            rowHeight={config.datagrid.rowHeight}
            multiDeletePermission
            hideCheckboxes
            availableExport
          />
        ))}
      {view === 'cards' && (
        <EntityBlockFieldsCards
          rows={rows}
          loading={isFetching}
          commonData={commonData}
          toggleFilters={toggleFilters}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          searchValue={searchValue}
          paginationModel={paginationModel}
          handlePagination={handlePagination}
          handleSearch={handleSearch}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
        />
      )}
      <EntityTypeFieldsFilter
        rows={rows}
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
        query='entity-blocks-fields'
        url='entity-blocks-fields'
        handleClose={handleClose}
      />
      <EditModal
        objectTooltip={objectTooltip}
        isErrorTooltip={isErrorTooltip}
        isLoading={isLoading}
        setValue={setObjectTooltip}
        handleClose={closeEditModal}
        handleSubmit={handleSubmit}
      />
    </Stack>
  );
}
