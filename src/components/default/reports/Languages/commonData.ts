import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  languages: 'languages?is_group_similar=1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
