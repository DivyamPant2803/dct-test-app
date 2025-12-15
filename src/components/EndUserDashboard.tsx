import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Transfer, RequirementRow, Evidence } from '../types/index';
import { useEvidenceApi } from '../hooks/useEvidenceApi';
import UploadEvidenceModal from './UploadEvidenceModal';
import StatusChip from './StatusChip';
import AuditTrailModal from './AuditTrailModal';
import StyledSelect from './common/StyledSelect';
import { TransferCard, EmptyState } from './common';
import { FiEye, FiTrash2, FiDownload, FiRefreshCw, FiAlertTriangle, FiSearch, FiLayers, FiCheckCircle } from 'react-icons/fi';
import { DashboardStats } from './common/DashboardStats';
import { colors, borderRadius, shadows, spacing, transitions } from '../styles/designTokens';

const DashboardContainer = styled.div`
  width: 100%;
  height: 100%;
  background: ${colors.background.default};
  padding: ${spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl};
  overflow-y: auto;
`;

const RefreshButton = styled.button`
  position: fixed;
  top: 100px;
  right: 2rem;
  background: #222;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition: all 0.2s ease;
  z-index: 1000;

  &:hover {
    background: #444;
    transform: translateY(-2px);
  }
`;

const Section = styled.div`
  background: ${colors.background.paper};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.base};
  padding: ${spacing.xl};
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.lg};
  border-bottom: 2px solid ${colors.neutral.gray300};
  padding-bottom: ${spacing.sm};
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;



const FilterBar = styled.div`
  display: flex;
  gap: ${spacing.base};
  margin-bottom: ${spacing.lg};
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: ${spacing.sm} ${spacing.base};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.875rem;
  transition: all ${transitions.base};
  
  &:focus {
    outline: none;
    border-color: ${colors.status.underReview};
    box-shadow: 0 0 0 3px ${colors.status.underReview}20;
  }
`;

const FilterSelect = styled(StyledSelect)`
  min-width: 150px;
`;

const TransfersGrid = styled.div`
  display: grid;
  gap: ${spacing.lg};
  margin-top: ${spacing.lg};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  background: #f8f8f8;
  padding: 1rem;
  text-align: left;
  font-weight: 500;
  color: #333;
  border-bottom: 2px solid #eee;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  color: #666;
  vertical-align: middle;
