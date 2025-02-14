import { v4 as uuidv4 } from 'uuid';
import type { IMilestoneSave, ITaskSave, IStepSave, IChecklistSave } from './types/types';

export const getTransformedMilestone = (milestoneTemplate: IMilestoneTemplate): IMilestoneSave => {
  return {
    id: uuidv4(),
    milestone_template_id: milestoneTemplate?.id ?? '',
    name: milestoneTemplate?.name,
    description: milestoneTemplate?.description,
    start_date: '',
    end_date: '',
    tasks: milestoneTemplate.task_templates?.map((task) => ({
      id: uuidv4(),
      title: task?.name ?? '',
      parent_tasks: [],
      task_request_id: '',
      task_template_id: task?.id ?? '',
      status_id: '',
      start_date: '',
      due_date: '',
      priority_id: '',
      note: task?.description ?? '',
      controllers: [],
      assignees: [],
      professions: [],
      steps:
        task.step_templates?.map((step) => ({
          id: uuidv4(),
          order: '',
          name: step?.name ?? '',
          assignee_id: '',
          step_template_id: step?.id ?? '',
          checklists:
            step?.checklist_items.map((checklist) => ({
              id: uuidv4(),
              order: '',
              name: checklist?.name ?? '',
              placement_id: checklist?.placement?.id ?? '',
              checklist_item_id: checklist?.id ?? '',
            })) ?? [],
        })) ?? [],
    })),
  };
};

export const getTransformedTask = (taskTemplate?: ITaskTemplate): ITaskSave => {
  return {
    id: uuidv4(),
    title: taskTemplate?.name ?? '',
    parent_tasks: [],
    task_request_id: '',
    task_template_id: taskTemplate?.id ?? '',
    status_id: '',
    start_date: '',
    due_date: '',
    priority_id: '',
    note: taskTemplate?.description ?? '',
    controllers: [],
    assignees: [],
    professions: [],
    steps:
      taskTemplate?.step_templates?.map((step) => ({
        id: uuidv4(),
        order: '',
        name: step?.name ?? '',
        assignee_id: '',
        step_template_id: step?.id ?? '',
        checklists:
          step?.checklist_items.map((checklist) => ({
            id: uuidv4(),
            order: '',
            name: checklist?.name ?? '',
            placement_id: checklist?.placement?.id ?? '',
            checklist_item_id: checklist?.id ?? '',
          })) ?? [],
      })) ?? [],
  };
};

export const getTransformedStep = (stepTemplate?: IStepTemplate): IStepSave => {
  return {
    id: uuidv4(),
    order: '',
    name: stepTemplate?.name ?? '',
    assignee_id: '',
    step_template_id: stepTemplate?.id ?? '',
    checklists:
      stepTemplate?.checklist_items.map((checklist) => ({
        id: uuidv4(),
        order: '',
        name: checklist?.name ?? '',
        placement_id: checklist?.placement?.id ?? '',
        checklist_item_id: checklist?.id ?? '',
      })) ?? [],
  };
};

export const getTransformedChecklist = (checklistItem?: IChecklistItemType): IChecklistSave => {
  return {
    id: uuidv4(),
    order: '',
    name: checklistItem?.name ?? '',
    placement_id: checklistItem?.placement?.id ?? '',
    checklist_item_id: checklistItem?.id ?? '',
  };
};
