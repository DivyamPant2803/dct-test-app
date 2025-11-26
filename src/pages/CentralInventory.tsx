import React, { useState } from 'react';
import styled from 'styled-components';
import { ControlMetadata } from '../services/controlService';
import { FormData } from '../App';
import { Evidence, Transfer } from '../types/index';
import ControlSelector from '../components/CentralInventory/ControlSelector';
import TransferDetails from '../components/CentralInventory/TransferDetails';
import InventoryQuestionnaire from '../components/CentralInventory/InventoryQuestionnaire';
import EvidenceUploadList from '../components/CentralInventory/EvidenceUploadList';
import { createNotifications } from '../services/notificationService';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  padding: 2rem;
  overflow-y: auto;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 2rem;
`;

const AccordionSection = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  overflow: hidden;
`;

const AccordionHeader = styled.button<{ $isExpanded: boolean }>`
  width: 100%;
  padding: 1.25rem 1.5rem;
  background: ${props => props.$isExpanded ? '#f8f8f8' : 'white'};
  border: none;
  border-bottom: ${props => props.$isExpanded ? '1px solid #e0e0e0' : 'none'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f8f8;
  }
`;

const AccordionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
  margin: 0;
`;

const AccordionIcon = styled.span<{ $isExpanded: boolean }>`
  font-size: 1.2rem;
  color: #666;
  transition: transform 0.2s ease;
  transform: ${props => props.$isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const AccordionContent = styled.div`
  padding: 1.5rem;
`;

const SubmitButton = styled.button<{ $disabled: boolean }>`
  background-color: ${props => props.$disabled ? '#ccc' : '#000'};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
  margin-top: 1.5rem;
  align-self: flex-start;

  &:hover:not(:disabled) {
    background-color: #333;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const SuccessMessage = styled.div`
  padding: 1rem;
  background: #d4edda;
  color: #155724;
  border-radius: 4px;
  margin-top: 1rem;
  border: 1px solid #c3e6cb;
`;

const CentralInventory: React.FC = () => {
  const [selectedControl, setSelectedControl] = useState<ControlMetadata | null>(null);
  const [questionnaireData, setQuestionnaireData] = useState<Partial<FormData> | null>(null);
  const [uploadedEvidence, setUploadedEvidence] = useState<Map<string, Evidence>>(new Map());
  const [currentTransferId, setCurrentTransferId] = useState<string | null>(null);
  const [isControlExpanded, setIsControlExpanded] = useState(true);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isQuestionnaireExpanded, setIsQuestionnaireExpanded] = useState(false);
  const [isEvidenceExpanded, setIsEvidenceExpanded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleControlSelect = (control: ControlMetadata) => {
    setSelectedControl(control);
    setIsDetailsExpanded(true);
    setIsQuestionnaireExpanded(true);
  };

  const handleQuestionnaireComplete = (data: Partial<FormData>) => {
    setQuestionnaireData(data);
    setIsEvidenceExpanded(true);
    
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
      // Just update it if needed
      const storedTransfer = localStorage.getItem(`transfer_${currentTransferId}`);
      if (storedTransfer) {
        const transfer: Transfer = JSON.parse(storedTransfer);
        // Update transfer with any final details if needed
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
    } catch (error) {
      console.error('Failed to submit transfer:', error);
      alert('Failed to submit transfer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <PageTitle>Central Inventory</PageTitle>

      <AccordionSection>
        <AccordionHeader 
          $isExpanded={isControlExpanded}
          onClick={() => setIsControlExpanded(!isControlExpanded)}
        >
          <AccordionTitle>
            Select Control {selectedControl && '✓'}
          </AccordionTitle>
          <AccordionIcon $isExpanded={isControlExpanded}>▼</AccordionIcon>
        </AccordionHeader>
        {isControlExpanded && (
          <AccordionContent>
            <ControlSelector
              selectedControl={selectedControl}
              onSelect={handleControlSelect}
            />
          </AccordionContent>
        )}
      </AccordionSection>

      {selectedControl && (
        <AccordionSection>
          <AccordionHeader 
            $isExpanded={isDetailsExpanded}
            onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
          >
            <AccordionTitle>Transfer Details</AccordionTitle>
            <AccordionIcon $isExpanded={isDetailsExpanded}>▼</AccordionIcon>
          </AccordionHeader>
          {isDetailsExpanded && (
            <AccordionContent>
              <TransferDetails control={selectedControl} />
            </AccordionContent>
          )}
        </AccordionSection>
      )}

      {selectedControl && (
        <AccordionSection>
          <AccordionHeader 
            $isExpanded={isQuestionnaireExpanded}
            onClick={() => setIsQuestionnaireExpanded(!isQuestionnaireExpanded)}
          >
            <AccordionTitle>Questionnaire</AccordionTitle>
            <AccordionIcon $isExpanded={isQuestionnaireExpanded}>▼</AccordionIcon>
          </AccordionHeader>
          {isQuestionnaireExpanded && (
            <AccordionContent>
              <InventoryQuestionnaire
                onComplete={handleQuestionnaireComplete}
                questionnaireData={questionnaireData}
              />
            </AccordionContent>
          )}
        </AccordionSection>
      )}

      {questionnaireData && (
        <AccordionSection>
          <AccordionHeader 
            $isExpanded={isEvidenceExpanded}
            onClick={() => setIsEvidenceExpanded(!isEvidenceExpanded)}
          >
            <AccordionTitle>Evidence Uploads</AccordionTitle>
            <AccordionIcon $isExpanded={isEvidenceExpanded}>▼</AccordionIcon>
          </AccordionHeader>
          {isEvidenceExpanded && (
            <AccordionContent>
              <EvidenceUploadList
                questionnaireData={questionnaireData}
                transferId={currentTransferId}
                onEvidenceUploaded={handleEvidenceUploaded}
                uploadedEvidence={uploadedEvidence}
              />
            </AccordionContent>
          )}
        </AccordionSection>
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
          Transfer request submitted successfully! You will receive a notification when the admin reviews your evidence.
        </SuccessMessage>
      )}
    </Container>
  );
};

export default CentralInventory;

