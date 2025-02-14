import update from 'immutability-helper';
import { IStep, IChecklistItem } from '../types';
import { uniqueId } from 'lodash';

const defaultStep = {
  name: '',
  assignee: null,
  checklist_items: [],
};

const defaultChecklist = {
  name: '',
  guides: [],
};

const stepsReducer = (steps: IStep[], action: { type: string; payload: any }) => {
  switch (action.type) {
    case 'setSteps': {
      return action.payload;
    }
    case 'addNewStep': {
      return [...steps, { ...defaultStep, id: uniqueId() }];
    }
    case 'addNewStepFromTemplate': {
      const newStepTemplate = action.payload;
      if (newStepTemplate) {
        return [...steps, newStepTemplate];
      }
      return steps;
    }
    case 'deleteStep': {
      const { stepInd } = action.payload;
      return update(steps, {
        $splice: [
          [stepInd, 1],
          [stepInd, 0],
        ],
      });
    }
    case 'editSteps': {
      return steps;
    }
    case 'clearSteps': {
      return [];
    }
    case 'editStep': {
      const { stepInd, name } = action.payload;
      let updatedStep: any = steps[stepInd];
      updatedStep = {
        ...updatedStep,
        name,
      };
      return update(steps, {
        $splice: [
          [stepInd, 1],
          [stepInd, 0, updatedStep],
        ],
      });
    }
    case 'moveStep': {
      const { sourceIndex, destIndex } = action.payload;
      return update(steps, {
        $splice: [
          [sourceIndex, 1],
          [destIndex, 0, steps[sourceIndex]],
        ],
      });
    }
    case 'addNewChecklist': {
      const { stepInd, newChecklistitem: newChecklistItem } = action.payload;
      const newSteps = [...steps];
      const newStep = newSteps[stepInd];
      const newChecklistitems = newStep.checklist_items ?? [];
      newSteps[stepInd] = {
        ...newStep,
        checklist_items: [
          ...newChecklistitems,
          newChecklistItem ?? { ...defaultChecklist, id: uniqueId() },
        ],
      };
      return newSteps;
    }
    case 'deleteChecklist': {
      const { stepInd, checklistInd } = action.payload;
      const currentSteps = [...steps];
      const currentStep = currentSteps[stepInd];
      currentSteps[stepInd].checklist_items = update(currentStep.checklist_items, {
        $splice: [
          [checklistInd, 1],
          [checklistInd, 0],
        ],
      });
      return currentSteps;
    }
    case 'editChecklist': {
      const { stepInd, checklistInd, name } = action.payload;
      const updatedStep: any = steps[stepInd];
      const updatedChecklist: any = updatedStep?.checklist_items[checklistInd];
      if (updatedChecklist) {
        updatedStep.checklist_items[checklistInd] = {
          ...updatedChecklist,
          name,
        };
      }
      return update(steps, {
        $splice: [
          [stepInd, 1],
          [stepInd, 0, updatedStep],
        ],
      });
    }
    case 'moveChecklist': {
      const { sourceIndex, destIndex, stepInd } = action.payload;
      const updatedStep: any = steps[stepInd];
      updatedStep.checklist_items = update(updatedStep.checklist_items, {
        $splice: [
          [sourceIndex, 1],
          [destIndex, 0, updatedStep.checklist_items[sourceIndex]],
        ],
      });
      return update(steps, {
        $splice: [
          [stepInd, 1],
          [stepInd, 0, updatedStep],
        ],
      });
    }
    case 'editGuides': {
      const { stepInd, checklistInd, guideInd, name, tools, objects, entities, guide_formats } =
        action.payload;
      const updatedStep: any = steps[stepInd];
      const updatedGuide: any = updatedStep.checklist_items[checklistInd]['guides'][guideInd];

      updatedStep.checklist_items[checklistInd]['guides'][guideInd] = {
        ...updatedGuide,
        name,
        tools,
        objects,
        entities,
        guide_formats,
      };
      return update(steps, {
        $splice: [
          [stepInd, 1],
          [stepInd, 0, updatedStep],
        ],
      });
    }
    default:
      throw Error('Unknown action: ' + action.type);
  }
};

export default stepsReducer;
