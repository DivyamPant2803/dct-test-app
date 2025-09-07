import React, { useState, useCallback } from 'react';
import { Requirement, ChangeRequest, RequirementVersion, CRStatus } from '../types/index';

// Helper functions for localStorage
const getStoredRequirements = (): Requirement[] => {
  const requirements: Requirement[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('requirement_')) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          requirements.push(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error parsing stored requirement:', error);
      }
    }
  }
  return requirements;
};

const getStoredChangeRequests = (): ChangeRequest[] => {
  const changeRequests: ChangeRequest[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('changeRequest_')) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const cr = JSON.parse(stored);
          console.log('Found stored CR:', cr);
          changeRequests.push(cr);
        }
      } catch (error) {
        console.error('Error parsing stored change request:', error);
      }
    }
  }
  console.log('All stored change requests:', changeRequests);
  return changeRequests;
};

const getStoredRequirementVersions = (): RequirementVersion[] => {
  const versions: RequirementVersion[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('requirementVersion_')) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          versions.push(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error parsing stored requirement version:', error);
      }
    }
  }
  return versions;
};

// Helper function to create notifications
const createNotification = (type: 'new_cr' | 'cr_approved' | 'cr_rejected', data: any) => {
  const notification = {
    id: `notification-${Date.now()}`,
    sender: type === 'new_cr' ? 'Legal Team' : 'Admin',
    message: type === 'new_cr' 
      ? `New change request submitted for ${data.title}`
      : type === 'cr_approved'
      ? `Your change request for ${data.title} has been approved`
      : `Your change request for ${data.title} has been rejected`,
    timeAgo: 'just now',
    read: false,
    senderInitials: type === 'new_cr' ? 'LT' : 'AD',
    category: 'legal' as const,
  };
  
  // Store notification in localStorage
  localStorage.setItem(`notification_${notification.id}`, JSON.stringify(notification));
  return notification;
};

// Migration function to fix existing CR status values
const migrateCRStatuses = () => {
  const changeRequests = getStoredChangeRequests();
  let migrated = false;
  
  changeRequests.forEach(cr => {
    if (cr.status === 'APPROVE') {
      const updatedCR = { ...cr, status: 'APPROVED' as CRStatus };
      localStorage.setItem(`changeRequest_${cr.id}`, JSON.stringify(updatedCR));
      migrated = true;
      console.log('Migrated CR status from APPROVE to APPROVED:', cr.id);
    } else if (cr.status === 'REJECT') {
      const updatedCR = { ...cr, status: 'REJECTED' as CRStatus };
      localStorage.setItem(`changeRequest_${cr.id}`, JSON.stringify(updatedCR));
      migrated = true;
      console.log('Migrated CR status from REJECT to REJECTED:', cr.id);
    }
  });
  
  if (migrated) {
    console.log('CR status migration completed');
  }
};

