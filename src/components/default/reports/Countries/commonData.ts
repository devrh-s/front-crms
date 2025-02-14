import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  countries: 'countries?is_group_similar=1&isCommon=1&isShort=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
