import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  users: 'users?perPage=-1&field=name_sort&isShort=1&isCommon=1',
  professions: 'professions?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  positions: 'positions?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
