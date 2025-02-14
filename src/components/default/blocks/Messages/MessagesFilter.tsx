import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { checkFilterValue, createFilterHandler } from '@/lib/helpers';
import { Theme, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { IMessage, IMessagesFilters } from './types';

interface IFiltersProps {
  open: boolean;
  rows: IMessage[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IMessagesFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function MessagesFilter({
  open,
  handleSetFilters,
  commonData,
  toggleFilters,
  handleApplyFilters,
}: IFiltersProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [innerClientFilter, setInnerClientFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [messageTypeFilter, setMessageTypeFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [entityBlocksFilter, setEntityBlocksFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [toolsFilter, setToolsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const inner_clients = commonData.inner_clients ?? [];
  const message_types = commonData.message_types ?? [];
  const entity_blocks = commonData.entity_block ?? [];
  const tools = commonData.tools ?? [];

  const generateFiltersData = () => {
    const filters: IMessagesFilters = {};
    if (checkFilterValue(innerClientFilter)) {
      filters.inner_clients = {
        data: innerClientFilter.value,
        mode: innerClientFilter.mode,
      };
    }
    if (checkFilterValue(messageTypeFilter)) {
      filters.message_types = {
        data: messageTypeFilter.value,
        mode: messageTypeFilter.mode,
      };
    }
    if (checkFilterValue(entityBlocksFilter)) {
      filters.entity_blocks = {
        data: entityBlocksFilter.value,
        mode: entityBlocksFilter.mode,
      };
    }
    if (checkFilterValue(toolsFilter)) {
      filters.tools = {
        data: toolsFilter.value,
        mode: toolsFilter.mode,
      };
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setInnerClientFilter({ value: [], mode: 'standard' });
    setMessageTypeFilter({ value: [], mode: 'standard' });
    setEntityBlocksFilter({ value: [], mode: 'standard' });
    setToolsFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [innerClientFilter, messageTypeFilter, entityBlocksFilter, toolsFilter]);

  return (
    <FiltersDrawer
      title='Messages'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={innerClientFilter}
        label='Inner clients'
        options={inner_clients}
        handleChangeFilter={createFilterHandler(setInnerClientFilter)}
      />
      <MultipleSelectFilter
        filter={messageTypeFilter}
        label='Message types'
        options={message_types}
        handleChangeFilter={createFilterHandler(setMessageTypeFilter)}
      />
      <MultipleSelectFilter
        filter={entityBlocksFilter}
        label='Entity blocks'
        options={entity_blocks}
        handleChangeFilter={createFilterHandler(setEntityBlocksFilter)}
      />
      <MultipleSelectFilter
        filter={toolsFilter}
        label='Tools'
        options={tools}
        handleChangeFilter={createFilterHandler(setToolsFilter)}
      />
    </FiltersDrawer>
  );
}
