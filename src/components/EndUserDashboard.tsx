import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Transfer, RequirementRow, Evidence } from '../types/index';
import { useEvidenceApi } from '../hooks/useEvidenceApi';
import { FiLayers, FiCheckCircle, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { colors } from '../styles/designTokens';
import UploadEvidenceModal from './UploadEvidenceModal';
import AuditTrailModal from './AuditTrailModal';
import Sidebar, { SidebarGroup } from './common/Sidebar';
import { DashboardStats, StatItem } from './common/DashboardStats';
import StatusChip from './StatusChip';

// Styled Components - Following Admin/Legal Dashboard Pattern
const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
`;

const SidebarWrapper = styled.div`
  flex-shrink: 0;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  min-height: 0;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  flex: 1;
  min-height: 0;
`;

const Th = styled.th`
  background: #f8f8f8;
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 500;
  color: #333;
  border-bottom: 2px solid #eee;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #eee;
  color: #666;
  vertical-align: top;
`;

const Tr = styled.tr`
  &:hover {
    background: #f9f9f9;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  border: 1px solid ${props => {
    if (props.variant === 'danger') return '#F44336';
    return props.variant === 'primary' ? '#222' : '#ccc';
  }};
  background: ${props => {
    if (props.variant === 'danger') return '#F44336';
    return props.variant === 'primary' ? '#222' : 'white';
  }};
  color: ${props => props.variant === 'primary' || props.variant === 'danger' ? 'white' : '#222'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  margin-right: 0.5rem;

  &:hover {
    background: ${props => {
      if (props.variant === 'danger') return '#d32f2f';
      return props.variant === 'primary' ? '#444' : '#f8f8f8';
    }};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
`;

const SLABadge = styled.span<{ $type: 'breached' | 'approaching' | 'ok' }>`
  display: inline-block;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: white;
  
  background-color: ${props => {
    switch (props.$type) {
      case 'breached':
        return '#F44336';
      case 'approaching':
        return '#FFA000';
      default:
        return '#4CAF50';
    }
  }};
`;

const ProgressText = styled.span`
  font-size: 0.75rem;
  color: #666;
`;

type SidebarItemType = 'my-transfers' | 'requirements' | 'evidence';

const EndUserDashboard: React.FC = () => {
  const [activeItem, setActiveItem] = useState<SidebarItemType>('my-transfers');
  const [sidebarGroups, setSidebarGroups] = useState<SidebarGroup[]>([
    {
      id: 'dashboard',
      label: 'Dashboard',
      isExpanded: true,
      items: [
        { id: 'my-transfers', label: 'My Transfers' },
        { id: 'requirements', label: 'Requirements' },
        { id: 'evidence', label: 'Uploaded Evidence' }
      ]
    }
  ]);

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [requirements, setRequirements] = useState<RequirementRow[]>([]);
  const [uploadedEvidence, setUploadedEvidence] = useState<Evidence[]>([]);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<RequirementRow | null>(null);

  const [selectedTransferForAudit, setSelectedTransferForAudit] = useState<Transfer | null>(null);

  const {
    getTransfers,
    getAllEvidence,
    getTransferRequirements,
    escalateTransfer,
  } = useEvidenceApi();

  // Load data
  const refreshAllData = useCallback(async () => {
    try {
      const transfersData = await getTransfers();
      const evidenceData = await getAllEvidence();
      
      const transfersWithEvidence = transfersData.filter(transfer => {
        if (transfer.createdBy === 'current-user') return true;
        
        const hasLinkedEvidence = evidenceData.some(evidence => 
          evidence.requirementId.includes(transfer.id)
        );
        if (hasLinkedEvidence) return true;
        
        return evidenceData.some(evidence => 
          evidence.requirementId.includes(transfer.entity.toLowerCase().replace(/\s+/g, '-')) &&
          evidence.requirementId.includes(transfer.jurisdiction.toLowerCase().replace(/\s+/g, '-'))
        );
      });
      
      const uniqueTransfers = Array.from(
        new Map(transfersWithEvidence.map(transfer => [transfer.id, transfer])).values()
      );
      
      setTransfers(uniqueTransfers);
      setUploadedEvidence(evidenceData);

      // If a transfer is selected, load its requirements
      if (selectedTransferId) {
        const requirementsData = await getTransferRequirements(selectedTransferId);
        setRequirements(requirementsData);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [getTransfers, getAllEvidence, getTransferRequirements, selectedTransferId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await refreshAllData();
      setLoading(false);
    };
    loadData();
  }, [refreshAllData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshAllData, 30000);
    return () => clearInterval(interval);
  }, [refreshAllData]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = transfers.length;
    const pending = transfers.filter(t => t.status === 'PENDING' || t.status === 'ACTIVE').length;
    const approved = transfers.filter(t => t.status === 'COMPLETED').length;
    const escalated = transfers.filter(t => !!t.escalatedTo).length;
    
    return { total, pending, approved, escalated };
  }, [transfers]);

  // Get actual status
  const getActualStatus = (transfer: Transfer): 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ESCALATED' => {
    // Check requirements first - if they've been reviewed, that takes priority
    if (transfer.requirements && transfer.requirements.length > 0) {
      const allApproved = transfer.requirements.every(req => req.status === 'APPROVED');
      const hasRejected = transfer.requirements.some(req => req.status === 'REJECTED');
      const hasUnderReview = transfer.requirements.some(req => req.status === 'UNDER_REVIEW');
      
      // Final statuses take priority over escalation
      if (hasRejected) return 'REJECTED';
      if (allApproved) return 'APPROVED';
      
      // Check for escalation only if not yet reviewed
      const hasEscalated = transfer.requirements.some(req => req.status === 'ESCALATED');
      if (hasEscalated || transfer.status === 'ESCALATED' || transfer.escalatedTo || transfer.escalatedAt) {
        return 'ESCALATED';
      }
      
      if (hasUnderReview) return 'UNDER_REVIEW';
      return 'PENDING';
    }
    
    // Fallback to transfer status
    if (transfer.status === 'COMPLETED') return 'APPROVED';
    if (transfer.status === 'ESCALATED' || transfer.escalatedTo || transfer.escalatedAt) return 'ESCALATED';
    if (transfer.status === 'ACTIVE') return 'UNDER_REVIEW';
    return 'PENDING';
  };

  // Calculate progress
  const getProgress = (transfer: Transfer): { approved: number; total: number } => {
    const total = transfer.requirements?.length || 0;
    const approved = transfer.requirements?.filter(req => req.status === 'APPROVED').length || 0;
    return { approved, total };
  };

  // Calculate SLA status
  const getSLAStatus = (transfer: Transfer): { status: 'breached' | 'approaching' | 'ok'; daysRemaining: number } => {
    const oldestRequirement = transfer.requirements
      ?.filter(req => req.status === 'PENDING' || req.status === 'UNDER_REVIEW')
      .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())[0];
    
    if (!oldestRequirement) return { status: 'ok', daysRemaining: 0 };
    
    const relatedEvidence = uploadedEvidence.filter(e => 
      e.requirementId.includes(transfer.id) || 
      e.requirementId.includes(oldestRequirement.id)
    );
    
    const oldestDate = relatedEvidence.length > 0
      ? new Date(Math.min(
          ...relatedEvidence.map(e => new Date(e.uploadedAt).getTime()),
          new Date(oldestRequirement.updatedAt).getTime()
        ))
      : new Date(oldestRequirement.updatedAt);
    
    const slaDueDate = new Date(oldestDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysRemaining = Math.ceil((slaDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) return { status: 'breached', daysRemaining: Math.abs(daysRemaining) };
    if (daysRemaining <= 2) return { status: 'approaching', daysRemaining };
    return { status: 'ok', daysRemaining };
  };

  const handleSidebarItemClick = (itemId: string) => {
    setActiveItem(itemId as SidebarItemType);
  };

  const handleSidebarGroupToggle = (groupId: string) => {
    setSidebarGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isExpanded: !group.isExpanded }
        : group
    ));
  };

  const handleUploadClick = (requirement: RequirementRow) => {
    setSelectedRequirement(requirement);
    setShowUploadModal(true);
  };

  const handleViewAudit = (requirement: RequirementRow) => {
    setSelectedRequirement(requirement);
    setShowAuditModal(true);
  };

  const handleEscalate = async (transfer: Transfer) => {
    if (window.confirm('Are you sure you want to escalate this transfer? This will mark it as high priority.')) {
      try {
        await escalateTransfer(transfer.id, 'Escalated by End User due to SLA concerns');
        await refreshAllData();
        alert('Transfer has been escalated successfully.');
      } catch (error) {
        console.error('Failed to escalate:', error);
        alert('Failed to escalate transfer. Please try again.');
      }
    }
  };

  const handleViewTransfer = (transfer: Transfer) => {
    setSelectedTransferForAudit(transfer);
    // Also select properties to view requirements if needed
    setSelectedTransferId(transfer.id);
  };
  
  const handleSelectTransfer = async (transferId: string) => {
    setSelectedTransferId(transferId);
    setActiveItem('requirements'); // Switch to Requirements tab
    try {
      const requirementsData = await getTransferRequirements(transferId);
      setRequirements(requirementsData);
    } catch (error) {
      console.error('Failed to load requirements:', error);
    }
  };

  // Render My Transfers
  const renderMyTransfers = () => {
    const statItems: StatItem[] = [
      {
        label: 'Total Transfers',
        value: stats.total,
        icon: <FiLayers />,
        color: colors.status.underReview,
        subtext: 'All active transfers'
      },
      {
        label: 'Pending Review',
        value: stats.pending,
        icon: <FiClock />,
        color: colors.status.pending,
        subtext: 'Awaiting action'
      },
      {
        label: 'Approved',
        value: stats.approved,
        icon: <FiCheckCircle />,
        color: colors.status.approved,
        subtext: 'Successfully completed'
      },
      {
        label: 'Escalated',
        value: stats.escalated,
        icon: <FiAlertTriangle />,
        color: colors.status.escalated,
        subtext: 'Requires attention',
        highlight: stats.escalated > 0
      }
    ];

    return (
      <>
        <DashboardStats items={statItems} />

        <Section>
          {loading ? (
            <LoadingMessage>Loading transfers...</LoadingMessage>
          ) : transfers.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <Th>Transfer Name</Th>
                  <Th>Jurisdiction</Th>
                  <Th>Entity</Th>
                  <Th>Progress</Th>
                  <Th>SLA Status</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((transfer) => {
                  const actualStatus = getActualStatus(transfer);
                  const progress = getProgress(transfer);
                  const slaStatus = getSLAStatus(transfer);
                  const canEscalate = (slaStatus.status === 'breached' || slaStatus.status === 'approaching') && 
                                     !transfer.escalatedTo && 
                                     actualStatus !== 'APPROVED';

                  return (
                    <Tr key={transfer.id}>
                      <Td>
                        <div style={{ lineHeight: '1.3' }}>
                          <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{transfer.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#888', fontFamily: 'monospace' }}>{transfer.id}</div>
                        </div>
                      </Td>
                      <Td>{transfer.jurisdiction}</Td>
                      <Td>{transfer.entity}</Td>
                      <Td>
                        <ProgressText>{progress.approved} / {progress.total}</ProgressText>
                      </Td>
                      <Td>
                        <SLABadge $type={slaStatus.status}>
                          {slaStatus.status === 'breached' 
                            ? `${slaStatus.daysRemaining}d overdue`
                            : slaStatus.status === 'approaching'
                            ? `${slaStatus.daysRemaining}d left`
                            : 'On track'}
                        </SLABadge>
                      </Td>
                      <Td>
                        <StatusChip status={actualStatus} />
                      </Td>
                      <Td>
                        <Button
                          variant="secondary"
                          onClick={() => handleViewTransfer(transfer)}
                        >
                          View
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => handleSelectTransfer(transfer.id)}
                        >
                          Details
                        </Button>
                        {canEscalate && (
                          <Button
                            variant="danger"
                            onClick={() => handleEscalate(transfer)}
                          >
                            Escalate
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <NoDataMessage>No transfers found</NoDataMessage>
          )}
        </Section>
      </>
    );
  };

  // Render Requirements
  const renderRequirements = () => (
    <Section>
      {loading ? (
        <LoadingMessage>Loading requirements...</LoadingMessage>
      ) : requirements.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <Th>Requirement</Th>
              <Th>Jurisdiction</Th>
              <Th>Entity</Th>
              <Th>Subject Type</Th>
              <Th>Status</Th>
              <Th>Last Updated</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((requirement) => (
              <Tr key={requirement.id}>
                <Td>
                  <div style={{ lineHeight: '1.3' }}>
                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{requirement.name}</div>
                    {requirement.description && (
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>
                        {requirement.description}
                      </div>
                    )}
                  </div>
                </Td>
                <Td>{requirement.jurisdiction}</Td>
                <Td>{requirement.entity}</Td>
                <Td>{requirement.subjectType}</Td>
                <Td>
                  <StatusChip status={requirement.status} />
                </Td>
                <Td>{new Date(requirement.updatedAt).toLocaleDateString()}</Td>
                <Td>
                  <Button
                    variant="primary"
                    onClick={() => handleUploadClick(requirement)}
                    disabled={requirement.status === 'APPROVED'}
                  >
                    Upload
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleViewAudit(requirement)}
                  >
                    View
                  </Button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <NoDataMessage>
          {selectedTransferId 
            ? 'No requirements found for the selected transfer'
            : 'Select a transfer to view requirements'}
        </NoDataMessage>
      )}
    </Section>
  );

  // Render Evidence
  const renderEvidence = () => (
    <Section>
      {loading ? (
        <LoadingMessage>Loading evidence...</LoadingMessage>
      ) : uploadedEvidence.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <Th>File Name</Th>
              <Th>Entity</Th>
              <Th>Country</Th>
              <Th>File Size</Th>
              <Th>Upload Date</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {uploadedEvidence.map((evidence) => {
              // Extract entity and country from requirementId
              const parts = evidence.requirementId.split('-');
              const entity = parts[1]?.replace(/-/g, ' ') || 'Unknown';
              const country = parts[2]?.replace(/-/g, ' ') || 'Unknown';
              
              const formatFileSize = (bytes: number): string => {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
              };

              return (
                <Tr key={evidence.id}>
                  <Td>
                    <div style={{ lineHeight: '1.3' }}>
                      <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{evidence.filename}</div>
                      {evidence.description && (
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>
                          {evidence.description}
                        </div>
                      )}
                    </div>
                  </Td>
                  <Td>{entity}</Td>
                  <Td>{country}</Td>
                  <Td>{formatFileSize(evidence.size)}</Td>
                  <Td>{new Date(evidence.uploadedAt).toLocaleDateString()}</Td>
                  <Td>
                    <StatusChip status={evidence.status} />
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <NoDataMessage>No evidence uploaded yet</NoDataMessage>
      )}
    </Section>
  );

  return (
    <Container>
      <SidebarWrapper>
        <Sidebar
          groups={sidebarGroups}
          activeItemId={activeItem}
          onItemClick={handleSidebarItemClick}
          onGroupToggle={handleSidebarGroupToggle}
        />
      </SidebarWrapper>
      
      <MainContent>
        {activeItem === 'my-transfers' && renderMyTransfers()}
        {activeItem === 'requirements' && renderRequirements()}
        {activeItem === 'evidence' && renderEvidence()}
      </MainContent>

      {/* Modals */}
      {showUploadModal && selectedRequirement && (
        <UploadEvidenceModal
          requirement={selectedRequirement}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            refreshAllData();
          }}
        />
      )}

      {showAuditModal && selectedRequirement && (
        <AuditTrailModal
          requirement={selectedRequirement}
          onClose={() => setShowAuditModal(false)}
        />
      )}
      
      {/* Transfer Audit Trail Modal */}
      {selectedTransferForAudit && (
        <AuditTrailModal
          transfer={selectedTransferForAudit}
          onClose={() => setSelectedTransferForAudit(null)}
        />
      )}
    </Container>
  );
};

export default EndUserDashboard;
