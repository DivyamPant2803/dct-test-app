import { ControlMetadata } from '../../services/controlService';
import { FormData } from '../../App';
import { Evidence, MERType, MERTemplate, UploadedTemplate } from '../../types/index';
import { ApplicationData } from '../../services/applicationDataService';

export interface WorkflowState {
  selectedControls: ControlMetadata[];
  selectedMERType: MERType | null;
  applicationData: ApplicationData | null;
  merTemplate: MERTemplate | null;
  uploadedTemplate: UploadedTemplate | null;
  questionnaireData: Partial<FormData> | null;
  uploadedEvidence: Map<string, Evidence>;
  currentTransferId: string | null;
  currentStep: number;
  isSubmitted: boolean;
  isSubmitting: boolean;
}

export type WorkflowAction =
  | { type: 'SET_SELECTED_CONTROLS'; controls: ControlMetadata[] }
  | { type: 'SELECT_MER_TYPE'; merType: MERType }
  | { type: 'SET_APPLICATION_DATA'; data: ApplicationData }
  | { type: 'SET_MER_TEMPLATE'; template: MERTemplate }
  | { type: 'SET_UPLOADED_TEMPLATE'; template: UploadedTemplate }
  | { type: 'SET_QUESTIONNAIRE_DATA'; data: Partial<FormData> }
  | { type: 'ADD_EVIDENCE'; key: string; evidence: Evidence }
  | { type: 'SET_TRANSFER_ID'; id: string }
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'NAVIGATE_BACK_TO'; step: number };

export const initialWorkflowState: WorkflowState = {
  selectedControls: [],
  selectedMERType: null,
  applicationData: null,
  merTemplate: null,
  uploadedTemplate: null,
  questionnaireData: null,
  uploadedEvidence: new Map(),
  currentTransferId: null,
  currentStep: 0,
  isSubmitted: false,
  isSubmitting: false,
};

export function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'SET_SELECTED_CONTROLS':
      return { ...state, selectedControls: action.controls };

    case 'SELECT_MER_TYPE':
      return { ...state, selectedMERType: action.merType };

    case 'SET_APPLICATION_DATA':
      return { ...state, applicationData: action.data };

    case 'SET_MER_TEMPLATE':
      return { ...state, merTemplate: action.template };

    case 'SET_UPLOADED_TEMPLATE':
      return { ...state, uploadedTemplate: action.template };

    case 'SET_QUESTIONNAIRE_DATA':
      return { ...state, questionnaireData: action.data };

    case 'ADD_EVIDENCE': {
      const newMap = new Map(state.uploadedEvidence);
      newMap.set(action.key, action.evidence);
      return { ...state, uploadedEvidence: newMap };
    }

    case 'SET_TRANSFER_ID':
      return { ...state, currentTransferId: action.id };

    case 'SET_STEP':
      return { ...state, currentStep: action.step };

    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.value };

    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitted: true, isSubmitting: false };

    case 'NAVIGATE_BACK_TO': {
      const step = action.step;
      const base = { ...state, currentStep: step, isSubmitted: false };

      if (step <= 0) {
        return {
          ...base,
          selectedControls: [],
          selectedMERType: null,
          applicationData: null,
          merTemplate: null,
          uploadedTemplate: null,
          questionnaireData: null,
          uploadedEvidence: new Map(),
          currentTransferId: null,
        };
      }
      if (step === 1) {
        return {
          ...base,
          selectedMERType: null,
          applicationData: null,
          merTemplate: null,
          uploadedTemplate: null,
          currentTransferId: null,
          uploadedEvidence: new Map(),
        };
      }
      if (step === 2) {
        return {
          ...base,
          applicationData: null,
          merTemplate: null,
          uploadedTemplate: null,
          currentTransferId: null,
          uploadedEvidence: new Map(),
        };
      }
      if (step === 3) {
        return {
          ...base,
          merTemplate: null,
          uploadedTemplate: null,
          questionnaireData: null,
          currentTransferId: null,
          uploadedEvidence: new Map(),
        };
      }
      if (step === 4) {
        return { ...base, uploadedEvidence: new Map() };
      }
      return base;
    }

    default:
      return state;
  }
}

export function getPrimaryControl(state: WorkflowState): ControlMetadata | null {
  return state.selectedControls[0] ?? null;
}

export function isMerWorkflow(state: WorkflowState): boolean {
  return (
    state.selectedControls.length > 0 &&
    state.selectedControls.every(c => c.controlType === 'MER')
  );
}
