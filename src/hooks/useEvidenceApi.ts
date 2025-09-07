import { useState, useCallback } from 'react';
import { RequirementRow, Evidence, ReviewDecision, AuditEntry, Transfer, RequirementStatus } from '../types/index';

// Helper functions for localStorage + FileReader
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

// Get stored evidence from localStorage
const getStoredEvidence = (): Evidence[] => {
  const evidence: Evidence[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('evidence_')) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          evidence.push(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error parsing stored evidence:', error);
      }
    }
  }
  return evidence;
};

// Get stored transfers from localStorage
const getStoredTransfers = (): Transfer[] => {
  const transfers: Transfer[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('transfer_')) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          transfers.push(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error parsing stored transfer:', error);
      }
    }
  }
  return transfers;
};

export const useEvidenceApi = () => {
  const [transfers, setTransfers] = useState<Transfer[]>(getStoredTransfers());
  const [evidence, setEvidence] = useState<Evidence[]>(getStoredEvidence());

  const getTransfers = useCallback(async (): Promise<Transfer[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    // Read fresh data from localStorage instead of stale state
    return getStoredTransfers();
  }, []);

  const getTransferRequirements = useCallback(async (transferId: string): Promise<RequirementRow[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Read fresh data from localStorage
    const storedTransfers = getStoredTransfers();
    const transfer = storedTransfers.find(t => t.id === transferId);
    return transfer?.requirements || [];
  }, []);

  const uploadEvidence = useCallback(async (
    file: File,
    requirementId: string,
    description: string,
    entityName?: string,
    country?: string,
    legalRequirement?: string
  ): Promise<Evidence> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Convert file to base64 for storage
    const base64Data = await fileToBase64(file);
    
    const newEvidence: Evidence = {
      id: `evidence-${Date.now()}`,
      requirementId,
      filename: file.name,
      size: file.size,
      uploadedBy: 'current-user',
      uploadedAt: new Date().toISOString(),
      status: 'PENDING',
      fileType: file.name.split('.').pop()?.toUpperCase() as 'PDF' | 'DOC' | 'XLS',
      description,
      base64Data // Store the actual file data
    };

    // Create or update transfer record if uploading from Guidance page
    if (entityName && country && legalRequirement) {
      const transferId = `transfer-${entityName.replace(/\s+/g, '-').toLowerCase()}-${country.replace(/\s+/g, '-').toLowerCase()}`;
      
      // Check if transfer already exists
      let existingTransfer = transfers.find(t => t.id === transferId);
      
      if (!existingTransfer) {
        // Create new transfer
        const newTransfer: Transfer = {
          id: transferId,
          name: `Evidence Upload - ${entityName} (${country})`,
          createdBy: 'current-user',
          createdAt: new Date().toISOString(),
          status: 'ACTIVE',
          jurisdiction: country,
          entity: entityName,
          subjectType: 'Client', // Default, could be made dynamic
          requirements: [{
            id: requirementId,
            name: 'Legal Requirement Evidence',
            jurisdiction: country,
            entity: entityName,
            subjectType: 'Client',
            status: 'PENDING',
            updatedAt: new Date().toISOString(),
            transferId: transferId,
            description: legalRequirement
          }]
        };
        
        // Store transfer in localStorage
        localStorage.setItem(`transfer_${transferId}`, JSON.stringify(newTransfer));
        setTransfers(prev => [...prev, newTransfer]);
      } else {
        // Update existing transfer with new requirement if needed
        const existingRequirement = existingTransfer.requirements.find((r: RequirementRow) => r.id === requirementId);
        if (!existingRequirement) {
          existingTransfer.requirements.push({
            id: requirementId,
            name: 'Legal Requirement Evidence',
            jurisdiction: country,
            entity: entityName,
            subjectType: 'Client',
            status: 'PENDING',
            updatedAt: new Date().toISOString(),
            transferId: transferId,
            description: legalRequirement
          });
          
          // Update transfer in localStorage
          localStorage.setItem(`transfer_${transferId}`, JSON.stringify(existingTransfer));
        }
      }
    }

    // Store evidence in localStorage
    localStorage.setItem(`evidence_${newEvidence.id}`, JSON.stringify(newEvidence));
    
    // Add evidence to state
    setEvidence(prev => [...prev, newEvidence]);
    
    console.log('Uploading evidence:', newEvidence);
    
    return newEvidence;
  }, [transfers]);

  const getEvidenceQueue = useCallback(async (): Promise<Evidence[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Read fresh data from localStorage and filter
    const storedEvidence = getStoredEvidence();
    return storedEvidence.filter(e => e.status === 'PENDING' || e.status === 'UNDER_REVIEW');
  }, []);

  const getAllEvidence = useCallback(async (): Promise<Evidence[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Read fresh data from localStorage
    return getStoredEvidence();
  }, []);

  const submitReviewDecision = useCallback(async (decision: ReviewDecision): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the evidence to update
    const evidenceIndex = evidence.findIndex(e => e.id === decision.evidenceId);
    if (evidenceIndex === -1) {
      throw new Error('Evidence not found');
    }
    
    const currentEvidence = evidence[evidenceIndex];
    const previousStatus = currentEvidence.status;
    
    // Determine new status based on decision
    let newStatus: RequirementStatus;
    switch (decision.decision) {
      case 'APPROVE':
        newStatus = 'APPROVED';
        break;
      case 'REJECT':
        newStatus = 'REJECTED';
        break;
      case 'ESCALATE':
        newStatus = 'ESCALATED';
        break;
      default:
        throw new Error('Invalid decision type');
    }
    
    // Update evidence with new status and review details
    const updatedEvidence: Evidence = {
      ...currentEvidence,
      status: newStatus,
      reviewerNote: decision.note,
      reviewerId: 'current-admin', // In a real app, this would be the actual admin ID
      reviewedAt: new Date().toISOString()
    };
    
    // Update localStorage
    localStorage.setItem(`evidence_${updatedEvidence.id}`, JSON.stringify(updatedEvidence));
    
    // Update state
    setEvidence(prev => prev.map(e => e.id === updatedEvidence.id ? updatedEvidence : e));
    
    // Create audit trail entry
    const auditEntry: AuditEntry = {
      id: `audit-${Date.now()}`,
      requirementId: currentEvidence.requirementId,
      action: decision.decision === 'ESCALATE' ? 'ESCALATED' : decision.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      performedBy: 'current-admin',
      performedAt: new Date().toISOString(),
      note: decision.note,
      previousStatus,
      newStatus
    };
    
    // Store audit entry in localStorage
    localStorage.setItem(`audit_${auditEntry.id}`, JSON.stringify(auditEntry));
    
    // Update corresponding requirement status
    const requirementId = currentEvidence.requirementId;
    // Extract transferId from requirementId: req-entity-country -> transfer-entity-country
    const transferId = requirementId.replace('req-', 'transfer-');
    
    // Find and update the transfer's requirement
    const transferKey = `transfer_${transferId}`;
    const storedTransfer = localStorage.getItem(transferKey);
    if (storedTransfer) {
      const transfer = JSON.parse(storedTransfer);
      const requirementIndex = transfer.requirements.findIndex((req: RequirementRow) => req.id === requirementId);
      if (requirementIndex !== -1) {
        transfer.requirements[requirementIndex].status = newStatus;
        transfer.requirements[requirementIndex].updatedAt = new Date().toISOString();
        localStorage.setItem(transferKey, JSON.stringify(transfer));
        
        // Update transfers state
        setTransfers(prev => prev.map(t => t.id === transfer.id ? transfer : t));
        
        console.log('Updated requirement status:', {
          requirementId,
          transferId,
          newStatus,
          requirement: transfer.requirements[requirementIndex]
        });
      } else {
        console.log('Requirement not found:', {
          requirementId,
          transferId,
          availableRequirements: transfer.requirements.map(r => r.id)
        });
      }
    } else {
      console.log('Transfer not found:', transferKey);
    }
    
    console.log('Review decision submitted:', decision);
  }, [evidence]);

  const getAuditTrail = useCallback(async (requirementId: string): Promise<AuditEntry[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Get audit entries from localStorage
    const storedAuditEntries: AuditEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('audit_')) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const auditEntry = JSON.parse(stored);
            if (auditEntry.requirementId === requirementId) {
              storedAuditEntries.push(auditEntry);
            }
          }
        } catch (error) {
          console.error('Error parsing stored audit entry:', error);
        }
      }
    }
    
    // Sort by date (newest first)
    return storedAuditEntries.sort((a, b) => 
      new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
    );
  }, []);

  const deleteEvidence = useCallback(async (evidenceId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Remove from localStorage
    localStorage.removeItem(`evidence_${evidenceId}`);
    
    // Update state
    setEvidence(prev => prev.filter(e => e.id !== evidenceId));
    
    console.log('Evidence deleted:', evidenceId);
  }, []);

  const previewEvidence = useCallback((evidence: Evidence): void => {
    if (evidence.base64Data) {
      const blob = base64ToBlob(evidence.base64Data, `application/${evidence.fileType.toLowerCase()}`);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }, []);

  return {
    getTransfers,
    getTransferRequirements,
    uploadEvidence,
    getEvidenceQueue,
    getAllEvidence,
    submitReviewDecision,
    getAuditTrail,
    deleteEvidence,
    previewEvidence
  };
};