`;

const Tr = styled.tr`
  &:hover {
    background: #f9f9f9;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid ${props => props.variant === 'primary' ? '#222' : '#ccc'};
  background: ${props => props.variant === 'primary' ? '#222' : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : '#222'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#444' : '#f8f8f8'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ActionButton = styled(Button)`
  margin-right: 0.5rem;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
`;

const EvidenceButton = styled.button<{ variant?: 'view' | 'delete' | 'download' }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.6rem;
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'view': return '#3b82f6';
      case 'delete': return '#ef4444';
      case 'download': return '#10b981';
      default: return '#e5e5e5';
    }
  }};
  border-radius: 4px;
  background: white;
  color: ${props => {
    switch (props.variant) {
      case 'view': return '#3b82f6';
      case 'delete': return '#ef4444';
      case 'download': return '#10b981';
      default: return '#555';
    }
  }};
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 0.25rem;

  &:hover {
    background: ${props => {
      switch (props.variant) {
        case 'view': return '#eff6ff';
        case 'delete': return '#fef2f2';
        case 'download': return '#f0fdf4';
        default: return '#f8f9fa';
      }
    }};
  }

  &:active {
    transform: translateY(1px);
  }
`;

const FilePreview = styled.div`
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  margin-top: 0.5rem;
  font-size: 0.8rem;
`;

const FileName = styled.div`
  font-weight: 500;
  color: #222;
  margin-bottom: 0.25rem;
`;

const FileMeta = styled.div`
  color: #666;
  font-size: 0.75rem;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
`;



const EndUserDashboard: React.FC = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [selectedTransferId, setSelectedTransferId] = useState<string>('');
  const [requirements, setRequirements] = useState<RequirementRow[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<RequirementRow | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedEvidence, setUploadedEvidence] = useState<Evidence[]>([]);
  const [showEvidencePreview, setShowEvidencePreview] = useState<Evidence | null>(null);
  const [showEscalateConfirm, setShowEscalateConfirm] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { getTransfers, getTransferRequirements, getAllEvidence, deleteEvidence, previewEvidence, escalateTransfer } = useEvidenceApi();

  // Function to refresh all data
  const refreshAllData = useCallback(async () => {
    try {
      // Refresh transfers
      const transfersData = await getTransfers();
      const evidenceData = await getAllEvidence();
      
      // Use the same filter logic as loadTransfers
      const transfersWithEvidence = transfersData.filter(transfer => {
        // Show transfers created by current user (Central Inventory transfers)
        if (transfer.createdBy === 'current-user') {
          return true;
        }
        
        // Check if evidence is linked via transferId in requirementId
        const hasLinkedEvidence = evidenceData.some(evidence => 
          evidence.requirementId.includes(transfer.id)
        );
        if (hasLinkedEvidence) {
          return true;
        }
        
        // Check if evidence matches entity/jurisdiction pattern (Guidance page)
        return evidenceData.some(evidence => 
          evidence.requirementId.includes(transfer.entity.toLowerCase().replace(/\s+/g, '-')) &&
          evidence.requirementId.includes(transfer.jurisdiction.toLowerCase().replace(/\s+/g, '-'))
        );
      });
      
      // Deduplicate transfers by id to ensure each transfer appears only once
      const uniqueTransfers = Array.from(
        new Map(transfersWithEvidence.map(transfer => [transfer.id, transfer])).values()
      );
      
      setTransfers(uniqueTransfers);
      
      // Refresh requirements if a transfer is selected
      if (selectedTransferId) {
        const requirementsData = await getTransferRequirements(selectedTransferId);
        setRequirements(requirementsData);
      }
      
      // Refresh evidence
      setUploadedEvidence(evidenceData);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [getTransfers, getAllEvidence, getTransferRequirements, selectedTransferId]);

  useEffect(() => {
    const loadTransfers = async () => {
      setLoading(true);
      try {
        const transfersData = await getTransfers();
        const evidenceData = await getAllEvidence();
        
        // Filter transfers to show:
        // 1. Transfers created by current-user (for Central Inventory)
        // 2. Transfers that have evidence linked via transferId in requirementId
        // 3. Transfers that have evidence matching entity/jurisdiction (for Guidance page)
        const transfersWithEvidence = transfersData.filter(transfer => {
          // Show transfers created by current user (Central Inventory transfers)
          if (transfer.createdBy === 'current-user') {
            return true;
          }
          
          // Check if evidence is linked via transferId in requirementId
          const hasLinkedEvidence = evidenceData.some(evidence => 
            evidence.requirementId.includes(transfer.id)
          );
          if (hasLinkedEvidence) {
            return true;
          }
          
          // Check if evidence matches entity/jurisdiction pattern (Guidance page)
          return evidenceData.some(evidence => 
            evidence.requirementId.includes(transfer.entity.toLowerCase().replace(/\s+/g, '-')) &&
            evidence.requirementId.includes(transfer.jurisdiction.toLowerCase().replace(/\s+/g, '-'))
          );
        });
        
        // Deduplicate transfers by id to ensure each transfer appears only once
        const uniqueTransfers = Array.from(
          new Map(transfersWithEvidence.map(transfer => [transfer.id, transfer])).values()
        );
        
        setTransfers(uniqueTransfers);
        if (uniqueTransfers.length > 0) {
          setSelectedTransferId(uniqueTransfers[0].id);
        }
      } catch (error) {
        console.error('Failed to load transfers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransfers();
  }, [getTransfers, getAllEvidence]);

  useEffect(() => {
    const loadRequirements = async () => {
      if (!selectedTransferId) return;
      
      setLoading(true);
      try {
        const data = await getTransferRequirements(selectedTransferId);
        setRequirements(data);
      } catch (error) {
        console.error('Failed to load requirements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRequirements();
  }, [selectedTransferId, getTransferRequirements]);

  useEffect(() => {
    const loadUploadedEvidence = async () => {
      try {
        // Load all evidence for the user
        const evidence = await getAllEvidence();
        setUploadedEvidence(evidence);
      } catch (error) {
        console.error('Failed to load uploaded evidence:', error);
      }
    };

    loadUploadedEvidence();
  }, [getAllEvidence]);

  // Refresh data when component mounts or when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      refreshAllData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshAllData]);

  // Refresh data periodically to catch updates from admin reviews
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAllData();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [refreshAllData]);

  const handleUploadClick = (requirement: RequirementRow) => {
    setSelectedRequirement(requirement);
    setShowUploadModal(true);
  };

  const handleViewAudit = (requirement: RequirementRow) => {
    setSelectedRequirement(requirement);
    setShowAuditModal(true);
  };

  const handleUploadSuccess = () => {
    // Refresh requirements to show updated status
    const loadRequirements = async () => {
      if (!selectedTransferId) return;
      try {
        const data = await getTransferRequirements(selectedTransferId);
        setRequirements(data);
      } catch (error) {
        console.error('Failed to refresh requirements:', error);
      }
    };
    loadRequirements();

    // Refresh uploaded evidence
    const loadUploadedEvidence = async () => {
      try {
        const evidence = await getAllEvidence();
        setUploadedEvidence(evidence);
      } catch (error) {
        console.error('Failed to refresh uploaded evidence:', error);
      }
    };
    loadUploadedEvidence();
  };

  const handleViewEvidence = (evidence: Evidence) => {
    // Use the new preview function to open the actual file
    previewEvidence(evidence);
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    if (window.confirm('Are you sure you want to delete this evidence?')) {
      try {
        await deleteEvidence(evidenceId);
        // Refresh the evidence list
        const evidence = await getAllEvidence();
        setUploadedEvidence(evidence);
      } catch (error) {
        console.error('Failed to delete evidence:', error);
        alert('Failed to delete evidence. Please try again.');
      }
    }
  };

  const handleDownloadEvidence = (evidence: Evidence) => {
    if (evidence.base64Data) {
      // Convert base64 to blob and trigger download
      const byteCharacters = atob(evidence.base64Data.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: `application/${evidence.fileType.toLowerCase()}` });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = evidence.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate SLA status for a transfer
  const getSLAStatus = (transfer: Transfer): { status: 'breached' | 'approaching' | 'ok'; daysRemaining: number; slaDueDate: Date | null } => {
    // Find the oldest pending requirement or evidence upload date
    const oldestRequirement = transfer.requirements
      .filter(req => req.status === 'PENDING' || req.status === 'UNDER_REVIEW')
      .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())[0];
    
    if (!oldestRequirement) {
      return { status: 'ok', daysRemaining: 0, slaDueDate: null };
    }
    
    // Find related evidence for this requirement
    const relatedEvidence = uploadedEvidence.filter(e => 
      e.requirementId.includes(transfer.id) || 
      e.requirementId.includes(oldestRequirement.id)
    );
    
    // Use the oldest upload date (either requirement update or evidence upload)
    const oldestDate = relatedEvidence.length > 0
      ? new Date(Math.min(
          ...relatedEvidence.map(e => new Date(e.uploadedAt).getTime()),
          new Date(oldestRequirement.updatedAt).getTime()
        ))
      : new Date(oldestRequirement.updatedAt);
    
    // SLA is 7 days from the oldest date
    const slaDueDate = new Date(oldestDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysRemaining = Math.ceil((slaDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      return { status: 'breached', daysRemaining: Math.abs(daysRemaining), slaDueDate };
    } else if (daysRemaining <= 2) {
      return { status: 'approaching', daysRemaining, slaDueDate };
    }
    
    return { status: 'ok', daysRemaining, slaDueDate };
  };

  const handleEscalate = async () => {
    if (!selectedTransfer) return;
    
    setEscalating(true);
    try {
      await escalateTransfer(selectedTransfer.id, 'SLA breach or approaching breach - escalated by End User');
      setShowEscalateConfirm(false);
      // Refresh data after escalation
      await refreshAllData();
      alert('Transfer has been escalated to Admin with high priority.');
    } catch (error) {
      console.error('Failed to escalate transfer:', error);
      alert('Failed to escalate transfer. Please try again.');
    } finally {
      setEscalating(false);
    }
  };

  const selectedTransfer = transfers.find(t => t.id === selectedTransferId);

  // Calculate stats
  const stats = useMemo(() => {
    const total = transfers.length;
    const pending = transfers.filter(t => t.status === 'PENDING' || t.status === 'ACTIVE').length;
    const approved = transfers.filter(t => t.status === 'COMPLETED').length;
    const escalated = transfers.filter(t => !!t.escalatedTo).length;
    
    return { total, pending, approved, escalated };
  }, [transfers]);

  // Filter transfers based on search and status
  const filteredTransfers = useMemo(() => {
    return transfers.filter(transfer => {
      const matchesSearch = !searchQuery || 
        transfer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.jurisdiction.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.entity.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = !statusFilter || 
        (statusFilter === 'pending' && (transfer.status === 'PENDING' || transfer.status === 'ACTIVE')) ||
        (statusFilter === 'completed' && transfer.status === 'COMPLETED') ||
        (statusFilter === 'escalated' && !!transfer.escalatedTo);
      
      return matchesSearch && matchesStatus;
    });
  }, [transfers, searchQuery, statusFilter]);

  // Filter evidence based on selected transfer
  const filteredEvidence = selectedTransferId 
    ? uploadedEvidence.filter(evidence => {
        // Check if evidence is linked via transferId in requirementId (Central Inventory)
        if (evidence.requirementId.includes(selectedTransferId)) {
          return true;
        }
        
        // Check if evidence matches entity/jurisdiction pattern (Guidance page)
        if (selectedTransfer) {
          return evidence.requirementId.includes(selectedTransfer.entity.toLowerCase().replace(/\s+/g, '-')) &&
                 evidence.requirementId.includes(selectedTransfer.jurisdiction.toLowerCase().replace(/\s+/g, '-'));
        }
        
        return false;
      })
    : uploadedEvidence;

  return (
    <DashboardContainer>
      <RefreshButton onClick={refreshAllData} title="Refresh Data">
        <FiRefreshCw size={20} />
      </RefreshButton>
      
      {/* Stats Cards */}
      <DashboardStats 
        items={[
          {
            label: 'Total Transfers',
            value: stats.total,
            icon: <FiLayers />,
            subtext: 'All active transfers'
          },
          {
            label: 'Pending Review',
            value: stats.pending,
            icon: <FiRefreshCw />,
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
        ]}
      />

      {/* My Transfers Section */}
      <Section>
        <SectionTitle>
          <FiLayers />
          My Transfers
        </SectionTitle>
        
        <FilterBar>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <FiSearch 
              style={{ 
                position: 'absolute', 
                left: spacing.sm, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: colors.text.tertiary,
                pointerEvents: 'none'
              }} 
            />
            <SearchInput
              type="text"
              placeholder="Search transfers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: '', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
              { value: 'escalated', label: 'Escalated' },
            ]}
          />
        </FilterBar>

        {filteredTransfers.length > 0 ? (
          <TransfersGrid>
            {filteredTransfers.map(transfer => (
              <TransferCard
                key={transfer.id}
                transfer={transfer}
                onClick={() => setSelectedTransferId(transfer.id)}
                showTimeline={true}
              />
            ))}
          </TransfersGrid>
        ) : (
          <EmptyState
            title="No Transfers Found"
            message={searchQuery || statusFilter 
              ? "No transfers match your search criteria. Try adjusting your filters."
              : "You haven't created any transfer requests yet. Start by creating a new transfer in Central Inventory."}
            icon={<FiLayers size={48} />}
          />
        )}
        
        {selectedTransfer && (() => {
          const slaStatus = getSLAStatus(selectedTransfer);
          const canEscalate = (slaStatus.status === 'breached' || slaStatus.status === 'approaching') && 
                             !selectedTransfer.escalatedTo && 
                             selectedTransfer.status !== 'COMPLETED';
          
          return (
            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, color: '#222' }}>Transfer Details</h4>
                {canEscalate && (
                  <Button
                    variant="primary"
                    onClick={() => setShowEscalateConfirm(true)}
                    style={{ 
                      background: '#dc2626',
                      borderColor: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <FiAlertTriangle size={16} />
                    Escalate
                  </Button>
                )}
              </div>
              <p style={{ margin: '0.25rem 0', color: '#666' }}>
                <strong>Entity:</strong> {selectedTransfer.entity}
              </p>
              <p style={{ margin: '0.25rem 0', color: '#666' }}>
                <strong>Subject Type:</strong> {selectedTransfer.subjectType}
              </p>
              <p style={{ margin: '0.25rem 0', color: '#666' }}>
                <strong>Status:</strong> {selectedTransfer.status}
              </p>
              {selectedTransfer.escalatedTo && (
                <p style={{ margin: '0.25rem 0', color: '#dc2626', fontWeight: '500' }}>
                  <strong>Escalated to:</strong> {selectedTransfer.escalatedTo} (High Priority)
                </p>
              )}
              {slaStatus.slaDueDate && (
                <p style={{ 
                  margin: '0.25rem 0', 
                  color: slaStatus.status === 'breached' ? '#dc2626' : slaStatus.status === 'approaching' ? '#f59e0b' : '#666',
                  fontWeight: slaStatus.status !== 'ok' ? '500' : 'normal'
                }}>
                  <strong>SLA Status:</strong> {
                    slaStatus.status === 'breached' 
                      ? `Breached (${slaStatus.daysRemaining} days overdue)` 
                      : slaStatus.status === 'approaching'
                      ? `Approaching breach (${slaStatus.daysRemaining} days remaining)`
                      : `On track (${slaStatus.daysRemaining} days remaining)`
                  }
                </p>
              )}
            </div>
          );
        })()}
      </Section>

      {transfers.length > 0 && (
        <Section>
          <SectionTitle>Requirements for Selected Transfer</SectionTitle>
          {loading ? (
            <NoDataMessage>Loading requirements...</NoDataMessage>
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
                      <div>
                        <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                          {requirement.name}
                        </div>
                        {requirement.description && (
                          <div style={{ fontSize: '0.8rem', color: '#888' }}>
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
                      <ActionButton
                        variant="primary"
                        onClick={() => handleUploadClick(requirement)}
                        disabled={requirement.status === 'APPROVED'}
                      >
                        Upload
                      </ActionButton>
                      <ActionButton
                        variant="secondary"
                        onClick={() => handleViewAudit(requirement)}
                      >
                        View
                      </ActionButton>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <NoDataMessage>No requirements found for the selected transfer</NoDataMessage>
          )}
        </Section>
      )}

      <Section>
        <SectionTitle>Uploaded Evidence</SectionTitle>
        {filteredEvidence.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Entity</Th>
                <Th>Country</Th>
                <Th>File Name</Th>
                <Th>File Size</Th>
                <Th>Upload Date</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filteredEvidence.map((evidence) => {
                // Extract entity and country - prefer from selected transfer if available
                let entity = 'Unknown Entity';
                let country = 'Unknown Country';
                
                if (selectedTransfer) {
                  // If evidence is linked via transferId, use transfer's entity/jurisdiction
                  if (evidence.requirementId.includes(selectedTransfer.id)) {
                    entity = selectedTransfer.entity || 'Unknown Entity';
                    country = selectedTransfer.jurisdiction || 'Unknown Country';
                  } else {
                    // Try to extract from requirementId (Guidance page format)
                    const parts = evidence.requirementId.split('-');
                    if (parts.length >= 3) {
                      entity = parts[1]?.replace(/-/g, ' ') || selectedTransfer.entity || 'Unknown Entity';
                      country = parts[2]?.replace(/-/g, ' ') || selectedTransfer.jurisdiction || 'Unknown Country';
                    } else {
                      entity = selectedTransfer.entity || 'Unknown Entity';
                      country = selectedTransfer.jurisdiction || 'Unknown Country';
                    }
                  }
                } else {
                  // Fallback: try to extract from requirementId
                  const parts = evidence.requirementId.split('-');
                  if (parts.length >= 3) {
                    entity = parts[1]?.replace(/-/g, ' ') || 'Unknown Entity';
                    country = parts[2]?.replace(/-/g, ' ') || 'Unknown Country';
                  }
                }
                
                return (
                <Tr key={evidence.id}>
                  <Td>{entity}</Td>
                  <Td>{country}</Td>
                  <Td>
                    <FileName>{evidence.filename}</FileName>
                    {evidence.description && (
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                        {evidence.description}
                      </div>
                    )}
                  </Td>
                  <Td>{formatFileSize(evidence.size)}</Td>
                  <Td>{new Date(evidence.uploadedAt).toLocaleDateString()}</Td>
                  <Td>
                    <StatusChip status={evidence.status} />
                  </Td>
                  <Td>
                    <EvidenceButton variant="view" onClick={() => handleViewEvidence(evidence)}>
                      <FiEye size={12} />
                      View
                    </EvidenceButton>
                    <EvidenceButton variant="download" onClick={() => handleDownloadEvidence(evidence)}>
                      <FiDownload size={12} />
                      Download
                    </EvidenceButton>
                    <EvidenceButton variant="delete" onClick={() => handleDeleteEvidence(evidence.id)}>
                      <FiTrash2 size={12} />
                      Delete
                    </EvidenceButton>
                  </Td>
                </Tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <NoDataMessage>
            {selectedTransferId 
              ? `No evidence uploaded for the selected transfer yet` 
              : 'No evidence uploaded yet'
            }
          </NoDataMessage>
        )}
      </Section>

      {showUploadModal && selectedRequirement && (
        <UploadEvidenceModal
          requirement={selectedRequirement}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {showAuditModal && selectedRequirement && (
        <AuditTrailModal
          requirement={selectedRequirement}
          onClose={() => setShowAuditModal(false)}
        />
      )}

      {showEvidencePreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }} onClick={() => setShowEvidencePreview(null)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#222' }}>Evidence Preview</h3>
              <button
                onClick={() => setShowEvidencePreview(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}
              >
                &times;
              </button>
            </div>
            
            <FilePreview>
              <FileName>{showEvidencePreview.filename}</FileName>
              <FileMeta>
                Size: {formatFileSize(showEvidencePreview.size)} | 
                Type: {showEvidencePreview.fileType} | 
                Uploaded: {new Date(showEvidencePreview.uploadedAt).toLocaleString()}
              </FileMeta>
              {showEvidencePreview.description && (
                <div style={{ marginTop: '0.5rem', color: '#333' }}>
                  <strong>Description:</strong> {showEvidencePreview.description}
                </div>
              )}
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '4px', textAlign: 'center' }}>
                File preview would be implemented here
              </div>
            </FilePreview>
          </div>
        </div>
      )}

      {showEscalateConfirm && selectedTransfer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }} onClick={() => !escalating && setShowEscalateConfirm(false)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#222', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiAlertTriangle size={24} color="#dc2626" />
                Escalate Transfer
              </h3>
              {!escalating && (
                <button
                  onClick={() => setShowEscalateConfirm(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#666',
                    padding: '0.5rem',
                    borderRadius: '4px'
                  }}
                >
                  &times;
                </button>
              )}
            </div>
            
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Are you sure you want to escalate this transfer request to Admin? This will mark it as high priority.
            </p>
            
            {selectedTransfer && (() => {
              const slaStatus = getSLAStatus(selectedTransfer);
              return (
                <div style={{ 
                  padding: '1rem', 
                  background: slaStatus.status === 'breached' ? '#fef2f2' : '#fffbeb', 
                  borderRadius: '6px',
                  marginBottom: '1.5rem'
                }}>
                  <p style={{ margin: 0, color: slaStatus.status === 'breached' ? '#dc2626' : '#f59e0b', fontWeight: '500' }}>
                    {slaStatus.status === 'breached' 
                      ? `SLA Breached: ${slaStatus.daysRemaining} days overdue`
                      : `SLA Approaching: ${slaStatus.daysRemaining} days remaining`}
                  </p>
                </div>
              );
            })()}
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button
                variant="secondary"
                onClick={() => setShowEscalateConfirm(false)}
                disabled={escalating}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleEscalate}
                disabled={escalating}
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
              >
                {escalating ? 'Escalating...' : 'Confirm Escalation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default EndUserDashboard;
