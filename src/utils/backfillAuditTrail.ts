import { Transfer, Evidence, AuditEntry, RequirementStatus } from '../types/index';

/**
 * Backfill audit trail entries for existing transfers that don't have them
 * This creates initial audit entries based on the current state of transfers
 */
export const backfillAuditTrailForExistingTransfers = (): void => {
    console.log('[Backfill] Starting audit trail backfill...');

    // Get all transfers
    const transfers: Transfer[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('transfer_')) {
            try {
                const transferJson = localStorage.getItem(key);
                if (transferJson) {
                    transfers.push(JSON.parse(transferJson));
                }
            } catch (error) {
                console.error('[Backfill] Error parsing transfer:', error);
            }
        }
    }

    console.log(`[Backfill] Found ${transfers.length} transfers`);

    // Get existing audit entries to avoid duplicates
    const existingAuditEntries = new Set<string>();
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('audit_')) {
            try {
                const auditJson = localStorage.getItem(key);
                if (auditJson) {
                    const audit: AuditEntry = JSON.parse(auditJson);
                    existingAuditEntries.add(`${audit.requirementId}-${audit.action}`);
                }
            } catch (error) {
                console.error('[Backfill] Error parsing audit entry:', error);
            }
        }
    }

    console.log(`[Backfill] Found ${existingAuditEntries.size} existing audit entries`);

    // Create audit entries for each transfer
    transfers.forEach(transfer => {
        const transferKey = `${transfer.id}-CREATED`;

        // Only create if doesn't exist
        if (!existingAuditEntries.has(transferKey)) {
            // Create CREATED entry
            const createdAudit: AuditEntry = {
                id: `audit-backfill-${transfer.id}-created`,
                requirementId: transfer.id,
                action: 'CREATED',
                performedBy: transfer.createdBy || 'End User',
                performedByRole: 'END_USER',
                performedAt: transfer.createdAt,
                newStatus: 'PENDING',
                note: `Transfer request created: ${transfer.name}`
            };

            localStorage.setItem(`audit_${createdAudit.id}`, JSON.stringify(createdAudit));
            console.log(`[Backfill] Created CREATED audit for transfer ${transfer.id}`);
        }

        // Check if transfer was escalated
        if (transfer.escalatedTo && transfer.escalatedAt) {
            const escalatedKey = `${transfer.id}-ESCALATED`;
            if (!existingAuditEntries.has(escalatedKey)) {
                const escalatedAudit: AuditEntry = {
                    id: `audit-backfill-${transfer.id}-escalated`,
                    requirementId: transfer.id,
                    action: 'ESCALATED',
                    performedBy: transfer.escalatedBy || 'End User',
                    performedByRole: 'END_USER',
                    performedAt: transfer.escalatedAt,
                    newStatus: 'ESCALATED',
                    previousStatus: 'PENDING',
                    escalatedTo: transfer.escalatedTo,
                    escalationReason: transfer.escalationReason || 'Transfer escalated',
                    note: transfer.escalationReason || 'Transfer escalated for review'
                };

                localStorage.setItem(`audit_${escalatedAudit.id}`, JSON.stringify(escalatedAudit));
                console.log(`[Backfill] Created ESCALATED audit for transfer ${transfer.id}`);
            }
        }

        // Check if transfer has been reviewed (has reviewData)
        if (transfer.reviewData) {
            const reviewKey = `${transfer.id}-${transfer.reviewData.overallDecision}`;
            if (!existingAuditEntries.has(reviewKey)) {
                const action: AuditEntry['action'] =
                    transfer.reviewData.overallDecision === 'APPROVED' ? 'APPROVED' :
                        transfer.reviewData.overallDecision === 'REJECTED' ? 'REJECTED' : 'REVIEWED';

                const reviewAudit: AuditEntry = {
                    id: `audit-backfill-${transfer.id}-review`,
                    requirementId: transfer.id,
                    action,
                    performedBy: transfer.reviewData.reviewedBy || 'Admin',
                    performedByRole: transfer.reviewData.reviewedBy?.includes('legal') ? 'LEGAL' : 'ADMIN',
                    performedAt: transfer.reviewData.reviewedAt || new Date().toISOString(),
                    newStatus: transfer.reviewData.overallDecision as RequirementStatus,
                    previousStatus: 'UNDER_REVIEW',
                    note: transfer.reviewData.adminComments || `Transfer ${action.toLowerCase()}`
                };

                localStorage.setItem(`audit_${reviewAudit.id}`, JSON.stringify(reviewAudit));
                console.log(`[Backfill] Created ${action} audit for transfer ${transfer.id}`);
            }
        }

        // Check for evidence submissions
        const evidence: Evidence[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('evidence_')) {
                try {
                    const evidenceJson = localStorage.getItem(key);
                    if (evidenceJson) {
                        const ev: Evidence = JSON.parse(evidenceJson);
                        // Check if evidence belongs to this transfer
                        if (ev.requirementId.includes(transfer.id) || ev.merTransferId === transfer.id) {
                            evidence.push(ev);
                        }
                    }
                } catch (error) {
                    console.error('[Backfill] Error parsing evidence:', error);
                }
            }
        }

        // Create audit entries for evidence submissions
        evidence.forEach(ev => {
            const evidenceKey = `${ev.requirementId}-SUBMITTED`;
            if (!existingAuditEntries.has(evidenceKey)) {
                const submittedAudit: AuditEntry = {
                    id: `audit-backfill-${ev.id}-submitted`,
                    requirementId: ev.requirementId,
                    action: 'SUBMITTED',
                    performedBy: ev.uploadedBy || 'End User',
                    performedByRole: 'END_USER',
                    performedAt: ev.uploadedAt,
                    newStatus: 'PENDING',
                    evidenceIds: [ev.id],
                    note: `Evidence submitted: ${ev.filename}`
                };

                localStorage.setItem(`audit_${submittedAudit.id}`, JSON.stringify(submittedAudit));
                console.log(`[Backfill] Created SUBMITTED audit for evidence ${ev.id}`);
            }

            // If evidence was reviewed
            if (ev.reviewedAt && ev.reviewerId) {
                const reviewAction: AuditEntry['action'] =
                    ev.status === 'APPROVED' ? 'APPROVED' :
                        ev.status === 'REJECTED' ? 'REJECTED' :
                            ev.status === 'ESCALATED' ? 'ESCALATED' : 'REVIEWED';

                const evidenceReviewKey = `${ev.requirementId}-${reviewAction}`;
                if (!existingAuditEntries.has(evidenceReviewKey)) {
                    const reviewAudit: AuditEntry = {
                        id: `audit-backfill-${ev.id}-review`,
                        requirementId: ev.requirementId,
                        action: reviewAction,
                        performedBy: ev.reviewerId,
                        performedByRole: ev.reviewerId.includes('legal') ? 'LEGAL' : 'ADMIN',
                        performedAt: ev.reviewedAt,
                        newStatus: ev.status,
                        previousStatus: 'PENDING',
                        note: ev.reviewerNote || `Evidence ${reviewAction.toLowerCase()}`,
                        evidenceIds: [ev.id]
                    };

                    if (reviewAction === 'ESCALATED' && ev.escalatedTo) {
                        reviewAudit.escalatedTo = ev.escalatedTo;
                        reviewAudit.escalationReason = ev.escalationReason;
                    }

                    localStorage.setItem(`audit_${reviewAudit.id}`, JSON.stringify(reviewAudit));
                    console.log(`[Backfill] Created ${reviewAction} audit for evidence ${ev.id}`);
                }
            }
        });
    });

    console.log('[Backfill] Audit trail backfill completed');
};

// Auto-run on import if in development mode
if (import.meta.env.DEV) {
    // Run backfill once on app load
    const hasRunBackfill = localStorage.getItem('audit_backfill_completed');
    if (!hasRunBackfill) {
        console.log('[Backfill] Running one-time audit trail backfill...');
        backfillAuditTrailForExistingTransfers();
        localStorage.setItem('audit_backfill_completed', new Date().toISOString());
    }
}
