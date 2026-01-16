import { Transfer, Evidence, UploadedTemplate, TemplateSection, FileAttachment, MERReviewDecision, AttachmentReviewDecision, AuditEntry, RequirementStatus } from '../types/index';
import { getAllTemplates } from './uploadedTemplateService';

/**
 * Aggregated MER submission data for review
 */
export interface MERSubmissionReview {
    transfer: Transfer;
    template: UploadedTemplate | null;
    filledData: Record<string, any>;
    templateAttachments: FileAttachment[];
    supportingEvidence: Evidence[];
    sections: TemplateSection[];
    escalationInfo?: {
        reason: string;
        escalatedBy: string;
        escalatedTo: string;
        escalatedAt: string;
    } | null;
    escalationHistory?: Array<{
        id: string;
        escalatedTo: string;
        escalatedBy: string;
        escalatedAt: string;
        reason: string;
        comments: string;
    }>;
}

/**
 * Get all data needed for reviewing a MER submission
 */
export const getMERSubmissionData = async (transferId: string): Promise<MERSubmissionReview | null> => {
    try {
        console.log('[getMERSubmissionData] Loading transfer:', transferId);

        // Load transfer from localStorage
        const transferJson = localStorage.getItem(`transfer_${transferId}`);
        if (!transferJson) {
            console.error('[getMERSubmissionData] Transfer not found in localStorage:', transferId);
            console.log('[getMERSubmissionData] Available transfers:',
                Object.keys(localStorage).filter(k => k.startsWith('transfer_')));
            return null;
        }

        const transfer: Transfer = JSON.parse(transferJson);
        console.log('[getMERSubmissionData] Transfer loaded:', transfer);

        // Verify this is a MER transfer
        if (!transfer.merType || !transfer.merTemplateData) {
            console.error('[getMERSubmissionData] Not a MER transfer:', transferId);
            console.log('[getMERSubmissionData] Transfer has merType:', !!transfer.merType);
            console.log('[getMERSubmissionData] Transfer has merTemplateData:', !!transfer.merTemplateData);
            return null;
        }

        // Load the template
        const templates = getAllTemplates();
        console.log('[getMERSubmissionData] Looking for template ID:', transfer.merTemplateId);
        console.log('[getMERSubmissionData] Available templates:', templates.map(t => t.id));

        const template = templates.find(t => t.id === transfer.merTemplateId);

        if (!template) {
            console.error('[getMERSubmissionData] Template not found:', transfer.merTemplateId);
            return null;
        }

        console.log('[getMERSubmissionData] Template loaded:', template.name);

        // Extract filled data - merTemplateData contains all the form data
        const merTemplateData = transfer.merTemplateData;

        console.log('[getMERSubmissionData] Raw merTemplateData:', merTemplateData);
        console.log('[getMERSubmissionData] merTemplateData keys:', Object.keys(merTemplateData));

        // Separate the data types
        const tableData = merTemplateData.tableData || {};
        const fileData = merTemplateData.fileData || {};

        // Create filledData with only regular field values (exclude tableData and fileData)
        const filledData: Record<string, any> = {};
        Object.entries(merTemplateData).forEach(([key, value]) => {
            if (key !== 'tableData' && key !== 'fileData') {
                filledData[key] = value;
            }
        });

        console.log('[getMERSubmissionData] Extracted data:', {
            filledDataKeys: Object.keys(filledData),
            tableDataKeys: Object.keys(tableData),
            fileDataKeys: Object.keys(fileData),
        });

        // Extract template attachments from fileData
        const templateAttachments: FileAttachment[] = [];
        if (fileData) {
            Object.entries(fileData).forEach(([_, files]) => {
                if (Array.isArray(files)) {
                    templateAttachments.push(...files as FileAttachment[]);
                }
            });
        }

        // Load supporting evidence (uploaded via SimpleMERUpload)
        const supportingEvidence = getAllEvidenceForTransfer(transferId);
        console.log('[getMERSubmissionData] Template attachments:', templateAttachments.length);
        console.log('[getMERSubmissionData] Supporting evidence:', supportingEvidence.length);

        // Get sections from template
        const sections = template.sections || [];

        // Get escalation info from virtual evidence if available
        const virtualEvidenceKey = `evidence_evidence-mer-${transfer.id}`;
        const virtualEvidenceJson = localStorage.getItem(virtualEvidenceKey);
        let escalationInfo = null;

        if (virtualEvidenceJson) {
            const virtualEvidence: Evidence = JSON.parse(virtualEvidenceJson);
            if (virtualEvidence.status === 'ESCALATED' && virtualEvidence.escalationReason) {
                escalationInfo = {
                    reason: virtualEvidence.escalationReason,
                    escalatedBy: virtualEvidence.escalatedBy || 'Admin',
                    escalatedTo: virtualEvidence.escalatedTo || 'Legal',
                    escalatedAt: virtualEvidence.escalatedAt || new Date().toISOString(),
                };
            }
        }

        return {
            transfer,
            template,
            filledData: {
                ...filledData,
                tableData,
                fileData,
            },
            templateAttachments,
            supportingEvidence,
            sections,
            escalationInfo, // Add escalation info
            escalationHistory: virtualEvidenceJson ? JSON.parse(virtualEvidenceJson).escalationHistory : [],
        };
    } catch (error) {
        console.error('[getMERSubmissionData] Error loading MER submission data:', error);
        return null;
    }
};