export const useRequirementsApi = () => {
  const [requirements, setRequirements] = useState<Requirement[]>(getStoredRequirements());
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(getStoredChangeRequests());
  const [requirementVersions, setRequirementVersions] = useState<RequirementVersion[]>(getStoredRequirementVersions());

  // Run migration on initialization
  React.useEffect(() => {
    migrateCRStatuses();
  }, []);

  // Initialize with sample data if none exists
  const initializeSampleData = useCallback(() => {
    if (requirements.length === 0) {
      const sampleRequirements: Requirement[] = [
        {
          id: 'req-1',
          version: 1,
          title: 'GDPR Data Processing Agreement',
          jurisdiction: 'Germany',
          entity: 'Deutsche Technologie und Datendienste GmbH',
          subjectType: 'Employee',
          text: 'All personal data processing activities must comply with GDPR Article 6 (lawfulness of processing) and Article 9 (processing of special categories of personal data). Data subjects must be informed about the processing activities through clear privacy notices.',
          updatedAt: new Date().toISOString(),
          effectiveDate: new Date().toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'admin-user'
        },
        {
          id: 'req-2',
          version: 1,
          title: 'CCPA Consumer Rights Compliance',
          jurisdiction: 'United States',
          entity: 'US Global Technology Solutions Corporation',
          subjectType: 'Client',
          text: 'California consumers have the right to know what personal information is collected, used, shared, or sold. Businesses must provide clear privacy notices and honor consumer requests to delete, correct, or opt-out of the sale of personal information.',
          updatedAt: new Date().toISOString(),
          effectiveDate: new Date().toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'admin-user'
        },
        {
          id: 'req-3',
          version: 1,
          title: 'PDPA Data Protection Requirements',
          jurisdiction: 'Singapore',
          entity: 'Singapore Advanced Technology Solutions Pte Ltd',
          subjectType: 'Employee',
          text: 'Organizations must obtain consent before collecting, using, or disclosing personal data. Data subjects have the right to withdraw consent and request access to their personal data. Organizations must implement reasonable security arrangements to protect personal data.',
          updatedAt: new Date().toISOString(),
          effectiveDate: new Date().toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'admin-user'
        }
      ];

      sampleRequirements.forEach(req => {
        localStorage.setItem(`requirement_${req.id}`, JSON.stringify(req));
      });
      setRequirements(sampleRequirements);
    }
  }, [requirements.length]);

  const getRequirements = useCallback(async (filters?: {
    jurisdiction?: string[];
    entity?: string[];
    subjectType?: string[];
  }): Promise<Requirement[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Initialize sample data if needed
    initializeSampleData();
    
    const storedRequirements = getStoredRequirements();
    
    if (!filters || Object.values(filters).every(filter => !filter || filter.length === 0)) {
      return storedRequirements;
    }

    return storedRequirements.filter(req => {
      if (filters.jurisdiction && filters.jurisdiction.length > 0 && 
          !filters.jurisdiction.includes(req.jurisdiction)) {
        return false;
      }
      if (filters.entity && filters.entity.length > 0 && 
          !filters.entity.includes(req.entity)) {
        return false;
      }
      if (filters.subjectType && filters.subjectType.length > 0 && 
          !filters.subjectType.includes(req.subjectType)) {
        return false;
      }
      return true;
    });
  }, [initializeSampleData]);

  const getRequirementById = useCallback(async (id: string): Promise<Requirement | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const storedRequirements = getStoredRequirements();
    return storedRequirements.find(req => req.id === id) || null;
  }, []);

  const createChangeRequest = useCallback(async (changeRequestData: {
    requirementId: string;
    proposedText: string;
    impact: string;
    approver: string;
    title: string;
    jurisdiction: string;
    entity: string;
    subjectType: string;
  }): Promise<ChangeRequest> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const requirement = await getRequirementById(changeRequestData.requirementId);
    if (!requirement) {
      throw new Error('Requirement not found');
    }

    const newChangeRequest: ChangeRequest = {
      id: `cr-${Date.now()}`,
      requirementId: changeRequestData.requirementId,
      baseVersion: requirement.version,
      proposedText: changeRequestData.proposedText,
      impact: changeRequestData.impact,
      author: 'current-user',
      approver: changeRequestData.approver,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      title: changeRequestData.title,
      jurisdiction: changeRequestData.jurisdiction,
      entity: changeRequestData.entity,
      subjectType: changeRequestData.subjectType
    };

    // Store in localStorage
    localStorage.setItem(`changeRequest_${newChangeRequest.id}`, JSON.stringify(newChangeRequest));
    
    // Update state
    setChangeRequests(prev => [...prev, newChangeRequest]);
    
    // Create notification for admin
    createNotification('new_cr', {
      title: changeRequestData.title,
      approver: changeRequestData.approver
    });
    
    console.log('Change request created:', newChangeRequest);
    return newChangeRequest;
  }, [getRequirementById]);

  const getChangeRequests = useCallback(async (status?: CRStatus, approver?: string, author?: string): Promise<ChangeRequest[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const storedChangeRequests = getStoredChangeRequests();
    
    console.log('All stored change requests:', storedChangeRequests);
    console.log('Filtering by status:', status, 'approver:', approver, 'author:', author);
    
    let filtered = storedChangeRequests;
    
    if (status) {
      filtered = filtered.filter(cr => cr.status === status);
      console.log('After status filter:', filtered);
    }
    
    if (approver) {
      filtered = filtered.filter(cr => 
        cr.approver === approver || cr.reviewer === approver
      );
      console.log('After approver filter:', filtered);
    }
    
    if (author) {
      filtered = filtered.filter(cr => cr.author === author);
      console.log('After author filter:', filtered);
    }
    
    const result = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    console.log('Final result:', result);
    
    return result;
  }, []);

  const getChangeRequestById = useCallback(async (id: string): Promise<ChangeRequest | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const storedChangeRequests = getStoredChangeRequests();
    return storedChangeRequests.find(cr => cr.id === id) || null;
  }, []);

  const submitCRDecision = useCallback(async (crId: string, decision: 'APPROVE' | 'REJECT', note?: string, reviewer?: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const changeRequest = await getChangeRequestById(crId);
    if (!changeRequest) {
      throw new Error('Change request not found');
    }

    const updatedCR: ChangeRequest = {
      ...changeRequest,
      status: decision === 'APPROVE' ? 'APPROVED' : decision === 'REJECT' ? 'REJECTED' : decision,
      decidedAt: new Date().toISOString(),
      reviewer: reviewer || 'current-admin', // Use the passed reviewer or default
      reviewerNote: note
    };

    console.log('Updating CR with decision:', { crId, decision, updatedCR });

    // Update localStorage
    localStorage.setItem(`changeRequest_${updatedCR.id}`, JSON.stringify(updatedCR));
    
    // Update state
    setChangeRequests(prev => prev.map(cr => cr.id === updatedCR.id ? updatedCR : cr));

    // If approved, create new requirement version
    if (decision === 'APPROVE') {
      const requirement = await getRequirementById(changeRequest.requirementId);
      if (requirement) {
        const newVersion: RequirementVersion = {
          id: `version-${Date.now()}`,
          requirementId: requirement.id,
          version: requirement.version + 1,
          text: changeRequest.proposedText,
          author: changeRequest.author,
          date: new Date().toISOString(),
          changeRequestId: crId,
          effectiveDate: new Date().toISOString()
        };

        // Store version
        localStorage.setItem(`requirementVersion_${newVersion.id}`, JSON.stringify(newVersion));
        setRequirementVersions(prev => [...prev, newVersion]);

        // Update requirement
        const updatedRequirement: Requirement = {
          ...requirement,
          version: newVersion.version,
          text: newVersion.text,
          updatedAt: new Date().toISOString(),
          effectiveDate: newVersion.effectiveDate,
          lastModifiedBy: changeRequest.author
        };

        localStorage.setItem(`requirement_${updatedRequirement.id}`, JSON.stringify(updatedRequirement));
        setRequirements(prev => prev.map(req => req.id === updatedRequirement.id ? updatedRequirement : req));
      }
    }

    // Create notification for author
    createNotification(decision === 'APPROVE' ? 'cr_approved' : 'cr_rejected', {
      title: changeRequest.title
    });

    console.log('CR decision submitted:', { crId, decision, note });
  }, [getChangeRequestById, getRequirementById]);

  const getRequirementVersions = useCallback(async (requirementId: string): Promise<RequirementVersion[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const storedVersions = getStoredRequirementVersions();
    return storedVersions
      .filter(version => version.requirementId === requirementId)
      .sort((a, b) => b.version - a.version);
  }, []);

  // Debug function to help troubleshoot filtering issues
  const debugChangeRequests = useCallback(() => {
    const allCRs = getStoredChangeRequests();
    console.log('=== DEBUG: All Change Requests ===');
    allCRs.forEach(cr => {
      console.log(`CR ${cr.id}:`, {
        title: cr.title,
        status: cr.status,
        approver: cr.approver,
        reviewer: cr.reviewer,
        author: cr.author
      });
    });
    
    console.log('=== DEBUG: Filtering Tests ===');
    console.log('APPROVED CRs:', allCRs.filter(cr => cr.status === 'APPROVED'));
    console.log('CRs with approver=admin-sarah:', allCRs.filter(cr => cr.approver === 'admin-sarah'));
    console.log('CRs with reviewer=admin-sarah:', allCRs.filter(cr => cr.reviewer === 'admin-sarah'));
    console.log('CRs with approver OR reviewer=admin-sarah:', allCRs.filter(cr => cr.approver === 'admin-sarah' || cr.reviewer === 'admin-sarah'));
    
    return allCRs;
  }, []);

  return {
    getRequirements,
    getRequirementById,
    createChangeRequest,
    getChangeRequests,
    getChangeRequestById,
    submitCRDecision,
    getRequirementVersions,
    initializeSampleData,
    debugChangeRequests
  };
};
