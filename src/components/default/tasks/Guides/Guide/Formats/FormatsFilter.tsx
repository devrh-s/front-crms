import { useState, useEffect } from 'react';
import { Theme, useMediaQuery } from '@mui/material';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { IGuideFormatsFilters } from './types';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler } from '@/lib/helpers';

interface IFiltersProps {
  open: boolean;
  rows: IFormats[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IGuideFormatsFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function GuideFormatsFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [objectsFilter, setObjectsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [formatsFilter, setFormatsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const objects = commonData.objects ?? [];
  const formats = commonData.formats ?? [];

  const generateFiltersData = () => {
    const filters: IGuideFormatsFilters = {};
    if (objectsFilter.value?.length) {
      filters.objects = {
        data: objectsFilter.value,
        mode: objectsFilter.mode,
      };
    }
    if (formatsFilter.value?.length) {
      filters.formats = {
        data: formatsFilter.value,
        mode: formatsFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setObjectsFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectsFilter, formatsFilter]);

  return (
    <FiltersDrawer
      title='Formats'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={objectsFilter}
        label='Objects'
        options={objects}
        handleChangeFilter={createFilterHandler(setObjectsFilter)}
      />
      <MultipleSelectFilter
        filter={formatsFilter}
        label='Formats'
        options={formats}
        handleChangeFilter={createFilterHandler(setFormatsFilter)}
      />
    </FiltersDrawer>
  );
}
