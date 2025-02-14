const getSetTasks = ({ tasks }: { [key: string]: any }) => ({ $set: tasks });

const getUpdateTasks = ({ tasks }: { [key: string]: any }) => ({ $push: tasks });

const getDeleteTask = ({ taskInd }: { taskInd: number }) => ({
  $splice: [[taskInd, 1]],
});

const getMoveTask = ({
  sourceInd,
  destInd,
  elems,
}: {
  sourceInd: number;
  destInd: number;
  [key: string]: any;
}) => ({
  $splice: [
    [sourceInd, 1],
    [destInd, 0, elems[sourceInd]],
  ],
});

const getUpdateSteps = ({ taskInd, steps }: { taskInd: number; [key: string]: any }) => ({
  [taskInd]: {
    steps: {
      $push: steps,
    },
  },
});

const getDeleteStep = ({ taskInd, stepInd }: { taskInd: number; stepInd: number }) => ({
  [taskInd]: {
    steps: {
      $splice: [[stepInd, 1]],
    },
  },
});

const getMoveStep = ({
  sourceInd,
  destInd,
  taskInd,
  elems,
}: {
  taskInd: number;
  sourceInd: number;
  destInd: number;
  [key: string]: any;
}) => ({
  [taskInd]: {
    steps: {
      $splice: [
        [sourceInd, 1],
        [destInd, 0, elems[taskInd].steps[sourceInd]],
      ],
    },
  },
});

const getUpdateChecklists = ({ taskInd, stepInd, checklists }: { [key: string]: any }) => ({
  [taskInd]: {
    steps: {
      [stepInd]: {
        checklists: {
          $push: checklists,
        },
      },
    },
  },
});

const getDeleteChecklist = ({
  stepInd,
  taskInd,
  checklistInd,
}: {
  taskInd: number;
  stepInd: number;
  checklistInd: number;
}) => ({
  [taskInd]: {
    steps: {
      [stepInd]: {
        checklists: {
          $splice: [[checklistInd, 1]],
        },
      },
    },
  },
});

const getMoveChecklist = ({
  taskInd,
  stepInd,
  sourceInd,
  destInd,
  elems,
}: {
  taskInd: number;
  stepInd: number;
  sourceInd: number;
  destInd: number;
  [key: string]: any;
}) => ({
  [taskInd]: {
    steps: {
      [stepInd]: {
        checklists: {
          $splice: [
            [sourceInd, 1],
            [destInd, 0, elems[taskInd].steps[stepInd].checklists[sourceInd]],
          ],
        },
      },
    },
  },
});

export default {
  getSetTasks,
  getUpdateTasks,
  getMoveTask,
  getDeleteTask,
  getUpdateSteps,
  getMoveStep,
  getDeleteStep,
  getUpdateChecklists,
  getMoveChecklist,
  getDeleteChecklist,
};
