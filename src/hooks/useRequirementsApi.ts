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
    if ((cr.status as any) === 'APPROVE') {
      const updatedCR = { ...cr, status: 'APPROVED' as CRStatus };
      localStorage.setItem(`changeRequest_${cr.id}`, JSON.stringify(updatedCR));
      migrated = true;
      console.log('Migrated CR status from APPROVE to APPROVED:', cr.id);
    } else if ((cr.status as any) === 'REJECT') {
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
  const [_requirements, setRequirements] = useState<Requirement[]>([]);
  const [_changeRequests, setChangeRequests] = useState<ChangeRequest[]>(getStoredChangeRequests());
  const [_requirementVersions, setRequirementVersions] = useState<RequirementVersion[]>(getStoredRequirementVersions());

  // Run migration on initialization
  React.useEffect(() => {
    migrateCRStatuses();
  }, []);

  // Initialize with sample data if none exists
  // Helper function to calculate next reaffirmation due date
  const calculateNextReaffirmationDue = (originalDate: string, lastReaffirmed?: string): string => {
    const baseDate = lastReaffirmed ? new Date(lastReaffirmed) : new Date(originalDate);
    const nextDue = new Date(baseDate);
    nextDue.setFullYear(nextDue.getFullYear() + 1);
    // Debug logging
    // console.log('Calculating reaffirmation due:', {
    //   originalDate,
    //   lastReaffirmed,
    //   baseDate: baseDate.toISOString(),
    //   nextDue: nextDue.toISOString()
    // });
    return nextDue.toISOString();
  };

  const initializeSampleData = useCallback(() => {
    // Always clear existing localStorage data to start fresh
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('requirement_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Always create new sample data
      const now = new Date();
      const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const eightMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 8, now.getDate());
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const twoWeeksAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
      const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

      const sampleRequirements: Requirement[] = [
        // OVERDUE scenarios
        {
          id: 'req-1',
          version: 2,
          title: 'GDPR Data Processing Agreement',
          jurisdiction: 'Germany',
          entity: 'Deutsche Technologie und Datendienste GmbH',
          subjectType: 'Employee',
          text: 'All personal data processing activities must comply with GDPR Article 6 (lawfulness of processing) and Article 9 (processing of special categories of personal data). Data subjects must be informed about the processing activities through clear privacy notices.',
          updatedAt: oneYearAgo.toISOString(),
          effectiveDate: oneYearAgo.toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'legal-user-1',
          // OVERDUE - last reaffirmed 1 year ago, due 6 months ago
          originalIngestionDate: twoYearsAgo.toISOString(),
          lastReaffirmedAt: oneYearAgo.toISOString(),
          lastReaffirmedBy: 'legal-user-1',
          reaffirmationHistory: [
            {
              id: 'reaff-1',
              requirementId: 'req-1',
              reaffirmedAt: oneYearAgo.toISOString(),
              reaffirmedBy: 'legal-user-1',
              action: 'REAFFIRMED_AS_IS',
              comment: 'No changes required - requirement remains current'
            }
          ],
          nextReaffirmationDue: calculateNextReaffirmationDue(twoYearsAgo.toISOString(), oneYearAgo.toISOString())
        },
        {
          id: 'req-2',
          version: 1,
          title: 'UK GDPR Data Subject Rights',
          jurisdiction: 'United Kingdom',
          entity: 'Deutsche Technologie und Datendienste GmbH',
          subjectType: 'Client',
          text: 'Data subjects have the right to access, rectify, erase, restrict processing, data portability, and object to processing of their personal data. Organizations must respond to data subject requests within one month.',
          updatedAt: eightMonthsAgo.toISOString(),
          effectiveDate: eightMonthsAgo.toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'admin-user',
          // OVERDUE - never reaffirmed, due 2 months ago
          originalIngestionDate: eightMonthsAgo.toISOString(),
          lastReaffirmedAt: undefined,
          lastReaffirmedBy: undefined,
          reaffirmationHistory: [],
          nextReaffirmationDue: calculateNextReaffirmationDue(eightMonthsAgo.toISOString())
        },
        {
          id: 'req-3',
          version: 3,
          title: 'CCPA Consumer Rights Compliance',
          jurisdiction: 'United States',
          entity: 'US Global Technology Solutions Corporation',
          subjectType: 'Client',
          text: 'California consumers have the right to know what personal information is collected, used, shared, or sold. Businesses must provide clear privacy notices and honor consumer requests to delete, correct, or opt-out of the sale of personal information.',
          updatedAt: threeMonthsAgo.toISOString(),
          effectiveDate: threeMonthsAgo.toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'legal-user-2',
          // OVERDUE - last reaffirmed 6 months ago, due 3 months ago
          originalIngestionDate: sixMonthsAgo.toISOString(),
          lastReaffirmedAt: sixMonthsAgo.toISOString(),
          lastReaffirmedBy: 'legal-user-2',
          reaffirmationHistory: [
            {
              id: 'reaff-2',
              requirementId: 'req-3',
              reaffirmedAt: sixMonthsAgo.toISOString(),
              reaffirmedBy: 'legal-user-2',
              action: 'REAFFIRMED_WITH_CHANGES',
              comment: 'Updated to reflect new CCPA amendments',
              changes: 'Added new consumer rights for data portability'
            }
          ],
          nextReaffirmationDue: calculateNextReaffirmationDue(sixMonthsAgo.toISOString(), sixMonthsAgo.toISOString())
        },
        // DUE SOON scenarios
        {
          id: 'req-4',
          version: 1,
          title: 'PDPA Data Protection Requirements',
          jurisdiction: 'Singapore',
          entity: 'Singapore Advanced Technology Solutions Pte Ltd',
          subjectType: 'Employee',
          text: 'Organizations must obtain consent before collecting, using, or disclosing personal data. Data subjects have the right to withdraw consent and request access to their personal data. Organizations must implement reasonable security arrangements to protect personal data.',
          updatedAt: oneMonthAgo.toISOString(),
          effectiveDate: oneMonthAgo.toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'admin-user',
          // DUE SOON - never reaffirmed, due in 2 weeks
          originalIngestionDate: oneMonthAgo.toISOString(),
          lastReaffirmedAt: undefined,
          lastReaffirmedBy: undefined,
          reaffirmationHistory: [],
          nextReaffirmationDue: calculateNextReaffirmationDue(oneMonthAgo.toISOString())
        },
        {
          id: 'req-5',
          version: 2,
          title: 'PIPEDA Privacy Compliance',
          jurisdiction: 'Canada',
          entity: 'US Global Technology Solutions Corporation',
          subjectType: 'Candidate',
          text: 'Organizations must obtain meaningful consent for the collection, use, and disclosure of personal information. Individuals have the right to access and correct their personal information. Organizations must implement appropriate safeguards.',
          updatedAt: twoWeeksAgo.toISOString(),
          effectiveDate: twoWeeksAgo.toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'legal-user-3',
          // DUE SOON - last reaffirmed 1 year ago, due in 5 days
          originalIngestionDate: oneYearAgo.toISOString(),
          lastReaffirmedAt: oneYearAgo.toISOString(),
          lastReaffirmedBy: 'legal-user-3',
          reaffirmationHistory: [
            {
              id: 'reaff-3',
              requirementId: 'req-5',
              reaffirmedAt: oneYearAgo.toISOString(),
              reaffirmedBy: 'legal-user-3',
              action: 'REAFFIRMED_AS_IS',
              comment: 'Requirement remains valid and current'
            }
          ],
          nextReaffirmationDue: calculateNextReaffirmationDue(oneYearAgo.toISOString(), oneYearAgo.toISOString())
        },
        // CURRENT scenarios
        {
          id: 'req-6',
          version: 1,
          title: 'LGPD Data Protection Law',
          jurisdiction: 'Brazil',
          entity: 'Singapore Advanced Technology Solutions Pte Ltd',
          subjectType: 'Prospect',
          text: 'Organizations must process personal data in accordance with the principles of purpose, adequacy, necessity, free access, data quality, transparency, security, prevention, non-discrimination, and accountability.',
          updatedAt: oneWeekAgo.toISOString(),
          effectiveDate: oneWeekAgo.toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'admin-user',
          // CURRENT - recently created, not due for 11 months
          originalIngestionDate: oneWeekAgo.toISOString(),
          lastReaffirmedAt: undefined,
          lastReaffirmedBy: undefined,
          reaffirmationHistory: [],
          nextReaffirmationDue: calculateNextReaffirmationDue(oneWeekAgo.toISOString())
        },
        {
          id: 'req-7',
          version: 1,
          title: 'PDPA Data Breach Notification',
          jurisdiction: 'Singapore',
          entity: 'Singapore Advanced Technology Solutions Pte Ltd',
          subjectType: 'Client',
          text: 'Organizations must notify the Personal Data Protection Commission and affected individuals within 72 hours of discovering a data breach that poses significant harm to individuals.',
          updatedAt: new Date().toISOString(),
          effectiveDate: new Date().toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'admin-user',
          // CURRENT - just created today
          originalIngestionDate: new Date().toISOString(),
          lastReaffirmedAt: undefined,
          lastReaffirmedBy: undefined,
          reaffirmationHistory: [],
          nextReaffirmationDue: calculateNextReaffirmationDue(new Date().toISOString())
        },
        {
          id: 'req-8',
          version: 2,
          title: 'GDPR Data Protection Impact Assessment',
          jurisdiction: 'Germany',
          entity: 'Deutsche Technologie und Datendienste GmbH',
          subjectType: 'Candidate',
          text: 'A DPIA must be carried out before processing personal data that is likely to result in a high risk to the rights and freedoms of natural persons, particularly when using new technologies.',
          updatedAt: threeMonthsAgo.toISOString(),
          effectiveDate: threeMonthsAgo.toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'legal-user-1',
          // CURRENT - reaffirmed 3 months ago, not due for 9 months
          originalIngestionDate: oneYearAgo.toISOString(),
          lastReaffirmedAt: threeMonthsAgo.toISOString(),
          lastReaffirmedBy: 'legal-user-1',
          reaffirmationHistory: [
            {
              id: 'reaff-4',
              requirementId: 'req-8',
              reaffirmedAt: threeMonthsAgo.toISOString(),
              reaffirmedBy: 'legal-user-1',
              action: 'REAFFIRMED_WITH_CHANGES',
              comment: 'Updated to include new technology considerations',
              changes: 'Added AI and machine learning processing requirements'
            }
          ],
          nextReaffirmationDue: calculateNextReaffirmationDue(oneYearAgo.toISOString(), threeMonthsAgo.toISOString())
        },
        // Additional OVERDUE requirements for bulk testing
        {
          id: 'req-9',
          version: 1,
          title: 'DPR Data Processing Agreement',
          jurisdiction: 'Germany',
          entity: 'Deutsche Technologie und Datendienste GmbH',
          subjectType: 'Employee',
          text: 'Data processing agreements must specify the subject matter, duration, nature and purpose of processing, types of personal data, and categories of data subjects. Controllers must ensure processors provide sufficient guarantees.',
          updatedAt: eightMonthsAgo.toISOString(),
          effectiveDate: eightMonthsAgo.toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'admin-user',
          // OVERDUE - never reaffirmed, due 2 months ago
          originalIngestionDate: eightMonthsAgo.toISOString(),
          lastReaffirmedAt: undefined,
          lastReaffirmedBy: undefined,
          reaffirmationHistory: [],
          nextReaffirmationDue: calculateNextReaffirmationDue(eightMonthsAgo.toISOString())
        },
        {
          id: 'req-10',
          version: 2,
          title: 'PIPEDA Privacy Compliance',
          jurisdiction: 'Canada',
          entity: 'US Global Technology Solutions Corporation',
          subjectType: 'Candidate',
          text: 'Organizations must obtain meaningful consent for the collection, use, and disclosure of personal information. Individuals have the right to access and correct their personal information. Organizations must implement appropriate safeguards.',
          updatedAt: sixMonthsAgo.toISOString(),
          effectiveDate: sixMonthsAgo.toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'legal-user-2',
          // OVERDUE - last reaffirmed 6 months ago, due 3 months ago
          originalIngestionDate: sixMonthsAgo.toISOString(),
          lastReaffirmedAt: sixMonthsAgo.toISOString(),
          lastReaffirmedBy: 'legal-user-2',
          reaffirmationHistory: [
            {
              id: 'reaff-5',
              requirementId: 'req-10',
              reaffirmedAt: sixMonthsAgo.toISOString(),
              reaffirmedBy: 'legal-user-2',
              action: 'REAFFIRMED_AS_IS',
              comment: 'No changes required - requirement remains current'
            }
          ],
          nextReaffirmationDue: calculateNextReaffirmationDue(sixMonthsAgo.toISOString(), sixMonthsAgo.toISOString())
        },
        {
          id: 'req-11',
          version: 1,
          title: 'UK GDPR Data Subject Rights',
          jurisdiction: 'United Kingdom',
          entity: 'Deutsche Technologie und Datendienste GmbH',
          subjectType: 'Client',
          text: 'Data subjects have the right to access, rectify, erase, restrict processing, data portability, and object to processing of their personal data. Organizations must respond to data subject requests within one month.',
          updatedAt: oneYearAgo.toISOString(),
          effectiveDate: oneYearAgo.toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'legal-user-1',
          // OVERDUE - last reaffirmed 1 year ago, due 6 months ago
          originalIngestionDate: oneYearAgo.toISOString(),
          lastReaffirmedAt: oneYearAgo.toISOString(),
          lastReaffirmedBy: 'legal-user-1',
          reaffirmationHistory: [
            {
              id: 'reaff-6',
              requirementId: 'req-11',
              reaffirmedAt: oneYearAgo.toISOString(),
              reaffirmedBy: 'legal-user-1',
              action: 'REAFFIRMED_WITH_CHANGES',
              comment: 'Updated to reflect new UK GDPR guidance',
              changes: 'Added clarification on data portability requirements'
            }
          ],
          nextReaffirmationDue: calculateNextReaffirmationDue(oneYearAgo.toISOString(), oneYearAgo.toISOString())
        },
        {
          id: 'req-12',
          version: 1,
          title: 'CCPA Consumer Rights Compliance',
          jurisdiction: 'United States',
          entity: 'US Global Technology Solutions Corporation',
          subjectType: 'Client',
          text: 'California consumers have the right to know what personal information is collected, used, shared, or sold. Businesses must provide clear privacy notices and honor consumer requests to delete, correct, or opt-out of the sale of personal information.',
          updatedAt: eightMonthsAgo.toISOString(),
          effectiveDate: eightMonthsAgo.toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'admin-user',
          // OVERDUE - never reaffirmed, due 2 months ago
          originalIngestionDate: eightMonthsAgo.toISOString(),
          lastReaffirmedAt: undefined,
          lastReaffirmedBy: undefined,
          reaffirmationHistory: [],
          nextReaffirmationDue: calculateNextReaffirmationDue(eightMonthsAgo.toISOString())
        },
        {
          id: 'req-13',
          version: 1,
          title: 'PDPA Data Protection Requirements',
          jurisdiction: 'Singapore',
          entity: 'Singapore Advanced Technology Solutions Pte Ltd',
          subjectType: 'Employee',
          text: 'Organizations must obtain consent before collecting, using, or disclosing personal data. Data subjects have the right to withdraw consent and request access to their personal data. Organizations must implement reasonable security arrangements to protect personal data.',
          updatedAt: oneYearAgo.toISOString(),
          effectiveDate: oneYearAgo.toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'legal-user-3',
          // OVERDUE - last reaffirmed 1 year ago, due 6 months ago
          originalIngestionDate: oneYearAgo.toISOString(),
          lastReaffirmedAt: oneYearAgo.toISOString(),
          lastReaffirmedBy: 'legal-user-3',
          reaffirmationHistory: [
            {
              id: 'reaff-7',
              requirementId: 'req-13',
              reaffirmedAt: oneYearAgo.toISOString(),
              reaffirmedBy: 'legal-user-3',
              action: 'REAFFIRMED_AS_IS',
              comment: 'Requirement remains valid and current'
            }
          ],
          nextReaffirmationDue: calculateNextReaffirmationDue(oneYearAgo.toISOString(), oneYearAgo.toISOString())
        },
        {
          id: 'req-14',
          version: 1,
          title: 'LGPD Data Protection Law',
          jurisdiction: 'Brazil',
          entity: 'Singapore Advanced Technology Solutions Pte Ltd',
          subjectType: 'Prospect',
          text: 'Organizations must process personal data in accordance with the principles of purpose, adequacy, necessity, free access, data quality, transparency, security, prevention, non-discrimination, and accountability.',
          updatedAt: sixMonthsAgo.toISOString(),
          effectiveDate: sixMonthsAgo.toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'legal-user-2',
          // OVERDUE - last reaffirmed 6 months ago, due 3 months ago
          originalIngestionDate: sixMonthsAgo.toISOString(),
          lastReaffirmedAt: sixMonthsAgo.toISOString(),
          lastReaffirmedBy: 'legal-user-2',
          reaffirmationHistory: [
            {
              id: 'reaff-8',
              requirementId: 'req-14',
              reaffirmedAt: sixMonthsAgo.toISOString(),
              reaffirmedBy: 'legal-user-2',
              action: 'REAFFIRMED_WITH_CHANGES',
              comment: 'Updated to reflect new LGPD regulations',
              changes: 'Added new accountability requirements'
            }
          ],
          nextReaffirmationDue: calculateNextReaffirmationDue(sixMonthsAgo.toISOString(), sixMonthsAgo.toISOString())
        },
        {
          id: 'req-15',
          version: 1,
          title: 'GDPR Data Protection Impact Assessment',
          jurisdiction: 'Germany',
          entity: 'Deutsche Technologie und Datendienste GmbH',
          subjectType: 'Candidate',
          text: 'A DPIA must be carried out before processing personal data that is likely to result in a high risk to the rights and freedoms of natural persons, particularly when using new technologies.',
          updatedAt: eightMonthsAgo.toISOString(),
          effectiveDate: eightMonthsAgo.toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'admin-user',
          // OVERDUE - never reaffirmed, due 2 months ago
          originalIngestionDate: eightMonthsAgo.toISOString(),
          lastReaffirmedAt: undefined,
          lastReaffirmedBy: undefined,
          reaffirmationHistory: [],
          nextReaffirmationDue: calculateNextReaffirmationDue(eightMonthsAgo.toISOString())
        },
        {
          id: 'req-16',
          version: 1,
          title: 'PDPA Data Breach Notification',
          jurisdiction: 'Singapore',
          entity: 'Singapore Advanced Technology Solutions Pte Ltd',
          subjectType: 'Client',
          text: 'Organizations must notify the Personal Data Protection Commission and affected individuals within 72 hours of discovering a data breach that poses significant harm to individuals.',
          updatedAt: oneYearAgo.toISOString(),
          effectiveDate: oneYearAgo.toISOString(),
          createdBy: 'admin-user',
          lastModifiedBy: 'legal-user-1',
          // OVERDUE - last reaffirmed 1 year ago, due 6 months ago
          originalIngestionDate: oneYearAgo.toISOString(),
          lastReaffirmedAt: oneYearAgo.toISOString(),
          lastReaffirmedBy: 'legal-user-1',
          reaffirmationHistory: [
            {
              id: 'reaff-9',
              requirementId: 'req-16',
              reaffirmedAt: oneYearAgo.toISOString(),
              reaffirmedBy: 'legal-user-1',
              action: 'REAFFIRMED_AS_IS',
              comment: 'No changes required - requirement remains current'
            }
          ],
          nextReaffirmationDue: calculateNextReaffirmationDue(oneYearAgo.toISOString(), oneYearAgo.toISOString())
        }
      ];

      sampleRequirements.forEach(req => {
        // Validate dates before storing
        console.log('Storing requirement:', {
          id: req.id,
          title: req.title,
          originalIngestionDate: req.originalIngestionDate,
          nextReaffirmationDue: req.nextReaffirmationDue,
          lastReaffirmedAt: req.lastReaffirmedAt
        });
        
        // Validate that dates are valid
        const originalDate = new Date(req.originalIngestionDate);
        const nextDueDate = new Date(req.nextReaffirmationDue);
        
        if (isNaN(originalDate.getTime())) {
          console.error('Invalid originalIngestionDate for requirement:', req.id, req.originalIngestionDate);
        }
        if (isNaN(nextDueDate.getTime())) {
          console.error('Invalid nextReaffirmationDue for requirement:', req.id, req.nextReaffirmationDue);
        }
        
        localStorage.setItem(`requirement_${req.id}`, JSON.stringify(req));
      });
      setRequirements(sampleRequirements);
  }, [setRequirements]);

  const getRequirements = useCallback(async (filters?: {
    jurisdiction?: string[];
    entity?: string[];
    subjectType?: string[];
  }): Promise<Requirement[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Only initialize sample data if no requirements exist
    const existingRequirements = getStoredRequirements();
    if (existingRequirements.length === 0) {
      initializeSampleData();
    }
    
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

  const reaffirmRequirement = useCallback(async (reaffirmationData: {
    requirementId: string;
    action: 'REAFFIRMED_AS_IS' | 'REAFFIRMED_WITH_CHANGES';
    comment?: string;
    proposedChanges?: string;
  }): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const requirement = await getRequirementById(reaffirmationData.requirementId);
    if (!requirement) {
      throw new Error('Requirement not found');
    }

    const now = new Date().toISOString();
    
    // Create new reaffirmation entry
    const newReaffirmationEntry = {
      id: `reaff-${Date.now()}`,
      requirementId: reaffirmationData.requirementId,
      reaffirmedAt: now,
      reaffirmedBy: 'current-user', // In real app, this would be the actual user
      action: reaffirmationData.action,
      comment: reaffirmationData.comment,
      changes: reaffirmationData.proposedChanges,
      previousVersion: requirement.version,
      newVersion: requirement.version // Version doesn't change for reaffirmation
    };

    // Update the requirement
    const updatedRequirement: Requirement = {
      ...requirement,
      lastReaffirmedAt: now,
      lastReaffirmedBy: 'current-user',
      reaffirmationHistory: [...requirement.reaffirmationHistory, newReaffirmationEntry],
      nextReaffirmationDue: calculateNextReaffirmationDue(requirement.originalIngestionDate, now),
      updatedAt: now,
      lastModifiedBy: 'current-user'
    };

    // Store updated requirement
    localStorage.setItem(`requirement_${requirement.id}`, JSON.stringify(updatedRequirement));
    
    // Update state
    setRequirements(prev => prev.map(req => 
      req.id === requirement.id ? updatedRequirement : req
    ));

    console.log('Requirement reaffirmed:', updatedRequirement);
  }, [getRequirementById]);

  return {
    getRequirements,
    getRequirementById,
    createChangeRequest,
    getChangeRequests,
    getChangeRequestById,
    submitCRDecision,
    getRequirementVersions,
    initializeSampleData,
    reaffirmRequirement,
    debugChangeRequests
  };
};
