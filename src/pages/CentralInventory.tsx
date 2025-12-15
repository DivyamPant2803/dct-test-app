import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FiLayers, FiFileText, FiClipboard, FiUpload } from 'react-icons/fi';
import { ControlMetadata } from '../services/controlService';
import { FormData } from '../App';
import { Evidence, Transfer } from '../types/index';
import ControlSelector from '../components/CentralInventory/ControlSelector';
import TransferDetails from '../components/CentralInventory/TransferDetails';
import InventoryQuestionnaire from '../components/CentralInventory/InventoryQuestionnaire';
import EvidenceUploadList from '../components/CentralInventory/EvidenceUploadList';
import { createNotifications } from '../services/notificationService';
import { WorkflowStepper, WorkflowStep, useToast } from '../components/common';
import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';

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
  const [questionnaireData, setQuestionnaireData] = useState<Partial<FormData> | null>(null);
  const [uploadedEvidence, setUploadedEvidence] = useState<Map<string, Evidence>>(new Map());
  const [currentTransferId, setCurrentTransferId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleControlSelect = (control: ControlMetadata) => {
    setSelectedControl(control);
    setCurrentStep(1); // Move to Transfer Details step
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
  const canSubmit = selectedControl && questionnaireData && hasUploadedEvidence && !isSubmitted;

  const handleSubmit = async () => {
    if (!canSubmit || !selectedControl || !questionnaireData || !currentTransferId) return;

    setIsSubmitting(true);
    try {
      // Transfer already created when questionnaire was completed
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
      createNotifications([
        {
          message: `Your Data Transfer request #${currentTransferId} has been submitted.`,
          recipient: 'End User',
          type: 'submit_request',
          requestId: currentTransferId,
          sender: 'system',
        },
        {
          message: `Data Transfer request #${currentTransferId} submitted by End User for ${selectedControl.applicationName} (${selectedControl.controlId}).`,
          recipient: 'Admin',
          type: 'submit_request',
          requestId: currentTransferId,
          sender: 'system',
        },
      ]);

      setIsSubmitted(true);
      showToast(
        `Transfer request #${currentTransferId} submitted successfully!`,
        'success'
      );
    } catch (error) {
      console.error('Failed to submit transfer:', error);
      showToast('Failed to submit transfer. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define workflow steps
  const workflowSteps: WorkflowStep[] = useMemo(() => [
    {
      id: 'control',
      label: 'Select Control',
      icon: <FiLayers />,
      completed: !!selectedControl,
      current: currentStep === 0,
      onClick: () => setCurrentStep(0),
    },
    {
      id: 'details',
      label: 'Transfer Details',
      icon: <FiFileText />,
      completed: !!selectedControl && currentStep > 1,
      current: currentStep === 1,
      onClick: () => selectedControl && setCurrentStep(1),
    },
    {
      id: 'questionnaire',
      label: 'Questionnaire',
      icon: <FiClipboard />,
      completed: !!questionnaireData,
      current: currentStep === 2 || (currentStep > 2 && !questionnaireData),
      onClick: () => selectedControl && setCurrentStep(2),
    },
    {
      id: 'evidence',
      label: 'Evidence Upload',
      icon: <FiUpload />,
      completed: uploadedEvidence.size > 0 && currentStep > 3,
      current: currentStep === 3,
      onClick: () => questionnaireData && setCurrentStep(3),
    },
  ], [selectedControl, questionnaireData, uploadedEvidence.size, currentStep]);

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

      {/* Step 2: Transfer Details */}
      {selectedControl && (
        <StepSection $isActive={currentStep === 1}>
          <StepTitle>
            <FiFileText />
            Transfer Details
          </StepTitle>
          <StepContent>
            <TransferDetails control={selectedControl} />
          </StepContent>
        </StepSection>
      )}

      {/* Step 3: Questionnaire */}
      {selectedControl && (
        <StepSection $isActive={currentStep === 2}>
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
      )}

      {/* Step 4: Evidence Upload */}
      {questionnaireData && (
        <StepSection $isActive={currentStep === 3}>
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

      {canSubmit && (
        <SubmitButton
          $disabled={isSubmitting || isSubmitted}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Submitting...' : isSubmitted ? 'Submitted ✓' : 'Submit Transfer Request'}
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

