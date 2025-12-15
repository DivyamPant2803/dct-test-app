import { useState, useCallback } from 'react';
import { RequirementRow, Evidence, ReviewDecision, AuditEntry, Transfer, RequirementStatus } from '../types/index';
import { createNotifications } from '../services/notificationService';

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

    // Check if requirementId already contains a transferId (from Central Inventory)
    // Pattern: req-transfer-xxx-... means evidence is already linked to a transfer
    const hasExistingTransferId = requirementId.includes('req-transfer-');
    
    // If uploading from Central Inventory, update the existing transfer's requirements
    if (hasExistingTransferId && entityName && country && legalRequirement) {
      // Find the transfer by checking if requirementId starts with req-{transferId}
      const storedTransfers = getStoredTransfers();
      const existingTransfer = storedTransfers.find(t => 
        requirementId.startsWith(`req-${t.id}-`)
      );
      
      if (existingTransfer) {
        // Check if requirement already exists
        const existingRequirement = existingTransfer.requirements.find((r: RequirementRow) => r.id === requirementId);
        
        if (!existingRequirement) {
          // Add new requirement to the transfer
          const newRequirement: RequirementRow = {
            id: requirementId,
            name: legalRequirement || 'End User Action',
            jurisdiction: country,
            entity: entityName,
            subjectType: existingTransfer.subjectType || 'Client',
            status: 'PENDING',
            updatedAt: new Date().toISOString(),
            transferId: existingTransfer.id,
            description: description
          };
          
          existingTransfer.requirements.push(newRequirement);
          
          // Update transfer in localStorage
          localStorage.setItem(`transfer_${existingTransfer.id}`, JSON.stringify(existingTransfer));
          
          // Update transfers state
          setTransfers(prev => prev.map(t => t.id === existingTransfer.id ? existingTransfer : t));
        }
      }
    }
    
    // Only create/update transfer record if uploading from Guidance page
    // (not from Central Inventory, which already has a transfer)
    if (entityName && country && legalRequirement && !hasExistingTransferId) {
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
    
    // Extract transferId from requirementId
    // Format: req-${transferId}-${row.id}-action-${actionIndex}-${Date.now()}
    // We need to find which transfer this requirement belongs to
    let transferId: string | null = null;
    const storedTransfers = getStoredTransfers();
    
    // Try to find the transfer by matching the requirementId prefix
    // The requirementId starts with req-${transferId}-
    for (const transfer of storedTransfers) {
      const prefix = `req-${transfer.id}-`;
      if (requirementId.startsWith(prefix)) {
        transferId = transfer.id;
        break;
      }
    }
    
    // If not found by prefix, try the old format: req-entity-country
    if (!transferId) {
      // Fallback: try to extract by replacing req- with transfer-
      const potentialTransferId = requirementId.replace('req-', 'transfer-');
      const potentialTransfer = storedTransfers.find(t => t.id === potentialTransferId);
      if (potentialTransfer) {
        transferId = potentialTransferId;
      }
    }
    
    // Find and update the transfer's requirement
    if (transferId) {
      const transferKey = `transfer_${transferId}`;
      const storedTransfer = localStorage.getItem(transferKey);
      if (storedTransfer) {
        const transfer = JSON.parse(storedTransfer);
        const requirementIndex = transfer.requirements.findIndex((req: RequirementRow) => req.id === requirementId);
        if (requirementIndex !== -1) {
          transfer.requirements[requirementIndex].status = newStatus;
          transfer.requirements[requirementIndex].updatedAt = new Date().toISOString();
          
          // Update transfer status based on requirements status
          // If all requirements are approved, set transfer status to COMPLETED
          // If any requirement is rejected, keep status as ACTIVE (or could be REJECTED)
          // If any requirement is under review, set status to ACTIVE
          const allApproved = transfer.requirements.every((req: RequirementRow) => req.status === 'APPROVED');
          const hasRejected = transfer.requirements.some((req: RequirementRow) => req.status === 'REJECTED');
          const hasEscalated = transfer.requirements.some((req: RequirementRow) => req.status === 'ESCALATED');
          const hasUnderReview = transfer.requirements.some((req: RequirementRow) => req.status === 'UNDER_REVIEW');
          
          if (hasEscalated) {
            transfer.escalatedTo = decision.escalatedTo || 'Legal';
            transfer.escalatedAt = new Date().toISOString();
            transfer.isHighPriority = true;
          }
          
          // Update transfer status based on requirements
          if (allApproved && transfer.requirements.length > 0) {
            transfer.status = 'COMPLETED';
          } else if (hasUnderReview || hasRejected || hasEscalated) {
            transfer.status = 'ACTIVE';
          }
          
          localStorage.setItem(transferKey, JSON.stringify(transfer));
          
          // Update transfers state
          setTransfers(prev => prev.map(t => t.id === transfer.id ? transfer : t));
          
          console.log('Updated requirement status:', {
            requirementId,
            transferId,
            newStatus,
            requirement: transfer.requirements[requirementIndex],
            transferStatus: transfer.status
          });
        } else {
          console.log('Requirement not found:', {
            requirementId,
            transferId,
            availableRequirements: transfer.requirements.map((r: any) => r.id)
          });
        }
      } else {
        console.log('Transfer not found:', transferKey);
      }
    } else {
      console.log('Could not extract transferId from requirementId:', requirementId);
    }
    
    // Create notifications based on decision
    const notifications = [];
    const requestId = transferId || currentEvidence.requirementId;
    
    if (decision.decision === 'APPROVE') {
      notifications.push({
        message: `Your Data Transfer request #${requestId} has been approved.`,
        recipient: 'End User' as const,
        type: 'approve' as const,
        requestId,
        sender: 'system',
      });
    } else if (decision.decision === 'REJECT') {
      notifications.push({
        message: `Your Data Transfer request #${requestId} has been rejected.`,
        recipient: 'End User' as const,
        type: 'reject' as const,
        requestId,
        sender: 'system',
      });
    } else if (decision.decision === 'ESCALATE') {
      notifications.push({
        message: `Your Data Transfer request #${requestId} has been escalated for review.`,
        recipient: 'End User' as const,
        type: 'escalate' as const,
        requestId,
        sender: 'system',
      });
      // Also notify Legal when escalated
      notifications.push({
        message: `Data Transfer request #${requestId} has been escalated to Legal for review.`,
        recipient: 'Legal' as const,
        type: 'escalate' as const,
        requestId,
        sender: 'system',
      });
    }
    
    if (notifications.length > 0) {
      createNotifications(notifications);
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

  const escalateTransfer = useCallback(async (
    transferId: string,
    escalationReason?: string
  ): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get the transfer from localStorage
    const transferKey = `transfer_${transferId}`;
    const storedTransfer = localStorage.getItem(transferKey);
    
    if (!storedTransfer) {
      throw new Error('Transfer not found');
    }
    
    const transfer: Transfer = JSON.parse(storedTransfer);
    
    // Update transfer with escalation details
    const updatedTransfer: Transfer = {
      ...transfer,
      escalatedTo: 'Admin',
      escalatedBy: 'End User',
      escalatedAt: new Date().toISOString(),
      isHighPriority: true,
      escalationReason: escalationReason || 'SLA breach or approaching breach',
      status: 'PENDING' // Set status to PENDING when escalated
    };
    
    // Update all requirements in the transfer to ESCALATED status
    updatedTransfer.requirements = transfer.requirements.map(req => ({
      ...req,
      status: 'ESCALATED' as RequirementStatus,
      updatedAt: new Date().toISOString()
    }));
    
    // Update transfer in localStorage
    localStorage.setItem(transferKey, JSON.stringify(updatedTransfer));
    
    // Update state
    setTransfers(prev => prev.map(t => t.id === transferId ? updatedTransfer : t));
    
    // Also update related evidence to ESCALATED status
    const storedEvidence = getStoredEvidence();
    const relatedEvidence = storedEvidence.filter(e => 
      e.requirementId.includes(transferId) || 
      transfer.requirements.some(req => e.requirementId.includes(req.id))
    );
    
    relatedEvidence.forEach(evidence => {
      const updatedEvidence: Evidence = {
        ...evidence,
        status: 'ESCALATED',
        escalatedTo: 'Admin',
        escalatedBy: 'End User',
        escalatedAt: new Date().toISOString(),
        escalationReason: escalationReason || 'SLA breach or approaching breach'
      };
      localStorage.setItem(`evidence_${evidence.id}`, JSON.stringify(updatedEvidence));
    });
    
    // Update evidence state
    setEvidence(prev => prev.map(e => {
      const related = relatedEvidence.find(rel => rel.id === e.id);
      if (related) {
        return {
          ...e,
          status: 'ESCALATED',
          escalatedTo: 'Admin',
          escalatedBy: 'End User',
          escalatedAt: new Date().toISOString(),
          escalationReason: escalationReason || 'SLA breach or approaching breach'
        };
      }
      return e;
    }));
    
    // Create audit trail entry
    const auditEntry: AuditEntry = {
      id: `audit-${Date.now()}`,
      requirementId: transfer.requirements[0]?.id || transferId,
      action: 'ESCALATED',
      performedBy: 'End User',
      performedAt: new Date().toISOString(),
      note: escalationReason || 'Transfer escalated due to SLA breach or approaching breach',
      previousStatus: transfer.requirements[0]?.status || 'PENDING',
      newStatus: 'ESCALATED'
    };
    
    localStorage.setItem(`audit_${auditEntry.id}`, JSON.stringify(auditEntry));
    
    // Create notification for Admin
    createNotifications([{
      message: `Transfer request #${transferId} has been escalated by End User. Priority: High`,
      recipient: 'Admin' as const,
      type: 'escalate' as const,
      requestId: transferId,
      sender: 'End User',
    }]);
    
    console.log('Transfer escalated:', updatedTransfer);
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
    previewEvidence,
    escalateTransfer
  };
};
