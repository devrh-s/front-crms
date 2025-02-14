import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  placement_types: 'placement-types?perPage=-1&isCommon=1&isShort=1',
  accounts: 'accounts?perPage=-1&isCommon=1&isShort=1',
  tools:
    'tools?perPage=-1&is_group_similar=1&entity_name=accounts&block_name=Profile&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
