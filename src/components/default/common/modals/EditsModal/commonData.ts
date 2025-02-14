import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  statuses: 'statuses?perPage=-1&isShort=1&isCommon=1',
  edits: 'edits?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  types: 'edit-progress-types',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
