import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  users: 'users?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  types: 'edit-progress-types',
  statuses: 'statuses?perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
