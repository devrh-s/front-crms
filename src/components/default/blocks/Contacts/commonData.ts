import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  tools:
    'tools?entity_name=job_applications&block_name=Contacts&is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  located_at: 'entities?isShort=1&is_contacts=1&perPage=-1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
