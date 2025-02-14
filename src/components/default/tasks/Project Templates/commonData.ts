import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  task_templates: 'task-templates?perPage=-1&isShort=1',
  milestone_templates: 'milestone-templates?perPage=-1&isShort=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