/**
 * Get all evidence files for a transfer
 */
export const getAllEvidenceForTransfer = (transferId: string): Evidence[] => {
    const evidence: Evidence[] = [];

    // Scan localStorage for evidence entries
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('evidence_')) {
            try {
                const evidenceJson = localStorage.getItem(key);
                if (evidenceJson) {
                    const evidenceItem: Evidence = JSON.parse(evidenceJson);

                    // Check if this evidence belongs to the transfer
                    // Either via merTransferId or by requirementId containing transferId
                    if (
                        evidenceItem.merTransferId === transferId ||
                        evidenceItem.requirementId.includes(transferId)
                    ) {
                        evidence.push(evidenceItem);
                    }
                }
            } catch (error) {
                console.error('Error parsing evidence:', error);
            }
        }
    }

    return evidence;
};

/**
 * Extract template attachments from merTemplateData.fileData
 */
export const getTemplateAttachments = (merTemplateData: Record<string, any>): FileAttachment[] => {
    const attachments: FileAttachment[] = [];

    if (merTemplateData.fileData) {
        Object.entries(merTemplateData.fileData).forEach(([_, files]) => {
            if (Array.isArray(files)) {
                attachments.push(...files as FileAttachment[]);
            }
        });
    }

    return attachments;
};

/**
 * Format template sections with filled data for read-only display
 */
export const formatTemplateForDisplay = (
    template: UploadedTemplate
): TemplateSection[] => {
    if (!template.sections) return [];

    // Return sections with filled values integrated
    // The component will use filledData to populate field values
    return template.sections;
};

/**
 * Submit MER review decision
 */
