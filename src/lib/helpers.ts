import { Dispatch, SetStateAction } from 'react';

// Generate rows for Import Drawer (Match step)
export const generateImportRows = (data: any[]) => {
  const [firstElem] = data;
  const rows: any = [];
  if (!firstElem || !firstElem?.length || !data?.length) {
    return [];
  }
  const length = firstElem.length - 1;
  const rowsLength = data.length - 1;
  for (let i = 0; i <= length; i++) {
    for (let j = 0; j <= rowsLength; j++) {
      const current = data[j].shift();
      if (!rows[i]) {
        rows[i] = [current];
      } else {
        rows[i][j] = current;
      }
    }
  }
  return rows;
};

export const getQueryName = (pageName: string) => {
  return pageName.toLowerCase().replace(/\s+/g, '-');
};

export const checkFilterValue = (filter: IFilter | IDateFilter) => {
  if (Array.isArray(filter?.value)) {
    return filter.value.length;
  }
  if (filter?.value instanceof Object) {
    const [start, end] = Object.values(filter.value);
    return !!start || !!end || filter.mode !== 'standard';
  }
  return !!filter?.value;
};

export const generateSearchParams = (paramObj: Record<string, any>) => {
  const params = new URLSearchParams();

  Object.entries(paramObj).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(`${key}[]`, `${item}`));
      } else {
        params.append(key, `${value}`);
      }
    }
  });

  return params;
};

export const getAppSearchParams = ({
  paginationModel,
  debouncedSearchValue,
  sortOptions,
  filters,
}: {
  paginationModel?: { page: number; pageSize: number };
  debouncedSearchValue?: string;
  sortOptions?: {
    field: string;
    sort: any;
  } | null;
  filters?: any;
}) => {
  const searchParams = new URLSearchParams();
  if (paginationModel) {
    searchParams.append('page', `${paginationModel.page + 1}`);
    searchParams.append('perPage', `${paginationModel.pageSize}`);
  }
  if (debouncedSearchValue) {
    searchParams.append('search', `${debouncedSearchValue}`);
  }
  if (sortOptions) {
    searchParams.append('field', `${sortOptions.field}_sort`);
    searchParams.append('sort', sortOptions.sort as string);
  }
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      const filterValue = value as any;
      if (filterValue instanceof Object) {
        if (Array.isArray(filterValue?.data)) {
          filterValue.data.forEach((el: any) =>
            searchParams.append(`${key}[data][]`, el.toString())
          );
        } else {
          searchParams.append(`${key}[start]`, filterValue?.data?.start ?? '');
          searchParams.append(`${key}[end]`, filterValue?.data?.end ?? '');
        }
        searchParams.append(`${key}[mode]`, filterValue.mode);
      } else {
        searchParams.set(key, filterValue);
      }
    }
  }
  return searchParams;
};

export const createDateFilterHandler = (setFilter: Dispatch<SetStateAction<IDateFilter>>) => {
  return (value: FilterMode | IDateFilterValues) => {
    if (value === 'standard' || value === 'exclude') {
      return setFilter((prev) => ({ ...prev, mode: value as FilterMode }));
    }
    return setFilter((prev) => ({ ...prev, value: value }));
  };
};

export const createFilterHandler = (setFilter: Dispatch<SetStateAction<IFilter>>) => {
  return (value: FilterMode | number[] | string) => {
    if (value === 'standard' || value === 'exclude') {
      return setFilter((prev) => ({ ...prev, mode: value as FilterMode }));
    }
    return setFilter((prev) => ({ ...prev, value: value }));
  };
};

export const debounce = (func: any, timeout = 300) => {
  let timer: any;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

export const getPermissionNames = (permissions: Array<IPermission>) => {
  const permExceptions = ['settings', 'blocks', 'users'];
  const permissionNames = permissions.flatMap((permission) => [
    permission.name.toLowerCase(),
    ...permission.entities.flatMap((entity) => {
      const entityName = entity.name.toLowerCase();
      if (permExceptions.includes(entityName)) {
        return Object.keys(entity.permissions).map((permission) => {
          const [, ...names] = permission.split('_');
          return names.join(' ');
        });
      }
      return entityName;
    }),
  ]);
  return [...permissionNames, 'profile'];
};

export const getPagePermissions = (
  moduleName: string,
  pageName: string,
  permissionsData: Array<IPermission> | null
) => {
  const pageModule = permissionsData?.find((el) => el.name === moduleName);
  if (pageModule) {
    return pageModule.entities.find((el) => el.name === pageName)?.permissions ?? {};
  }
  return {};
};

export const checkPermission = ({
  pagePermissions,
  permissionType,
  userId,
  ownerId,
  isAdmin,
}: {
  pagePermissions: { [permission: string]: string };
  permissionType: string;
  userId?: number;
  ownerId?: number | number[];
  isAdmin?: boolean;
}) => {
  const checkedPermission = pagePermissions[permissionType];
  if (isAdmin) return true;
  if (checkedPermission === 'all') return true;
  if (checkedPermission === 'added' || checkedPermission === 'owned') {
    if (typeof userId === 'number') {
      if (typeof ownerId === 'number' && ownerId === userId) {
        return true;
      }
      if (Array.isArray(ownerId) && ownerId.includes(userId)) {
        return true;
      }
    }
  }
  return false;
};

// If commonData contains same urls with diff names
export const getCommonDataReq = (
  selectedKey: string,
  commonDataBlocks: { [string: string]: string }
) => {
  const basicValue = commonDataBlocks[selectedKey];
  const regExp = new RegExp(`^${selectedKey}`);
  if (basicValue) return { [selectedKey]: basicValue };
  for (const [key, value] of Object.entries(commonDataBlocks)) {
    if (value.match(regExp)) return { [key]: value };
  }
  return null;
};

export const formatSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  const units = ['KB', 'MB', 'GB'];
  let unitIndex = -1;

  do {
    size /= 1024;
    unitIndex++;
  } while (size >= 1024 && unitIndex < units.length - 1);

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

export const getFileExt = (fileName: string) => {
  const divider = fileName.lastIndexOf('.');
  return fileName.substring(divider + 1);
};
