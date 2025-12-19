import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FiLayers, FiFileText, FiClipboard, FiUpload, FiSearch, FiList } from 'react-icons/fi';
import { ControlMetadata } from '../services/controlService';
import { FormData } from '../App';
import { Evidence, Transfer, MERType, MERTemplate } from '../types/index';
import ControlSelector from '../components/CentralInventory/ControlSelector';
import TransferDetails from '../components/CentralInventory/TransferDetails';
import InventoryQuestionnaire from '../components/CentralInventory/InventoryQuestionnaire';
import EvidenceUploadList from '../components/CentralInventory/EvidenceUploadList';
import MERTypeSelector from '../components/CentralInventory/MERTypeSelector';
import ApplicationIdentificationStep from '../components/CentralInventory/ApplicationIdentificationStep';
import MERTemplateReview from '../components/CentralInventory/MERTemplateReview';
import SimpleMERUpload from '../components/CentralInventory/SimpleMERUpload';
import { createNotifications } from '../services/notificationService';
import { WorkflowStepper, WorkflowStep, useToast } from '../components/common';
import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';
import { getMERTemplate, prefillTemplateWithAppData, extractTemplateData } from '../services/merTemplateService';
import { ApplicationData } from '../services/applicationDataService';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: ${colors.background.default};
  padding: ${spacing.xl};
  overflow-y: auto;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.xl};
`;

const StepSection = styled.div<{ $isActive: boolean }>`
  background: ${colors.background.paper};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.lg};
  margin-bottom: ${spacing.lg};
  padding: ${spacing.xl};
  box-shadow: ${shadows.base};
  transition: all 0.3s ease;
  opacity: ${props => props.$isActive ? 1 : 0.6};
  
  ${props => props.$isActive && `
    border-color: ${colors.status.underReview};
    box-shadow: ${shadows.md};
  `}
`;

const StepTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.lg};
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const StepContent = styled.div`
  margin-top: ${spacing.lg};