export const submitMERReview = async (
    transferId: string,
    overallDecision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES',
    adminComments: string,
    attachmentDecisions: AttachmentReviewDecision[],
    reviewerType: 'Admin' | 'Legal' | 'Business'
): Promise<void> => {
    try {
        // Load the transfer
        const transferJson = localStorage.getItem(`transfer_${transferId}`);
        if (!transferJson) {
            throw new Error('Transfer not found');
        }

        const transfer: Transfer = JSON.parse(transferJson);

        // Create review decision object
        const reviewDecision: MERReviewDecision = {
            transferId,
            overallDecision,
            adminComments,
            attachmentDecisions,
            reviewedBy: reviewerType === 'Admin' ? 'current-admin' : reviewerType === 'Legal' ? 'current-legal' : 'current-business',
            reviewedAt: new Date().toISOString(),
        };

        // Update transfer with review data
        transfer.reviewData = {
            overallDecision: overallDecision === 'APPROVE' ? 'APPROVED' : overallDecision === 'REJECT' ? 'REJECTED' : 'UNDER_REVIEW',
            adminComments,
            reviewedBy: reviewDecision.reviewedBy,
            reviewedAt: reviewDecision.reviewedAt,
            attachmentDecisions: attachmentDecisions.map(ad => ({
                attachmentId: ad.attachmentId,
                attachmentName: ad.attachmentId, // Will be updated to actual name by caller
                decision: ad.decision === 'APPROVE' ? 'APPROVED' as const : 'REJECTED' as const,
                comments: ad.note,
                reviewedBy: reviewDecision.reviewedBy,
                reviewedAt: reviewDecision.reviewedAt,
            })),
        };

        // Update transfer status based on decision
        if (overallDecision === 'APPROVE') {
            transfer.status = 'COMPLETED';
            // Update all requirements to APPROVED
            transfer.requirements = transfer.requirements.map(req => ({
                ...req,
                status: 'APPROVED',
                updatedAt: new Date().toISOString(),
            }));
        } else if (overallDecision === 'REJECT') {
            // Update all requirements to REJECTED
            transfer.requirements = transfer.requirements.map(req => ({
                ...req,
                status: 'REJECTED',
                updatedAt: new Date().toISOString(),
            }));
        }

        // Save updated transfer
        localStorage.setItem(`transfer_${transferId}`, JSON.stringify(transfer));

        // Update virtual evidence status if it exists
        // Use the same key format as escalation: evidence-mer-{transferId}
        const virtualEvidenceKey = `evidence_evidence-mer-${transferId}`;
        const virtualEvidenceJson = localStorage.getItem(virtualEvidenceKey);
        console.log(`[submitMERReview] Looking for evidence with key: ${virtualEvidenceKey}`);
        console.log(`[submitMERReview] Found evidence:`, virtualEvidenceJson ? 'YES' : 'NO');

        if (virtualEvidenceJson) {
            const virtualEvidence: Evidence = JSON.parse(virtualEvidenceJson);
            virtualEvidence.status = overallDecision === 'APPROVE' ? 'APPROVED' : overallDecision === 'REJECT' ? 'REJECTED' : 'UNDER_REVIEW';
            virtualEvidence.reviewerNote = adminComments;
            virtualEvidence.reviewerId = reviewDecision.reviewedBy;
            virtualEvidence.reviewedAt = reviewDecision.reviewedAt;
            localStorage.setItem(virtualEvidenceKey, JSON.stringify(virtualEvidence));
            console.log(`[submitMERReview] Updated evidence status to ${virtualEvidence.status}`);
        } else {
            console.warn(`[submitMERReview] Virtual evidence not found with key: ${virtualEvidenceKey}`);
        }

        // Update individual evidence files based on attachment decisions
        attachmentDecisions.forEach(attachmentDecision => {
            // Find evidence by ID
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('evidence_')) {
                    try {
                        const evidenceJson = localStorage.getItem(key);
                        if (evidenceJson) {
                            const evidence: Evidence = JSON.parse(evidenceJson);

                            // Match by evidence ID or filename
                            if (evidence.id === attachmentDecision.attachmentId || evidence.filename === attachmentDecision.attachmentId) {
                                evidence.status = attachmentDecision.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
                                evidence.reviewerNote = attachmentDecision.note;
                                evidence.reviewerId = reviewDecision.reviewedBy;
                                evidence.reviewedAt = reviewDecision.reviewedAt;
                                localStorage.setItem(key, JSON.stringify(evidence));
                            }
                        }
                    } catch (error) {
                        console.error('Error updating evidence:', error);
                    }
                }
            }
        });

        // Create audit trail entry for the review decision
        const auditAction: AuditEntry['action'] = overallDecision === 'APPROVE' ? 'APPROVED' : overallDecision === 'REJECT' ? 'REJECTED' : 'REVIEWED';
        const newStatus: RequirementStatus = overallDecision === 'APPROVE' ? 'APPROVED' : overallDecision === 'REJECT' ? 'REJECTED' : 'UNDER_REVIEW';

        const auditEntry: AuditEntry = {
            id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            requirementId: transferId,
            action: auditAction,
            performedBy: reviewerType === 'Admin' ? 'current-admin' : reviewerType === 'Legal' ? 'current-legal' : 'current-business',
            performedByRole: reviewerType === 'Admin' ? 'ADMIN' : reviewerType === 'Legal' ? 'LEGAL' : 'END_USER', // Business maps to END_USER typically
            performedAt: new Date().toISOString(),
            newStatus,
            previousStatus: 'UNDER_REVIEW',
            note: adminComments
        };

        localStorage.setItem(`audit_${auditEntry.id}`, JSON.stringify(auditEntry));

        console.log('MER review submitted successfully:', reviewDecision);
    } catch (error) {
        console.error('Error submitting MER review:', error);
        throw error;
    }
};

