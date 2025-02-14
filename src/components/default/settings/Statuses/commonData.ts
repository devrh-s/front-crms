import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  statuses: 'statuses?perPage=-1&isShort=1&isCommon=1',
  entity_block: 'entity-blocks?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  blocks: 'blocks?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  entities: 'entities?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
