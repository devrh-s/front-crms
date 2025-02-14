import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  languages: 'languages?perPage=-1&isShort=1&isCommon=1&is_group_similar=1',
  levels: 'levels?perPage=-1&isShort=1&isCommon=1&is_group_similar=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
