import { useReducer, useCallback } from 'react';
import { FormData } from '../../App';
import { Evidence, MERType, MERTemplate, Transfer } from '../../types/index';
import { ApplicationData } from '../../services/applicationDataService';
import { useToast } from '../../components/common';
import { createNotifications } from '../../services/notificationService';
import { getMERTemplate, prefillTemplateWithAppData, extractTemplateData } from '../../services/merTemplateService';
import { getActiveTemplates, trackTemplateUsage } from '../../services/uploadedTemplateService';
import { getMER13Template } from '../../config/mer13Template';
import {
  workflowReducer,
  initialWorkflowState,
  getPrimaryControl,
  isMerWorkflow,
} from './merWorkflowReducer';
import { rememberControlUsage } from './merCatalogService';
import { ControlMetadata } from '../../services/controlService';

export interface UseMerWorkflowStateOptions {
  onAfterSubmitSuccess?: () => void;
}

export function useMerWorkflowState(options: UseMerWorkflowStateOptions = {}) {
  const { onAfterSubmitSuccess } = options;
  const [state, dispatch] = useReducer(workflowReducer, initialWorkflowState);
  const { showToast } = useToast();

  const selectedControl = getPrimaryControl(state);
  const { selectedControls } = state;
  const isMERControl = isMerWorkflow(state);

  const {
    selectedMERType,
    applicationData,
    merTemplate,
    uploadedTemplate,
    questionnaireData,
    uploadedEvidence,
    currentTransferId,
    currentStep,
    isSubmitted,
    isSubmitting,
  } = state;

  const setSelectedControls = useCallback((controls: ControlMetadata[]) => {
    dispatch({ type: 'SET_SELECTED_CONTROLS', controls });
  }, []);

  const handleControlContinue = useCallback(() => {
    if (selectedControls.length === 0) return;
    const allMer = selectedControls.every(c => c.controlType === 'MER');
    dispatch({ type: 'SET_STEP', step: allMer ? 1 : 2 });
  }, [selectedControls]);

  const handleMERTypeSelect = useCallback((merType: MERType) => {
    dispatch({ type: 'SELECT_MER_TYPE', merType });
    setTimeout(() => {
      dispatch({ type: 'SET_STEP', step: 2 });
    }, 400);
  }, []);

  const handleApplicationDataFetched = useCallback((appData: ApplicationData) => {
    dispatch({ type: 'SET_APPLICATION_DATA', data: appData });
  }, []);

  const handleApplicationDataContinue = useCallback(() => {
    if (!applicationData || !selectedMERType) return;

    const uploadedTemplates = getActiveTemplates();

    if (uploadedTemplates.length > 0) {
      const template = uploadedTemplates[0];
      dispatch({ type: 'SET_UPLOADED_TEMPLATE', template });
      trackTemplateUsage(template.id);
    } else if (selectedMERType === 'MER-13') {
      const template = getMER13Template();
      dispatch({ type: 'SET_UPLOADED_TEMPLATE', template });
    } else {
      const template = getMERTemplate(selectedMERType);
      const prefilledTemplate = prefillTemplateWithAppData(template, applicationData);
      dispatch({ type: 'SET_MER_TEMPLATE', template: prefilledTemplate });
    }

    dispatch({ type: 'SET_STEP', step: 3 });
  }, [applicationData, selectedMERType]);

  const handlePDFTemplateComplete = useCallback(
    (filledData: Record<string, unknown>, tableData: Record<string, unknown[]>, fileData: Record<string, unknown[]>) => {
      if (!selectedControl || !uploadedTemplate) return;
      const primary = selectedControl;
      const transferId = `transfer-${primary.controlId}-${Date.now()}`;
      const requirementId = `req-${transferId}-mer-submission`;

      const transfer: Transfer = {
        id: transferId,
        name: `${uploadedTemplate.name} - ${(filledData.swcName as string) || (filledData.applicationName as string) || primary.applicationName}`,
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
        jurisdiction: applicationData?.locations?.[0] || 'Unknown',
        entity: (filledData.swcName as string) || (filledData.applicationName as string) || primary.applicationName,
        subjectType: 'N/A',
        requirements: [
          {
            id: requirementId,
            name: `${selectedMERType || 'MER-13'} Submission Review`,
            jurisdiction: applicationData?.locations?.[0] || 'Unknown',
            entity: (filledData.swcName as string) || (filledData.applicationName as string) || primary.applicationName,
            subjectType: 'N/A',
            status: 'PENDING',
            updatedAt: new Date().toISOString(),
            transferId,
            description: `Review ${uploadedTemplate.name} submission`,
          },
        ],
        merType: selectedMERType || 'MER-13',
        merTemplateId: uploadedTemplate.id,
        merTemplateData: { ...filledData, tableData, fileData },
      };

      localStorage.setItem(`transfer_${transferId}`, JSON.stringify(transfer));
      dispatch({ type: 'SET_TRANSFER_ID', id: transferId });
      dispatch({ type: 'SET_STEP', step: 4 });
    },
    [selectedControl, uploadedTemplate, applicationData, selectedMERType]
  );

  const handleMERTemplateComplete = useCallback(
    (filledTemplate: MERTemplate) => {
      dispatch({ type: 'SET_MER_TEMPLATE', template: filledTemplate });
      if (!selectedControl) return;
      const primary = selectedControl;

      const transferId = `transfer-${primary.controlId}-${Date.now()}`;
      const templateData = extractTemplateData(filledTemplate);
      const requirementId = `req-${transferId}-mer-submission`;

      const transfer: Transfer = {
        id: transferId,
        name: `MER ${filledTemplate.merType} - ${templateData.appName || primary.applicationName}`,
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
        jurisdiction: applicationData?.locations?.[0] || 'Unknown',
        entity: templateData.appName || primary.applicationName,
        subjectType: 'N/A',
        requirements: [
          {
            id: requirementId,
            name: `${filledTemplate.merType} Submission Review`,
            jurisdiction: applicationData?.locations?.[0] || 'Unknown',
            entity: templateData.appName || primary.applicationName,
            subjectType: 'N/A',
            status: 'PENDING',
            updatedAt: new Date().toISOString(),
            transferId,
            description: `Review ${filledTemplate.merType} template submission`,
          },
        ],
        merType: filledTemplate.merType,
        merTemplateId: filledTemplate.id,
        merTemplateData: templateData,
      };

      localStorage.setItem(`transfer_${transferId}`, JSON.stringify(transfer));
      dispatch({ type: 'SET_TRANSFER_ID', id: transferId });
      dispatch({ type: 'SET_STEP', step: 4 });
    },
    [selectedControl, applicationData]
  );

  const handleQuestionnaireComplete = useCallback(
    (data: Partial<FormData>) => {
      dispatch({ type: 'SET_QUESTIONNAIRE_DATA', data });

      if (selectedControl && !currentTransferId) {
        const primary = selectedControl;
        const transferId = `transfer-${primary.controlId}-${Date.now()}`;

        let entity = '';
        if (data.entities) {
          if (Array.isArray(data.entities)) {
            entity = data.entities[0] || '';
          } else {
            const entitiesByCountry = data.entities as Record<string, string[]>;
            const firstCountry = data.countries?.[0] || '';
            entity = entitiesByCountry[firstCountry]?.[0] || firstCountry;
          }
        }

        const transfer: Transfer = {
          id: transferId,
          name: `Data Transfer - ${primary.applicationName}`,
          createdBy: 'current-user',
          createdAt: new Date().toISOString(),
          status: 'ACTIVE',
          jurisdiction: data.countries?.[0] || '',
          entity,
          subjectType: Array.isArray(data.dataSubjectType)
            ? data.dataSubjectType[0]
            : data.dataSubjectType
              ? String(data.dataSubjectType)
              : '',
          requirements: [],
        };

        localStorage.setItem(`transfer_${transferId}`, JSON.stringify(transfer));
        dispatch({ type: 'SET_TRANSFER_ID', id: transferId });
      }

      dispatch({ type: 'SET_STEP', step: 4 });
    },
    [selectedControl, currentTransferId]
  );

  const handleEvidenceUploaded = useCallback((rowId: string, actionIndex: number, evidence: Evidence) => {
    const key = `${rowId}-${actionIndex}`;
    dispatch({ type: 'ADD_EVIDENCE', key, evidence });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedControl || !currentTransferId || isSubmitted) return;
    const primary = selectedControl;
    if (!isMERControl && !questionnaireData) return;

    dispatch({ type: 'SET_SUBMITTING', value: true });

    try {
      const storedTransfer = localStorage.getItem(`transfer_${currentTransferId}`);
      if (storedTransfer) {
        const transfer: Transfer = JSON.parse(storedTransfer);
        if (transfer.requirements?.length) {
          transfer.requirements = transfer.requirements.map(req => ({
            ...req,
            status: req.status === 'PENDING' ? 'UNDER_REVIEW' : req.status,
            updatedAt: new Date().toISOString(),
          }));

          if (isMERControl) {
            const virtualEvidence: Evidence = {
              id: `evidence-mer-${transfer.id}`,
              requirementId: transfer.id,
              filename: `${transfer.merType || 'MER'} Template Submission`,
              size: 0,
              uploadedBy: 'current-user',
              uploadedAt: new Date().toISOString(),
              status: 'UNDER_REVIEW',
              fileType: 'PDF',
              description: `${transfer.name} - Review template data and attached evidence`,
              merTransferId: transfer.id,
            };
            localStorage.setItem(`evidence_${virtualEvidence.id}`, JSON.stringify(virtualEvidence));
          }
        }
        transfer.status = 'ACTIVE';
        localStorage.setItem(`transfer_${currentTransferId}`, JSON.stringify(transfer));
      }

      const requestType = isMERControl ? `MER ${selectedMERType}` : 'Data Transfer';
      const controlLabel =
        selectedControls.length > 1
          ? `${selectedControls.length} controls (${selectedControls.map(c => c.controlId).join(', ')})`
          : `${primary.applicationName} (${primary.controlId})`;

      createNotifications([
        {
          message: `Your ${requestType} request #${currentTransferId} has been submitted.`,
          recipient: 'End User',
          type: 'submit_request',
          requestId: currentTransferId,
          sender: 'system',
        },
        {
          message: `${requestType} request #${currentTransferId} submitted by End User for ${controlLabel}.`,
          recipient: 'Admin',
          type: 'submit_request',
          requestId: currentTransferId,
          sender: 'system',
        },
      ]);

      dispatch({ type: 'SUBMIT_SUCCESS' });
      rememberControlUsage(selectedControls.map(c => c.controlId));
      showToast(`${requestType} request submitted successfully!`, 'success');
      onAfterSubmitSuccess?.();
    } catch (error) {
      console.error('Failed to submit transfer:', error);
      showToast('Failed to submit request. Please try again.', 'error');
      dispatch({ type: 'SET_SUBMITTING', value: false });
    }
  }, [
    selectedControl,
    currentTransferId,
    isSubmitted,
    isMERControl,
    questionnaireData,
    selectedMERType,
    selectedControls,
    showToast,
    onAfterSubmitSuccess,
  ]);

  return {
    state,
    dispatch,
    selectedControl,
    selectedControls,
    isMERControl,
    selectedMERType,
    applicationData,
    merTemplate,
    uploadedTemplate,
    questionnaireData,
    uploadedEvidence,
    currentTransferId,
    currentStep,
    isSubmitted,
    isSubmitting,
    setSelectedControls,
    handleControlContinue,
    handleMERTypeSelect,
    handleApplicationDataFetched,
    handleApplicationDataContinue,
    handlePDFTemplateComplete,
    handleMERTemplateComplete,
    handleQuestionnaireComplete,
    handleEvidenceUploaded,
    handleSubmit,
  };
}

export type MerWorkflowEngine = ReturnType<typeof useMerWorkflowState>;
