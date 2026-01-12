import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Transfer, RequirementRow, Evidence } from '../types/index';
import { useEvidenceApi } from '../hooks/useEvidenceApi';
import { 
  FiLayers, 
  FiCheckCircle, 
  FiClock, 
  FiAlertTriangle,
  FiSearch,
  FiEye,
  FiUpload,
  FiRefreshCw,
  FiFileText,
  FiCalendar,
  FiMapPin
} from 'react-icons/fi';
import { colors, borderRadius, shadows, spacing, transitions, typography } from '../styles/designTokens';
import UploadEvidenceModal from './UploadEvidenceModal';
import AuditTrailModal from './AuditTrailModal';

// Styled Components
const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${spacing.xl};
  background: ${colors.background.default};
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: ${spacing.xl};
`;

const Title = styled.h1`
  font-size: ${typography.fontSize['3xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  margin: 0 0 ${spacing.sm} 0;
  display: flex;
  align-items: center;
  gap: ${spacing.base};
`;

const Subtitle = styled.p`
  font-size: ${typography.fontSize.base};
  color: ${colors.text.secondary};
  margin: 0;
`;

// Stats Bar - Compact and Minimalistic
const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${spacing.base};
  margin-bottom: ${spacing.xl};
`;

const StatCard = styled.div<{ $color?: string; $highlight?: boolean }>`
  background: ${colors.background.paper};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.lg};
  display: flex;
  align-items: center;
  gap: ${spacing.base};
  box-shadow: ${shadows.sm};
  border-left: 4px solid ${props => props.$color || colors.neutral.gray300};
  transition: all ${transitions.base};
  
  ${props => props.$highlight && `
    box-shadow: ${shadows.md};
    transform: translateY(-2px);
  `}
`;

const StatIcon = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${borderRadius.base};
  background: ${props => props.$color ? `${props.$color}15` : colors.neutral.gray100};
  color: ${props => props.$color || colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text.primary};
  line-height: 1;
  margin-bottom: ${spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
`;

// Search and Filter Bar
const ControlBar = styled.div`
  display: flex;
  gap: ${spacing.base};
  margin-bottom: ${spacing.lg};
  flex-wrap: wrap;
  align-items: center;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${spacing.md} ${spacing.base} ${spacing.md} 40px;
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: ${typography.fontSize.base};
  transition: all ${transitions.base};
  background: ${colors.background.paper};
  
  &:focus {
    outline: none;
    border-color: ${colors.status.underReview};
    box-shadow: 0 0 0 3px ${colors.status.underReview}15;
  }
  
  &::placeholder {
    color: ${colors.text.tertiary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${colors.text.tertiary};
  pointer-events: none;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: ${spacing.md} ${spacing.lg};
  border: 1px solid ${props => props.$active ? colors.status.underReview : colors.neutral.gray300};
  background: ${props => props.$active ? colors.status.underReview : colors.background.paper};
  color: ${props => props.$active ? colors.neutral.white : colors.text.primary};
  border-radius: ${borderRadius.base};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${transitions.base};
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  
  &:hover {
    border-color: ${colors.status.underReview};
    ${props => !props.$active && `background: ${colors.background.hover};`}
  }
`;

const RefreshButton = styled.button`
  padding: ${spacing.md} ${spacing.lg};
  border: 1px solid ${colors.neutral.gray300};
  background: ${colors.background.paper};
  color: ${colors.text.primary};
  border-radius: ${borderRadius.base};
  cursor: pointer;
  transition: all ${transitions.base};
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  
  &:hover {
    background: ${colors.background.hover};
    border-color: ${colors.status.underReview};
  }
  
  &:active svg {
    animation: spin 0.5s ease;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Transfer Cards - Minimalistic Design
const TransfersGrid = styled.div`
  display: grid;
  gap: ${spacing.base};
`;

const TransferCard = styled.div<{ $selected?: boolean }>`
  background: ${colors.background.paper};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.lg};
  box-shadow: ${shadows.sm};
  border: 2px solid ${props => props.$selected ? colors.status.underReview : 'transparent'};
  cursor: pointer;
  transition: all ${transitions.base};
  
  &:hover {
    box-shadow: ${shadows.md};
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing.base};
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  flex: 1;
`;

const TransferName = styled.h3`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.text.primary};
  margin: 0;
`;

const TransferId = styled.span`
  font-size: ${typography.fontSize.xs};
  color: ${colors.text.tertiary};
  font-family: monospace;
  background: ${colors.neutral.gray100};
  padding: 2px 8px;
  border-radius: ${borderRadius.sm};
`;

const StatusBadge = styled.div<{ $status: string }>`
  padding: 4px 12px;
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${props => {
    switch (props.$status) {
      case 'APPROVED': return `${colors.status.approved}15`;
      case 'UNDER_REVIEW': return `${colors.status.underReview}15`;
      case 'ESCALATED': return `${colors.status.escalated}15`;
      case 'REJECTED': return `${colors.status.rejected}15`;
      default: return `${colors.status.pending}15`;
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'APPROVED': return colors.status.approved;
      case 'UNDER_REVIEW': return colors.status.underReview;
      case 'ESCALATED': return colors.status.escalated;
      case 'REJECTED': return colors.status.rejected;
      default: return colors.status.pending;
    }
  }};
`;

const CardMeta = styled.div`
  display: flex;
  gap: ${spacing.lg};
  margin-bottom: ${spacing.base};
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
  
  svg {
    color: ${colors.text.tertiary};
  }
`;

const ProgressBar = styled.div`
  margin-bottom: ${spacing.base};
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${spacing.xs};
  font-size: ${typography.fontSize.sm};
  color: ${colors.text.secondary};
`;

const ProgressTrack = styled.div`
  height: 6px;
  background: ${colors.neutral.gray200};
  border-radius: ${borderRadius.full};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number; $color?: string }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$color || colors.status.underReview};
  border-radius: ${borderRadius.full};
  transition: width ${transitions.slow};
`;

const CardActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  padding-top: ${spacing.base};
  border-top: 1px solid ${colors.neutral.gray200};
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  flex: 1;
  padding: ${spacing.sm} ${spacing.base};
  border: 1px solid ${props => {
    if (props.$variant === 'primary') return colors.status.underReview;
    if (props.$variant === 'danger') return colors.status.rejected;
    return colors.neutral.gray300;
  }};
  background: ${props => {
    if (props.$variant === 'primary') return colors.status.underReview;
    if (props.$variant === 'danger') return colors.status.rejected;
    return colors.background.paper;
  }};
  color: ${props => props.$variant === 'primary' || props.$variant === 'danger' ? colors.neutral.white : colors.text.primary};
  border-radius: ${borderRadius.base};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${transitions.base};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.xs};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${shadows.sm};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing['3xl']};
  background: ${colors.background.paper};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.sm};
`;

const EmptyIcon = styled.div`
  color: ${colors.text.tertiary};
  margin-bottom: ${spacing.lg};
`;

const EmptyTitle = styled.h3`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.text.primary};
  margin: 0 0 ${spacing.sm} 0;
`;

const EmptyMessage = styled.p`
  font-size: ${typography.fontSize.base};
  color: ${colors.text.secondary};
  margin: 0;
`;

const SLAWarning = styled.div<{ $type: 'breached' | 'approaching' }>`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.sm} ${spacing.base};
  background: ${props => props.$type === 'breached' ? `${colors.status.rejected}10` : `${colors.semantic.warning}10`};
  border-left: 3px solid ${props => props.$type === 'breached' ? colors.status.rejected : colors.semantic.warning};
  border-radius: ${borderRadius.sm};
  font-size: ${typography.fontSize.sm};
  color: ${props => props.$type === 'breached' ? colors.status.rejected : colors.semantic.warning};
  font-weight: ${typography.fontWeight.medium};
  margin-bottom: ${spacing.base};
`;

// Main Component
const EndUserDashboard: React.FC = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<RequirementRow | null>(null);
  const [uploadedEvidence, setUploadedEvidence] = useState<Evidence[]>([]);

  const {
    getTransfers,
    getAllEvidence,
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
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [getTransfers, getAllEvidence]);

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
    if (transfer.escalatedTo || transfer.escalatedAt) return 'ESCALATED';
    
    if (transfer.requirements && transfer.requirements.length > 0) {
      const allApproved = transfer.requirements.every(req => req.status === 'APPROVED');
      const hasRejected = transfer.requirements.some(req => req.status === 'REJECTED');
      const hasEscalated = transfer.requirements.some(req => req.status === 'ESCALATED');
      const hasUnderReview = transfer.requirements.some(req => req.status === 'UNDER_REVIEW');
      
      if (hasEscalated) return 'ESCALATED';
      if (hasRejected) return 'REJECTED';
      if (allApproved) return 'APPROVED';
      if (hasUnderReview) return 'UNDER_REVIEW';
      return 'PENDING';
    }
    
    if (transfer.status === 'COMPLETED') return 'APPROVED';
    if (transfer.status === 'ACTIVE') return 'UNDER_REVIEW';
    return 'PENDING';
  };

  // Calculate progress
  const getProgress = (transfer: Transfer): { percentage: number; approved: number; total: number } => {
    const total = transfer.requirements?.length || 0;
    const approved = transfer.requirements?.filter(req => req.status === 'APPROVED').length || 0;
    const percentage = total > 0 ? (approved / total) * 100 : 0;
    return { percentage, approved, total };
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

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    return transfers.filter(transfer => {
      const matchesSearch = !searchQuery || 
        transfer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.jurisdiction.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.entity.toLowerCase().includes(searchQuery.toLowerCase());
      
      const actualStatus = getActualStatus(transfer);
      const matchesStatus = !statusFilter || 
        (statusFilter === 'pending' && (actualStatus === 'PENDING' || actualStatus === 'UNDER_REVIEW')) ||
        (statusFilter === 'approved' && actualStatus === 'APPROVED') ||
        (statusFilter === 'escalated' && actualStatus === 'ESCALATED');
      
      return matchesSearch && matchesStatus;
    });
  }, [transfers, searchQuery, statusFilter]);

  const handleViewTransfer = (transfer: Transfer) => {
    setSelectedTransferId(transfer.id);
    // Navigate to detailed view or open modal
  };

  const handleUploadEvidence = (transfer: Transfer) => {
    // Open upload modal for the first pending requirement
    const pendingReq = transfer.requirements?.find(req => req.status !== 'APPROVED');
    if (pendingReq) {
      setSelectedRequirement(pendingReq);
      setShowUploadModal(true);
    }
  };

  const handleEscalate = async (transfer: Transfer) => {
    if (window.confirm('Are you sure you want to escalate this transfer?')) {
      try {
        await escalateTransfer(transfer.id, 'Escalated by End User');
        await refreshAllData();
      } catch (error) {
        console.error('Failed to escalate:', error);
      }
    }
  };

  return (
    <DashboardContainer>
      <Header>
        <Title>
          <FiLayers size={32} />
          My Transfers
        </Title>
        <Subtitle>Track and manage your MER submission requests</Subtitle>
      </Header>

      {/* Stats Bar */}
      <StatsBar>
        <StatCard $color={colors.status.underReview}>
          <StatIcon $color={colors.status.underReview}>
            <FiLayers size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Transfers</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard $color={colors.status.pending}>
          <StatIcon $color={colors.status.pending}>
            <FiClock size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>Pending Review</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard $color={colors.status.approved}>
          <StatIcon $color={colors.status.approved}>
            <FiCheckCircle size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.approved}</StatValue>
            <StatLabel>Approved</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard $color={colors.status.escalated} $highlight={stats.escalated > 0}>
          <StatIcon $color={colors.status.escalated}>
            <FiAlertTriangle size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.escalated}</StatValue>
            <StatLabel>Escalated</StatLabel>
          </StatContent>
        </StatCard>
      </StatsBar>

      {/* Control Bar */}
      <ControlBar>
        <SearchBox>
          <SearchIcon>
            <FiSearch size={18} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search by name, ID, jurisdiction..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBox>

        <FilterButton 
          $active={statusFilter === ''}
          onClick={() => setStatusFilter('')}
        >
          All
        </FilterButton>
        <FilterButton 
          $active={statusFilter === 'pending'}
          onClick={() => setStatusFilter('pending')}
        >
          Pending
        </FilterButton>
        <FilterButton 
          $active={statusFilter === 'approved'}
          onClick={() => setStatusFilter('approved')}
        >
          Approved
        </FilterButton>
        <FilterButton 
          $active={statusFilter === 'escalated'}
          onClick={() => setStatusFilter('escalated')}
        >
          Escalated
        </FilterButton>

        <RefreshButton onClick={refreshAllData}>
          <FiRefreshCw size={16} />
          Refresh
        </RefreshButton>
      </ControlBar>

      {/* Transfers Grid */}
      {loading ? (
        <EmptyState>
          <EmptyIcon>
            <FiRefreshCw size={48} />
          </EmptyIcon>
          <EmptyTitle>Loading...</EmptyTitle>
        </EmptyState>
      ) : filteredTransfers.length > 0 ? (
        <TransfersGrid>
          {filteredTransfers.map(transfer => {
            const actualStatus = getActualStatus(transfer);
            const progress = getProgress(transfer);
            const slaStatus = getSLAStatus(transfer);
            const canEscalate = (slaStatus.status === 'breached' || slaStatus.status === 'approaching') && 
                               !transfer.escalatedTo && 
                               actualStatus !== 'APPROVED';

            return (
              <TransferCard 
                key={transfer.id}
                $selected={selectedTransferId === transfer.id}
                onClick={() => handleViewTransfer(transfer)}
              >
                {/* SLA Warning */}
                {slaStatus.status !== 'ok' && (
                  <SLAWarning $type={slaStatus.status}>
                    <FiAlertTriangle size={16} />
                    {slaStatus.status === 'breached' 
                      ? `SLA Breached: ${slaStatus.daysRemaining} days overdue`
                      : `SLA Alert: ${slaStatus.daysRemaining} days remaining`
                    }
                  </SLAWarning>
                )}

                <CardHeader>
                  <CardTitle>
                    <TransferName>{transfer.name}</TransferName>
                    <TransferId>{transfer.id}</TransferId>
                  </CardTitle>
                  <StatusBadge $status={actualStatus}>
                    {actualStatus === 'APPROVED' && <FiCheckCircle size={12} />}
                    {actualStatus === 'UNDER_REVIEW' && <FiClock size={12} />}
                    {actualStatus === 'ESCALATED' && <FiAlertTriangle size={12} />}
                    {actualStatus.replace('_', ' ')}
                  </StatusBadge>
                </CardHeader>

                <CardMeta>
                  <MetaItem>
                    <FiMapPin size={14} />
                    {transfer.jurisdiction}
                  </MetaItem>
                  <MetaItem>
                    <FiFileText size={14} />
                    {transfer.entity}
                  </MetaItem>
                  <MetaItem>
                    <FiCalendar size={14} />
                    {new Date(transfer.createdAt).toLocaleDateString()}
                  </MetaItem>
                </CardMeta>

                {/* Progress Bar */}
                {progress.total > 0 && (
                  <ProgressBar>
                    <ProgressLabel>
                      <span>Requirements Progress</span>
                      <span>{progress.approved} / {progress.total}</span>
                    </ProgressLabel>
                    <ProgressTrack>
                      <ProgressFill 
                        $percentage={progress.percentage}
                        $color={progress.percentage === 100 ? colors.status.approved : colors.status.underReview}
                      />
                    </ProgressTrack>
                  </ProgressBar>
                )}

                {/* Actions */}
                <CardActions>
                  <ActionButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTransfer(transfer);
                    }}
                  >
                    <FiEye size={14} />
                    View Details
                  </ActionButton>
                  
                  {actualStatus !== 'APPROVED' && (
                    <ActionButton 
                      $variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUploadEvidence(transfer);
                      }}
                    >
                      <FiUpload size={14} />
                      Upload
                    </ActionButton>
                  )}

                  {canEscalate && (
                    <ActionButton 
                      $variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEscalate(transfer);
                      }}
                    >
                      <FiAlertTriangle size={14} />
                      Escalate
                    </ActionButton>
                  )}
                </CardActions>
              </TransferCard>
            );
          })}
        </TransfersGrid>
      ) : (
        <EmptyState>
          <EmptyIcon>
            <FiLayers size={48} />
          </EmptyIcon>
          <EmptyTitle>No Transfers Found</EmptyTitle>
          <EmptyMessage>
            {searchQuery || statusFilter 
              ? "No transfers match your search criteria. Try adjusting your filters."
              : "You haven't created any transfer requests yet."}
          </EmptyMessage>
        </EmptyState>
      )}

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
    </DashboardContainer>
  );
};

export default EndUserDashboard;
