import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  inner_clients: 'inner-clients?perPage=-1&isShort=1&isCommon=1',
  message_types: 'message-types?perPage=-1&isShort=1&isCommon=1',
  tools: 'tools?perPage=-1&isShort=1&isCommon=1',
  entity_block: 'entity-blocks?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  languages: 'languages?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
