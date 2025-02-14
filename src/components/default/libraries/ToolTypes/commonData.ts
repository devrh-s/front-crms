import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  tools:
    'tools?is_group=1&perPage=-1&entity_name=tool_types&block_name=Profile&isCommon=1&isShort=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