/**
 * Deputize MER submission to another reviewer
 */
export const deputizeMERSubmission = async (
    transferId: string,
    deputyId: string,
    deputyType: 'Deputy-Legal' | 'Deputy-Business',
    assignedBy: string
): Promise<void> => {
    try {
        // Load transfer
        const transferJson = localStorage.getItem(`transfer_${transferId}`);
        if (!transferJson) {
            throw new Error('Transfer not found');
        }

        const transfer: Transfer = JSON.parse(transferJson);

        // Update virtual evidence with deputy assignment
        const virtualEvidenceKey = `evidence_evidence-${transfer.requirements[0]?.id}`;
        const virtualEvidenceJson = localStorage.getItem(virtualEvidenceKey);
        if (virtualEvidenceJson) {
            const virtualEvidence: Evidence = JSON.parse(virtualEvidenceJson);
            virtualEvidence.assignedDeputy = deputyId;
            virtualEvidence.assignedDeputyType = deputyType;
            virtualEvidence.deputyAssignedAt = new Date().toISOString();
            virtualEvidence.deputyAssignedBy = assignedBy;
            localStorage.setItem(virtualEvidenceKey, JSON.stringify(virtualEvidence));
        }

        console.log(`MER submission ${transferId} deputized to ${deputyId}`);
    } catch (error) {
        console.error('Error deputizing MER submission:', error);
        throw error;
    }
};

/**
 * Escalate MER submission to Legal or Business team
 */
export const escalateMERSubmission = async (
    transferId: string,
    escalateTo: 'Legal' | 'Business',
    reason: string,
    escalatedBy: string
): Promise<void> => {
    try {
        // Load transfer
        const transferJson = localStorage.getItem(`transfer_${transferId}`);
        if (!transferJson) {
            throw new Error('Transfer not found');
        }

        const transfer: Transfer = JSON.parse(transferJson);

        // Update transfer status to ESCALATED
        transfer.status = 'ESCALATED';

        // Update virtual evidence with escalation info
        const virtualEvidenceKey = `evidence_evidence-mer-${transfer.id}`;
        const virtualEvidenceJson = localStorage.getItem(virtualEvidenceKey);
        console.log(`[escalateMERSubmission] Looking for evidence with key: ${virtualEvidenceKey}`);
        console.log(`[escalateMERSubmission] Found evidence:`, virtualEvidenceJson ? 'YES' : 'NO');

        if (virtualEvidenceJson) {
            const virtualEvidence: Evidence = JSON.parse(virtualEvidenceJson);
            virtualEvidence.status = 'ESCALATED';
            virtualEvidence.escalatedTo = escalateTo;
            virtualEvidence.escalationReason = reason;
            virtualEvidence.escalatedBy = escalatedBy;
            virtualEvidence.escalatedAt = new Date().toISOString();
            localStorage.setItem(virtualEvidenceKey, JSON.stringify(virtualEvidence));
            console.log(`[escalateMERSubmission] Updated evidence status to ESCALATED`);
        } else {
            console.error(`[escalateMERSubmission] Virtual evidence not found with key: ${virtualEvidenceKey}`);
        }

        // Save updated transfer
        localStorage.setItem(`transfer_${transferId}`, JSON.stringify(transfer));

        // Create audit trail entry for escalation
        const auditEntry: AuditEntry = {
            id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            requirementId: transferId,
            action: 'ESCALATED',
            performedBy: escalatedBy,
            performedByRole: 'ADMIN', // Assuming admin escalates
            performedAt: new Date().toISOString(),
            newStatus: 'ESCALATED',
            previousStatus: 'UNDER_REVIEW',
            escalatedTo: escalateTo,
            escalationReason: reason,
            note: `Escalated to ${escalateTo}: ${reason}`
        };

        localStorage.setItem(`audit_${auditEntry.id}`, JSON.stringify(auditEntry));

        console.log(`MER submission ${transferId} escalated to ${escalateTo}`);
    } catch (error) {
        console.error('Error escalating MER submission:', error);
        throw error;
    }
};

