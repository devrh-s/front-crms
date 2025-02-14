export interface IMilestoneSave {
  id: number | string;
  name: string;
  description: string;
  milestone_template_id: number | string;
  start_date: string;
  end_date: string;
  tasks: ITaskSave[];
}

export interface ITaskSave {
  id: number | string;
  title: string;
  task_request_id: number | string;
  parent_tasks: number[];
  task_template_id: number | string;
  status_id: number | string;
  start_date: string;
  due_date: string;
  priority_id: number | string;
  note: string;
  controllers: number[];
  assignees: number[];
  professions: number[];
  steps: IStepSave[];
}

export interface IStepSave {
  id: number | string;
  order: number | string;
  name: string;
  assignee_id: number | string;
  step_template_id: number | string;
  checklists: IChecklistSave[];
}

export interface IChecklistSave {
  id: number | string;
  order: number | string;
  name: string;
  placement_id: number | string;
  checklist_item_id: number | string;
}
