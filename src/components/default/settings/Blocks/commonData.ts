import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  blocks: 'blocks?perPage=-1&isShort=1&isCommon=1',
  entities: 'entities?perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