`;

const SubmitButton = styled.button<{ $disabled: boolean }>`
  background-color: ${props => props.$disabled ? colors.neutral.gray400 : colors.neutral.black};
  color: white;
  border: none;
  padding: ${spacing.base} ${spacing.xl};
  border-radius: ${borderRadius.base};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  margin-top: ${spacing.lg};
  align-self: flex-start;
  box-shadow: ${shadows.sm};

  &:hover:not(:disabled) {
    background-color: ${colors.neutral.gray800};
    transform: translateY(-2px);
    box-shadow: ${shadows.base};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:focus {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
  }
`;

const SuccessMessage = styled.div`
  padding: ${spacing.base};
  background: ${colors.semantic.success}20;
  color: ${colors.semantic.success};
  border-radius: ${borderRadius.base};
  margin-top: ${spacing.lg};
  border: 1px solid ${colors.semantic.success}40;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const CentralInventory: React.FC = () => {
  const [selectedControl, setSelectedControl] = useState<ControlMetadata | null>(null);
  const [selectedMERType, setSelectedMERType] = useState<MERType | null>(null);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [merTemplate, setMerTemplate] = useState<MERTemplate | null>(null);
  const [questionnaireData, setQuestionnaireData] = useState<Partial<FormData> | null>(null);
  const [uploadedEvidence, setUploadedEvidence] = useState<Map<string, Evidence>>(new Map());
  const [currentTransferId, setCurrentTransferId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Check if selected control is a MER type
  const isMERControl = selectedControl?.controlType === 'MER';

  const handleControlSelect = (control: ControlMetadata) => {
    setSelectedControl(control);
    // If MER control, go to MER type selection, otherwise go to Transfer Details
    setCurrentStep(control.controlType === 'MER' ? 1 : 2);
  };

  const handleMERTypeSelect = (merType: MERType) => {
    setSelectedMERType(merType);
  };

  const handleMERTypeContinue = () => {
    if (selectedMERType) {
      setCurrentStep(2); // Move to Application Identification
    }
  };

  const handleApplicationDataComplete = (appData: ApplicationData) => {
    setApplicationData(appData);
    
    // Load and prefill MER template
    if (selectedMERType) {
      const template = getMERTemplate(selectedMERType);
      const prefilledTemplate = prefillTemplateWithAppData(template, appData);
      setMerTemplate(prefilledTemplate);
      setCurrentStep(3); // Move to MER Template Review
    }
  };

  const handleMERTemplateComplete = (filledTemplate: MERTemplate) => {
    setMerTemplate(filledTemplate);
    
    // Create transfer with MER data
    if (selectedControl) {
      const transferId = `transfer-${selectedControl.controlId}-${Date.now()}`;
      const templateData = extractTemplateData(filledTemplate);
      
      const transfer: Transfer = {
        id: transferId,
        name: `MER ${filledTemplate.merType} - ${templateData.appName || selectedControl.applicationName}`,
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
        jurisdiction: applicationData?.locations?.[0] || 'Unknown',
        entity: templateData.appName || selectedControl.applicationName,
        subjectType: 'N/A', // MER doesn't use subject types
        requirements: [],
        merType: filledTemplate.merType,
        merTemplateId: filledTemplate.id,
        merTemplateData: templateData
      };
      
      localStorage.setItem(`transfer_${transferId}`, JSON.stringify(transfer));
      setCurrentTransferId(transferId);
      setCurrentStep(4); // Move to Evidence Upload (skipping questionnaire for MER)
    }
  };

  const handleQuestionnaireComplete = (data: Partial<FormData>) => {
    setQuestionnaireData(data);
    setCurrentStep(3); // Move to Evidence Upload step
    
    // Create transfer when questionnaire is completed (before evidence upload)
    if (selectedControl && !currentTransferId) {
      const transferId = `transfer-${selectedControl.controlId}-${Date.now()}`;
      
      // Get entity - handle both object and array formats
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
        name: `Data Transfer - ${selectedControl.applicationName}`,
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
        jurisdiction: data.countries?.[0] || '',
        entity: entity,
        subjectType: Array.isArray(data.dataSubjectType) 
          ? data.dataSubjectType[0] 
          : (data.dataSubjectType ? String(data.dataSubjectType) : ''),
        requirements: []
      };
      
      // Store transfer in localStorage
      localStorage.setItem(`transfer_${transferId}`, JSON.stringify(transfer));
      setCurrentTransferId(transferId);
    }
  };

  const handleEvidenceUploaded = (rowId: string, actionIndex: number, evidence: Evidence) => {
    const key = `${rowId}-${actionIndex}`;
    setUploadedEvidence(prev => {
      const newMap = new Map(prev);
      newMap.set(key, evidence);
      return newMap;
    });
  };

  // Check if all end user actions have evidence uploaded
  // This will be calculated based on the actual table rows in EvidenceUploadList
  // For now, we'll check if there's any uploaded evidence
  const hasUploadedEvidence = uploadedEvidence.size > 0;
  
  // MER workflow: requires merTemplate and evidence
  // Non-MER workflow: requires questionnaireData and evidence
  const canSubmit = selectedControl && hasUploadedEvidence && !isSubmitted && 
    (isMERControl ? !!merTemplate : !!questionnaireData);

  const handleSubmit = async () => {
    if (!canSubmit || !selectedControl || !currentTransferId) return;
    
    // For non-MER workflows, questionnaireData is required
    if (!isMERControl && !questionnaireData) return;

    setIsSubmitting(true);
    try {
      // Transfer already created when questionnaire/template was completed
      // Update it to mark requirements as under review
      const storedTransfer = localStorage.getItem(`transfer_${currentTransferId}`);
      if (storedTransfer) {
        const transfer: Transfer = JSON.parse(storedTransfer);
        // Set all requirements to UNDER_REVIEW when transfer is submitted
        if (transfer.requirements && transfer.requirements.length > 0) {
          transfer.requirements = transfer.requirements.map(req => ({
            ...req,
            status: req.status === 'PENDING' ? 'UNDER_REVIEW' : req.status,
            updatedAt: new Date().toISOString()
          }));
        }
        // Ensure transfer status is ACTIVE (which maps to UNDER_REVIEW in TransferCard)
        transfer.status = 'ACTIVE';
        localStorage.setItem(`transfer_${currentTransferId}`, JSON.stringify(transfer));
      }

      // Create notifications using the notification service
      const requestType = isMERControl ? `MER ${selectedMERType}` : 'Data Transfer';
      createNotifications([
        {
          message: `Your ${requestType} request #${currentTransferId} has been submitted.`,
          recipient: 'End User',
          type: 'submit_request',
          requestId: currentTransferId,
          sender: 'system',
        },
        {
          message: `${requestType} request #${currentTransferId} submitted by End User for ${selectedControl.applicationName} (${selectedControl.controlId}).`,
          recipient: 'Admin',
          type: 'submit_request',
          requestId: currentTransferId,
          sender: 'system',
        },
      ]);

      setIsSubmitted(true);
      showToast(
        `${requestType} request #${currentTransferId} submitted successfully!`,
        'success'
      );
    } catch (error) {
      console.error('Failed to submit transfer:', error);
      showToast('Failed to submit request. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define workflow steps - dynamically based on control type
  const workflowSteps: WorkflowStep[] = useMemo(() => {
    const steps: WorkflowStep[] = [
      {
        id: 'control',
        label: 'Select Control',
        icon: <FiLayers />,
        completed: !!selectedControl,
        current: currentStep === 0,
        onClick: () => setCurrentStep(0),
      },
    ];

    if (isMERControl) {
      // MER workflow: Select Control → MER Type → App ID → Template → Evidence
      steps.push(
        {
          id: 'mer-type',
          label: 'MER Type',
          icon: <FiList />,
          completed: !!selectedMERType,
          current: currentStep === 1,
          onClick: () => selectedControl && setCurrentStep(1),
        },
        {
          id: 'app-id',
          label: 'Application ID',
          icon: <FiSearch />,
          completed: !!applicationData,
          current: currentStep === 2,
          onClick: () => selectedMERType && setCurrentStep(2),
        },
        {
          id: 'mer-template',
          label: 'MER Template',
          icon: <FiFileText />,
          completed: !!merTemplate && !!currentTransferId,
          current: currentStep === 3,
          onClick: () => applicationData && setCurrentStep(3),
        },
        {
          id: 'evidence',
          label: 'Evidence Upload',
          icon: <FiUpload />,
          completed: uploadedEvidence.size > 0 && currentStep > 4,
          current: currentStep === 4,
          onClick: () => merTemplate && setCurrentStep(4),
        }
      );
    } else {
      // Non-MER workflow: Select Control → Transfer Details → Questionnaire → Evidence
      steps.push(
        {
          id: 'details',
          label: 'Transfer Details',
          icon: <FiFileText />,
          completed: !!selectedControl && currentStep > 1,
          current: currentStep === 1 || currentStep === 2,
          onClick: () => selectedControl && setCurrentStep(2),
        },
        {
          id: 'questionnaire',
          label: 'Questionnaire',
          icon: <FiClipboard />,
          completed: !!questionnaireData,
          current: currentStep === 3,
          onClick: () => selectedControl && setCurrentStep(3),
        },
        {
          id: 'evidence',
          label: 'Evidence Upload',
          icon: <FiUpload />,
          completed: uploadedEvidence.size > 0 && currentStep > 3,
          current: currentStep === 4,
          onClick: () => questionnaireData && setCurrentStep(4),
        }
      );
    }

    return steps;
  }, [selectedControl, isMERControl, selectedMERType, applicationData, merTemplate, questionnaireData, uploadedEvidence.size, currentStep, currentTransferId]);

  return (
    <Container>
      <PageTitle>Central Inventory</PageTitle>

      <WorkflowStepper 
        steps={workflowSteps} 
        currentStep={currentStep}
        onStepClick={setCurrentStep}
      />

      {/* Step 1: Select Control */}
      <StepSection $isActive={currentStep === 0}>
        <StepTitle>
          <FiLayers />
          Select Control
          {selectedControl && <span style={{ color: colors.status.approved, marginLeft: spacing.sm }}>✓</span>}
        </StepTitle>
        <StepContent>
          <ControlSelector
            selectedControl={selectedControl}
            onSelect={handleControlSelect}
          />
        </StepContent>
      </StepSection>

      {/* MER Workflow Steps */}
      {isMERControl && selectedControl && (
        <>
          {/* Step 1: MER Type Selection */}
          <StepSection $isActive={currentStep === 1}>
            <StepTitle>
              <FiList />
              Select MER Type
              {selectedMERType && <span style={{ color: colors.status.approved, marginLeft: spacing.sm }}>✓</span>}
            </StepTitle>
            <StepContent>
              <MERTypeSelector
                selectedMERType={selectedMERType}
                onSelect={handleMERTypeSelect}
                onContinue={handleMERTypeContinue}
              />
            </StepContent>
          </StepSection>

          {/* Step 2: Application Identification */}
          {selectedMERType && (
            <StepSection $isActive={currentStep === 2}>
              <StepTitle>
                <FiSearch />
                Application Identification
                {applicationData && <span style={{ color: colors.status.approved, marginLeft: spacing.sm }}>✓</span>}
              </StepTitle>
              <StepContent>
                <ApplicationIdentificationStep
                  onComplete={handleApplicationDataComplete}
                />
              </StepContent>
            </StepSection>
          )}

          {/* Step 3: MER Template Review */}
          {applicationData && merTemplate && (
            <StepSection $isActive={currentStep === 3}>
              <StepTitle>
                <FiFileText />
                MER Template - {selectedMERType}
                {currentTransferId && <span style={{ color: colors.status.approved, marginLeft: spacing.sm }}>✓</span>}
              </StepTitle>
              <StepContent>
                <MERTemplateReview
                  template={merTemplate}
                  onContinue={handleMERTemplateComplete}
                />
              </StepContent>
            </StepSection>
          )}

          {/* Step 4: Evidence Upload (MER) */}
          {currentTransferId && (
            <StepSection $isActive={currentStep === 4}>
              <StepTitle>
                <FiUpload />
                Evidence Uploads
                {uploadedEvidence.size > 0 && (
                  <span style={{ color: colors.status.approved, marginLeft: spacing.sm }}>
                    ✓ {uploadedEvidence.size} file{uploadedEvidence.size > 1 ? 's' : ''} uploaded
                  </span>
                )}
              </StepTitle>
              <StepContent>
                <SimpleMERUpload
                  transferId={currentTransferId}
                  onEvidenceUploaded={handleEvidenceUploaded}
                  uploadedEvidence={uploadedEvidence}
                />
              </StepContent>
            </StepSection>
          )}
        </>
      )}

      {/* Non-MER Workflow Steps */}
      {!isMERControl && selectedControl && (
        <>
          {/* Step 1-2: Transfer Details (shown but skipped) */}
          <StepSection $isActive={currentStep === 1 || currentStep === 2}>
            <StepTitle>
              <FiFileText />
              Transfer Details
            </StepTitle>
            <StepContent>
              <TransferDetails control={selectedControl} />
            </StepContent>
          </StepSection>

          {/* Step 3: Questionnaire */}
          <StepSection $isActive={currentStep === 3}>
            <StepTitle>
              <FiClipboard />
              Questionnaire
              {questionnaireData && <span style={{ color: colors.status.approved, marginLeft: spacing.sm }}>✓</span>}
            </StepTitle>
            <StepContent>
              <InventoryQuestionnaire
                onComplete={handleQuestionnaireComplete}
                questionnaireData={questionnaireData}
              />
            </StepContent>
          </StepSection>

          {/* Step 4: Evidence Upload (Non-MER) */}
          {questionnaireData && (
            <StepSection $isActive={currentStep === 4}>
              <StepTitle>
                <FiUpload />
                Evidence Uploads
                {uploadedEvidence.size > 0 && (
                  <span style={{ color: colors.status.approved, marginLeft: spacing.sm }}>
                    ✓ {uploadedEvidence.size} file{uploadedEvidence.size > 1 ? 's' : ''} uploaded
                  </span>
                )}
              </StepTitle>
              <StepContent>
                <EvidenceUploadList
                  questionnaireData={questionnaireData}
                  transferId={currentTransferId}
                  onEvidenceUploaded={handleEvidenceUploaded}
                  uploadedEvidence={uploadedEvidence}
                />
              </StepContent>
            </StepSection>
          )}
        </>
      )}

      {canSubmit && (
        <SubmitButton
          $disabled={isSubmitting || isSubmitted}
          onClick={handleSubmit}
        >
          {isSubmitting 
            ? 'Submitting...' 
            : isSubmitted 
              ? 'Submitted ✓' 
              : isMERControl 
                ? `Submit MER ${selectedMERType}` 
                : 'Submit Transfer Request'}
        </SubmitButton>
      )}

      {isSubmitted && (
        <SuccessMessage>
          <span>✓</span>
          <span>Transfer request submitted successfully! You will receive a notification when the admin reviews your evidence.</span>
        </SuccessMessage>
      )}
    </Container>
  );
};

export default CentralInventory;

