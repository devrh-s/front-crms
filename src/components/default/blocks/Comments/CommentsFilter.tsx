import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { checkFilterValue, createDateFilterHandler, createFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}
interface IApiFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

const getDateDefault = (): IDateFilter => ({
  value: {
    start: null,
    end: null,
  },
  mode: 'standard',
});

export interface ICommentsFilters {
  created_by?: IApiFilter;
  comment_types?: IApiFilter;
  createdAt?: IApiFilter;
  date?: IApiFilter;
}

interface IFiltersProps {
  open: boolean;
  rows: IContact[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: ICommentsFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function CommentsFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [commentTypeFilter, setCommentTypeFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const [createdAt, setCreatedAt] = useState<IDateFilter>(getDateDefault);
  const [date, setDate] = useState<IDateFilter>(getDateDefault);

  const clearFilters = () => {
    setCommentTypeFilter({ value: [], mode: 'standard' });
    setCreatedByFilter({ value: [], mode: 'standard' });
    setCreatedAt(getDateDefault());
    setDate(getDateDefault());
    handleSetFilters({});
  };

  useEffect(() => {
    const generateFiltersData = () => {
      const filters: ICommentsFilters = {};
      if (checkFilterValue(commentTypeFilter)) {
        filters.comment_types = {
          data: commentTypeFilter.value,
          mode: commentTypeFilter.mode,
        };
      }
      if (checkFilterValue(createdByFilter)) {
        filters.created_by = {
          data: createdByFilter.value,
          mode: createdByFilter.mode,
        };
      }
      if (checkFilterValue(createdAt)) {
        filters.createdAt = {
          data: {
            start: createdAt?.value?.start?.format('DD-MM-YYYY'),
            end: createdAt?.value?.end?.format('DD-MM-YYYY'),
          },
          mode: createdAt.mode,
        };
      }
      if (checkFilterValue(date)) {
        filters.date = {
          data: {
            start: date?.value?.start?.format('DD-MM-YYYY'),
            end: date?.value?.end?.format('DD-MM-YYYY'),
          },
          mode: date.mode,
        };
      }

      handleSetFilters(filters);
    };

    generateFiltersData();
  }, [commentTypeFilter, createdByFilter, createdAt, date]);

  return (
    <FiltersDrawer
      title='Rates'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={commentTypeFilter}
        label='Comment Type'
        options={commonData.comment_types ?? []}
        handleChangeFilter={createFilterHandler(setCommentTypeFilter)}
      />
      <MultipleSelectFilter
        filter={createdByFilter}
        label='Created By'
        options={commonData.users ?? []}
        handleChangeFilter={createFilterHandler(setCreatedByFilter)}
      />
      <CustomCalendar
        label='Created At'
        filter={createdAt}
        handleChangeFilter={createDateFilterHandler(setCreatedAt)}
      />
      <CustomCalendar
        label='Date'
        filter={date}
        handleChangeFilter={createDateFilterHandler(setDate)}
      />
    </FiltersDrawer>
  );
}
