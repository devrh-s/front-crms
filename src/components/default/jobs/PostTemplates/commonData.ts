import { apiCommonData } from '@/lib/fetch';

const commonDataBlocks = {
  job_templates: 'job-templates?perPage=-1&isShort=1',
  users: 'users?perPage=-1&isShort=1',
  destinations: 'post-templates-destinations',
  statuses:
    'statuses?entity_name=post_templates&block_name=Profile&is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  languages: 'languages?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