/**
 * Submit response for an escalated MER submission (Legal/Business)
 */
export const submitEscalationResponse = async (
    transferId: string,
    comments: string,
    responderType: 'Legal' | 'Business',
    responderId: string
): Promise<void> => {
    try {
        // Load transfer
        const transferJson = localStorage.getItem(`transfer_${transferId}`);
        if (!transferJson) {
            throw new Error('Transfer not found');
        }

        const transfer: Transfer = JSON.parse(transferJson);

        // Update transfer status back to UNDER_REVIEW so Admin can see it
        transfer.status = 'PENDING'; // Or UNDER_REVIEW, but PENDING is often used for "Pending Admin Action"

        // We can use a property to indicate it's returned from escalation if needed
        // For now, setting it to UNDER_REVIEW is likely enough to show up in Admin's queue if filters allow
        // valid statuses: 'ACTIVE' | 'COMPLETED' | 'PENDING' | 'ESCALATED'
        // Let's use 'PENDING' for "Pending review"

        // However, the original status before escalation might have been 'PENDING' or 'ACTIVE'.
        // 'ESCALATED' was a distinct status.
        // Let's set it to 'PENDING' to signify it requires attention.

        // Update virtual evidence
        const virtualEvidenceKey = `evidence_evidence-mer-${transfer.id}`;
        const virtualEvidenceJson = localStorage.getItem(virtualEvidenceKey);

        if (virtualEvidenceJson) {
            const virtualEvidence: Evidence = JSON.parse(virtualEvidenceJson);

            // Update status
            virtualEvidence.status = 'UNDER_REVIEW';

            // Add to escalation history or comments
            // For simplicity, we'll append to the reviewerNote or use a dedicated logging mechanism
            // Ideally, we push to escalationHistory if it exists
            if (!virtualEvidence.escalationHistory) {
                virtualEvidence.escalationHistory = [];
            }

            virtualEvidence.escalationHistory.push({
                id: `esc-resp-${Date.now()}`,
                escalatedTo: 'Admin', // Returned to Admin
                escalatedBy: responderType,
                escalatedAt: new Date().toISOString(),
                reason: 'Escalation Response',
                comments: comments,
                taggedAuthorities: []
            });

            // Clear current escalation fields so it doesn't look like it's still waiting for them
            // But we might want to keep history. 
            // The requirement is "request will go back to the Administrator".
            // So we clear 'escalatedTo' so it falls back to Admin's queue logic usually.
            delete virtualEvidence.escalatedTo;

            localStorage.setItem(virtualEvidenceKey, JSON.stringify(virtualEvidence));
        }

        // Save transfer
        localStorage.setItem(`transfer_${transferId}`, JSON.stringify(transfer));

        // Audit Trail
        const auditEntry: AuditEntry = {
            id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            requirementId: transferId,
            action: 'CLARIFICATION_PROVIDED', // Or a custom action for Escalation Response
            performedBy: responderId,
            performedByRole: responderType === 'Legal' ? 'LEGAL' : 'END_USER', // Business is often End User role
            performedAt: new Date().toISOString(),
            newStatus: 'UNDER_REVIEW',
            previousStatus: 'ESCALATED',
            note: `Escalation response from ${responderType}: ${comments}`
        };

        localStorage.setItem(`audit_${auditEntry.id}`, JSON.stringify(auditEntry));

        console.log(`Escalation response submitted for ${transferId} by ${responderType}`);
    } catch (error) {
        console.error('Error submitting escalation response:', error);
        throw error;
    }
};
