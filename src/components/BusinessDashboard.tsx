import React, { useState, useEffect, useCallback } from 'react';
import { Evidence, ReviewDecision } from '../types/index';
import { useEvidenceApi } from '../hooks/useEvidenceApi';
import ReviewDrawer from './ReviewDrawer';
import MERReviewPanel from './MERReview/MERReviewPanel';
import StatusChip from './StatusChip';
import { SidebarGroup } from './common/Sidebar';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiLayers } from 'react-icons/fi';
import { colors } from '../styles/designTokens';
import { DashboardStats } from './common/DashboardStats';

// Modular Dashboard Imports
import ModularDashboard from './common/ModularDashboard';
import {
  Section,
  SectionTitle,
  Table,
  Th,
  Td,
  Tr,
  ActionButton,
  NoDataMessage,
  LoadingMessage,
  PriorityBadge
} from './common/DashboardComponents';

type SidebarItemType = 'escalated-evidence' | 'process-reviews' | 'business-analytics';

const BusinessDashboard: React.FC = () => {
  const [activeItem, setActiveItem] = useState<SidebarItemType>('escalated-evidence');
  const [sidebarGroups, setSidebarGroups] = useState<SidebarGroup[]>([
    {
      id: 'business-dashboard',
      label: 'Business Dashboard',
      isExpanded: true,
      items: [
        { id: 'escalated-evidence', label: 'Escalated Evidence' },
        { id: 'process-reviews', label: 'Process Reviews' },
        { id: 'business-analytics', label: 'Business Analytics' }
      ]
    }
  ]);
  const [escalatedEvidence, setEscalatedEvidence] = useState<Evidence[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [showReviewDrawer, setShowReviewDrawer] = useState(false);
  const [showMERReviewPanel, setShowMERReviewPanel] = useState(false);
  const [selectedMERTransferId, setSelectedMERTransferId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { getAllEvidence, submitReviewDecision } = useEvidenceApi();

  // Function to refresh escalated evidence
  const refreshEscalatedEvidence = useCallback(async () => {
    try {
      const allEvidence = await getAllEvidence();
      const escalated = allEvidence.filter(e => e.status === 'ESCALATED' && e.escalatedTo === 'Business');
      setEscalatedEvidence(escalated);
      console.log('Refreshed escalated evidence for Business:', escalated);
    } catch (error) {
      console.error('Failed to refresh escalated evidence:', error);
    }
  }, [getAllEvidence]);

  useEffect(() => {
    const loadEscalatedEvidence = async () => {
      setLoading(true);
      try {
        await refreshEscalatedEvidence();
      } catch (error) {
        console.error('Failed to load escalated evidence:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEscalatedEvidence();
  }, [refreshEscalatedEvidence]);

  // Refresh data periodically to catch new escalations
  useEffect(() => {
    const interval = setInterval(() => {
      refreshEscalatedEvidence();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [refreshEscalatedEvidence]);

  const handleReviewClick = (evidence: Evidence) => {
    // Check if this is a MER submission
    const isMERSubmission = evidence.merTransferId || evidence.description?.includes('MER');
    
    if (isMERSubmission && evidence.merTransferId) {
      // Open MER Review Panel for Business team
      setSelectedMERTransferId(evidence.merTransferId);
      setShowMERReviewPanel(true);
    } else {
      setSelectedEvidence(evidence);
      setShowReviewDrawer(true);
    }
  };

  const handleReviewDecision = async (decision: ReviewDecision) => {
    try {
      await submitReviewDecision(decision);
      setShowReviewDrawer(false);
      setSelectedEvidence(null);
      
      // Refresh the escalated evidence list
      await refreshEscalatedEvidence();
      
      // Show success message
      alert(`Evidence ${decision.decision.toLowerCase()}d successfully!`);
    } catch (error) {
      console.error('Failed to submit review decision:', error);
      alert('Failed to submit review decision. Please try again.');
    }
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

  const getPriority = (evidence: Evidence): 'high' | 'medium' | 'low' => {
    // Simple priority logic based on upload date
    const uploadDate = new Date(evidence.uploadedAt);
    const daysSinceUpload = (Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpload > 7) return 'high';
    if (daysSinceUpload > 3) return 'medium';
    return 'low';
  };

  const stats = {
    total: escalatedEvidence.length,
    highPriority: escalatedEvidence.filter(e => getPriority(e) === 'high').length,
    mediumPriority: escalatedEvidence.filter(e => getPriority(e) === 'medium').length,
    lowPriority: escalatedEvidence.filter(e => getPriority(e) === 'low').length
  };

  const renderEscalatedEvidence = () => (
    <>
      <DashboardStats items={[
        {
          label: 'Total Escalations',
          value: stats.total,
          icon: <FiLayers />,
          color: colors.status.underReview,
          subtext: 'All active escalations'
        },
        {
          label: 'High Priority',
          value: stats.highPriority,
          icon: <FiAlertTriangle />,
          color: colors.status.escalated,
          subtext: 'Requires immediate attention',
          highlight: stats.highPriority > 0
        },
        {
          label: 'Medium Priority',
          value: stats.mediumPriority,
          icon: <FiClock />,
          color: colors.status.pending,
          subtext: 'Review within 24h'
        },
        {
          label: 'Low Priority',
          value: stats.lowPriority,
          icon: <FiCheckCircle />,
          color: colors.status.approved,
          subtext: 'Routine checks'
        }
      ]} columns={4} />

      <Section>
        {loading ? (
          <LoadingMessage>Loading escalated evidence...</LoadingMessage>
        ) : escalatedEvidence.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Transfer ID</Th>
                <Th>Requirement</Th>
                <Th>Submitted By</Th>
                <Th>Submitted At</Th>
                <Th>Priority</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {escalatedEvidence.map((evidence) => (
                <Tr key={evidence.id}>
                  <Td>{evidence.requirementId}</Td>
                  <Td>
                    <div>
                      <div style={{ fontWeight: '500' }}>{evidence.filename}</div>
                      {evidence.description && (
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                          {evidence.description}
                        </div>
                      )}
                    </div>
                  </Td>
                  <Td>{evidence.uploadedBy}</Td>
                  <Td>{new Date(evidence.uploadedAt).toLocaleDateString()}</Td>
                  <Td>
                    <PriorityBadge $priority={getPriority(evidence)}>
                      {getPriority(evidence)}
                    </PriorityBadge>
                  </Td>
                  <Td>
                    <StatusChip status={evidence.status} />
                  </Td>
                  <Td>
                    <ActionButton
                      variant="primary"
                      onClick={() => handleReviewClick(evidence)}
                    >
                      Review
                    </ActionButton>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <NoDataMessage>No evidence escalated for business review</NoDataMessage>
        )}
      </Section>
    </>
  );

  const renderProcessReviews = () => (
    <Section>
      <SectionTitle>Process Reviews</SectionTitle>
      <NoDataMessage>Process Reviews functionality coming soon</NoDataMessage>
    </Section>
  );

  const renderBusinessAnalytics = () => (
    <Section>
      <SectionTitle>Business Analytics</SectionTitle>
      <NoDataMessage>Business Analytics functionality coming soon</NoDataMessage>
    </Section>
  );

  const renderContent = () => {
    switch (activeItem) {
      case 'escalated-evidence':
        return renderEscalatedEvidence();
      case 'process-reviews':
        return renderProcessReviews();
      case 'business-analytics':
        return renderBusinessAnalytics();
      default:
        return renderEscalatedEvidence();
    }
  };

  return (
    <ModularDashboard
      sidebarGroups={sidebarGroups}
      activeItemId={activeItem}
      onItemChange={handleSidebarItemClick}
      onGroupToggle={handleSidebarGroupToggle}
    >
      {renderContent()}

      {showReviewDrawer && selectedEvidence && (
        <ReviewDrawer
          evidence={selectedEvidence}
          allEvidence={escalatedEvidence.filter(ev => {
            // Extract transfer ID from requirementId
            const extractTransferId = (reqId: string) => {
              if (reqId.startsWith('req-transfer-')) {
                const withoutPrefix = reqId.substring('req-transfer-'.length);
                const parts = withoutPrefix.split('-');
                if (parts.length >= 3) {
                  return `${parts[0]}-${parts[1]}-${parts[2]}`;
                }
              }
              return reqId;
            };
            
            const selectedTransferId = extractTransferId(selectedEvidence.requirementId);
            const evTransferId = extractTransferId(ev.requirementId);
            return selectedTransferId === evTransferId;
          })}
          onClose={() => setShowReviewDrawer(false)}
          onDecision={handleReviewDecision}
          hideEscalateButton={true}
        />
      )}

      {/* MER Review Panel for Business Team */}
      {showMERReviewPanel && selectedMERTransferId && (
        <MERReviewPanel
          transferId={selectedMERTransferId}
          reviewerType="Business"
          onClose={() => {
            setShowMERReviewPanel(false);
            setSelectedMERTransferId(null);
          }}
          onReviewComplete={async () => {
            await refreshEscalatedEvidence();
            alert('Review action completed successfully');
          }}
        />
      )}
    </ModularDashboard>
  );
};

export default BusinessDashboard;
