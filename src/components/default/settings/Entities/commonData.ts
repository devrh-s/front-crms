import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  entity_types: 'entity-types?perPage=-1&isShort=1&isCommon=1',
  blocks: 'blocks?perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
