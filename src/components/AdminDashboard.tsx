import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Evidence, Transfer, ReviewDecision, UploadedTemplate } from '../types/index';
import { useEvidenceApi } from '../hooks/useEvidenceApi';
import { getAllTemplates, deleteTemplate, updateTemplate } from '../services/uploadedTemplateService';
import UploadTemplateDialog from './UploadTemplateDialog';
import { FiUpload, FiEdit, FiTrash2, FiFile } from 'react-icons/fi';
import ReviewDrawer from './ReviewDrawer';
import StatusChip from './StatusChip';
import AdminAIInsights from './AdminAIInsights';
import AdminCRDashboard from './AdminCRDashboard';
import PublishSummary from './PublishSummary';
import StyledSelect from './common/StyledSelect';
import Sidebar, { SidebarGroup } from './common/Sidebar';
import { AdminQueueSummary, useToast } from './common';

const DashboardContainer = styled.div`
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

// const SectionTitle = styled.h2`
//   font-size: 1.1rem;
//   font-weight: 600;
//   color: #222;
//   margin-bottom: 0.5rem;
//   border-bottom: 1px solid #f0f0f0;
//   padding-bottom: 0.25rem;
//   flex-shrink: 0;
// `;

const Filters = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  flex-shrink: 0;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FilterLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
`;

const SelectWrapper = styled.div`
  min-width: 150px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  flex: 1;
  min-height: 0;
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

const PriorityBadge = styled.span<{ $priority: 'high' | 'medium' | 'low' }>`
  display: inline-block;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: white;
  
  background-color: ${props => {
    switch (props.$priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FFA000';
      case 'low':
        return '#4CAF50';
      default:
        return '#666';
    }
  }};
`;

// Transfer Grouping Styles
const TransferGroups = styled.div`
  margin-top: 1rem;
`;

const TransferGroup = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  background: white;
  overflow: hidden;
`;

const TransferHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const TransferInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
`;

const TransferName = styled.div`
  font-weight: 600;
  color: #222;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
`;


const ExpandIcon = styled.div<{ $expanded: boolean }>`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  transform: ${props => props.$expanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  color: #666;
`;

const DocumentList = styled.div`
  background: white;
`;

const DocumentRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 80px 120px 80px 60px 80px;
  gap: 1rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  font-size: 0.85rem;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #f9f9f9;
  }
`;

const DocumentName = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  justify-content: center;
`;

// const FileIconSmall = styled.span`
//   font-size: 0.9rem;
//   flex-shrink: 0;
// `;

const DocumentTitle = styled.div`
  font-weight: 500;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CompactStatus = styled.span<{ $status: string }>`
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
  
  ${props => {
    switch (props.$status) {
      case 'PENDING':
        return 'background: #fef3c7; color: #92400e;';
      case 'APPROVED':
        return 'background: #d1fae5; color: #065f46;';
      case 'REJECTED':
        return 'background: #fee2e2; color: #991b1b;';
      case 'UNDER_REVIEW':
        return 'background: #dbeafe; color: #1e40af;';
      case 'ESCALATED':
        return 'background: #e9d5ff; color: #7c3aed;';
      default:
        return 'background: #f3f4f6; color: #6b7280;';
    }
  }}
`;

const CompactButton = styled.button`
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #222;
  color: white;
  
  &:hover {
    background: #444;
  }
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 1rem;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: 0.4rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: ${props => props.$active ? '#222' : 'white'};
  color: ${props => props.$active ? 'white' : '#222'};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? '#444' : '#f5f5f5'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyTransferMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  background: #f9f9f9;
  border-radius: 6px;
  margin: 0.5rem 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-shrink: 0;
`;

const StatCard = styled.div`
  background: white;
  padding: 0.75rem;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

type SidebarItemType = 'evidence-queue' | 'my-reviews' | 'all-transfers' | 'ai-insights' | 'document-library' | 'change-requests' | 'publish-summary' | 'template-upload';

const AdminDashboard: React.FC = () => {
  const [activeItem, setActiveItem] = useState<SidebarItemType>('evidence-queue');
  const [sidebarGroups, setSidebarGroups] = useState<SidebarGroup[]>([
    {
      id: 'dashboard',
      label: 'Dashboard',
      isExpanded: true,
      items: [
        { id: 'evidence-queue', label: 'Evidence Queue' },
        { id: 'my-reviews', label: 'My Reviews' },
        { id: 'all-transfers', label: 'All Transfers' },
        { id: 'ai-insights', label: 'AI Insights' },
        { id: 'document-library', label: 'Document Library' },
        { id: 'template-upload', label: 'Template Upload' },
        { id: 'publish-summary', label: 'Publish Summary' }
      ]
    },
    {
      id: 'change-requests',
      label: 'Change Requests',
      isExpanded: false,
      items: [
        { id: 'change-requests', label: 'Change Requests' }
      ]
    }
  ]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [showReviewDrawer, setShowReviewDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    jurisdiction: '',
    entity: ''
  });
  
  // Document library filters
  const [documentFilters, setDocumentFilters] = useState({
    status: '',
    transferId: '',
    uploadedBy: '',
    dateRange: '',
    fileType: ''
  });
  
  
  // Transfer grouping state
  const [expandedTransfers, setExpandedTransfers] = useState<Set<string>>(new Set());
  const [transferPage, setTransferPage] = useState(1);
  const [transfersPerPage] = useState(20);
  
  // Template upload state
  const [templates, setTemplates] = useState<UploadedTemplate[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const { getTransfers, submitReviewDecision, getAllEvidence } = useEvidenceApi();

  // Helper functions for transfer grouping
  const toggleTransferExpansion = (transferId: string) => {
    setExpandedTransfers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transferId)) {
        newSet.delete(transferId);
      } else {
        newSet.add(transferId);
      }
      return newSet;
    });
  };

  // const getFileIcon = (filename: string) => {
  //   const ext = filename.split('.').pop()?.toLowerCase();
  //   switch (ext) {
  //     case 'pdf': return '📄';
  //     case 'docx':
  //     case 'doc': return '📝';
  //     case 'xlsx':
  //     case 'xls': return '📊';
  //     case 'pptx':
  //     case 'ppt': return '📈';
  //     case 'jpg':
  //     case 'jpeg':
  //     case 'png': return '🖼️';
  //     default: return '📄';
  //   }
  // };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeItem === 'evidence-queue') {
          // Load all evidence for filtering
          const evidence = await getAllEvidence();
          setAllEvidence(evidence);
        } else if (activeItem === 'all-transfers') {
          const transferData = await getTransfers();
          setTransfers(transferData);
        } else if (activeItem === 'template-upload') {
          // Load templates
          const allTemplates = getAllTemplates();
          setTemplates(allTemplates);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeItem, getAllEvidence, getTransfers]);

  const handleReviewClick = (evidence: Evidence) => {
    setSelectedEvidence(evidence);
    setShowReviewDrawer(true);
  };

  const handleReviewDecision = async (decision: ReviewDecision) => {
    try {
      await submitReviewDecision(decision);
      setShowReviewDrawer(false);
      setSelectedEvidence(null);
      
      // Refresh all data
      const allEvidenceData = await getAllEvidence();
      setAllEvidence(allEvidenceData);
      
      // Show success message with escalation details if applicable
      if (decision.decision === 'ESCALATE' && decision.escalatedTo) {
        showToast(`Evidence escalated to ${decision.escalatedTo} successfully!`, 'success');
      } else {
        showToast(`Evidence ${decision.decision.toLowerCase()}d successfully!`, 'success');
      }
    } catch (error) {
      console.error('Failed to submit review decision:', error);
      showToast('Failed to submit review decision. Please try again.', 'error');
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

  const [allEvidence, setAllEvidence] = useState<Evidence[]>([]);
  const { showToast } = useToast();

  const filteredEvidence = allEvidence.filter(evidence => {
    if (filters.status && evidence.status !== filters.status) return false;
    // Add more filter logic as needed
    return true;
  });

  // All evidence is now loaded in the main useEffect above

  const renderEvidenceQueue = () => (
    <>
      <AdminQueueSummary evidence={allEvidence} />
        
        <Filters>
          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <SelectWrapper>
              <StyledSelect
                value={filters.status}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'UNDER_REVIEW', label: 'Under Review' },
                  { value: 'APPROVED', label: 'Approved' },
                  { value: 'REJECTED', label: 'Rejected' }
                ]}
                placeholder="All Status"
              />
            </SelectWrapper>
          </FilterGroup>
        </Filters>

        {loading ? (
          <LoadingMessage>Loading evidence...</LoadingMessage>
        ) : filteredEvidence.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Transfer ID</Th>
                <Th>Requirement</Th>
                <Th>Submitted By</Th>
                <Th>Submitted At</Th>
                <Th>SLA Due</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filteredEvidence.map((evidence) => (
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
                    {evidence.uploadedAt ? 
                      new Date(new Date(evidence.uploadedAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() : 
                      'N/A'
                    }
                  </Td>
                  <Td>
                    <StatusChip status={evidence.status} />
                  </Td>
                  <Td>
                    <Button
                      variant="primary"
                      onClick={() => handleReviewClick(evidence)}
                    >
                      Review
                    </Button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <NoDataMessage>No evidence found for the selected filter</NoDataMessage>
        )}
    </>
  );

  const renderMyReviews = () => {
    // Filter evidence reviewed by current admin
    const myReviewedEvidence = allEvidence.filter(e => 
      e.reviewerId === 'current-admin' && 
      (e.status === 'APPROVED' || e.status === 'REJECTED' || e.status === 'ESCALATED')
    );

    return (
      <>
        {loading ? (
          <LoadingMessage>Loading reviews...</LoadingMessage>
        ) : myReviewedEvidence.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>File Name</Th>
                <Th>Requirement</Th>
                <Th>Decision</Th>
                <Th>Review Comments</Th>
                <Th>Reviewed At</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {myReviewedEvidence.map((evidence) => (
                <Tr key={evidence.id}>
                  <Td>
                    <div>
                      <div style={{ fontWeight: '500' }}>{evidence.filename}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        {evidence.description}
                      </div>
                    </div>
                  </Td>
                  <Td>{evidence.requirementId}</Td>
                  <Td>
                    <StatusChip status={evidence.status} />
                  </Td>
                  <Td>
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {evidence.reviewerNote || 'No comments'}
                    </div>
                  </Td>
                  <Td>
                    {evidence.reviewedAt ? new Date(evidence.reviewedAt).toLocaleDateString() : 'N/A'}
                  </Td>
                  <Td>
                    <Button
                      variant="secondary"
                      onClick={() => handleReviewClick(evidence)}
                    >
                      View Details
                    </Button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <NoDataMessage>No reviews found</NoDataMessage>
        )}
      </>
    );
  };

  const renderAllTransfers = () => {
    // Sort transfers: escalated/high priority first
    const sortedTransfers = [...transfers].sort((a, b) => {
      const aPriority = a.isHighPriority ? 1 : 0;
      const bPriority = b.isHighPriority ? 1 : 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
      <>
        {loading ? (
          <LoadingMessage>Loading transfers...</LoadingMessage>
        ) : sortedTransfers.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Transfer Name</Th>
                <Th>Jurisdiction</Th>
                <Th>Entity</Th>
                <Th>Subject Type</Th>
                <Th>Status</Th>
                <Th>Priority</Th>
                <Th>Created At</Th>
                <Th>Requirements</Th>
              </tr>
            </thead>
            <tbody>
              {sortedTransfers.map((transfer) => (
                <Tr 
                  key={transfer.id}
                  style={{
                    background: transfer.isHighPriority ? '#fff5f5' : undefined
                  }}
                >
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {transfer.isHighPriority && <span style={{ color: '#dc2626' }}>⚠️</span>}
                      {transfer.name}
                    </div>
                    {transfer.escalatedBy && (
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                        Escalated by: {transfer.escalatedBy}
                      </div>
                    )}
                  </Td>
                  <Td>{transfer.jurisdiction}</Td>
                  <Td>{transfer.entity}</Td>
                  <Td>{transfer.subjectType}</Td>
                  <Td>
                    <StatusChip status={transfer.status as any} />
                  </Td>
                  <Td>
                    {transfer.isHighPriority ? (
                      <PriorityBadge $priority="high">High</PriorityBadge>
                    ) : (
                      <PriorityBadge $priority="low">Normal</PriorityBadge>
                    )}
                  </Td>
                  <Td>{new Date(transfer.createdAt).toLocaleDateString()}</Td>
                  <Td>{transfer.requirements.length}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <NoDataMessage>No transfers found</NoDataMessage>
        )}
      </>
    );
  };

  const renderDocumentLibrary = () => {
    // Get all evidence from the evidence API
    const allDocuments = allEvidence.map(evidence => {
      // Extract entity and country from requirement ID pattern: req-{entity}-{country}
      const requirementIdParts = evidence.requirementId.split('-');
      let entityName = 'Unknown';
      let countryName = 'Unknown';
      
      if (requirementIdParts.length >= 3) {
        // Handle pattern like: req-south-korea-gwm-3-south-korea
        // Extract the last part as country and everything between req- and country as entity
        const countryIndex = requirementIdParts.lastIndexOf(requirementIdParts[requirementIdParts.length - 1]);
        if (countryIndex > 1) {
          countryName = requirementIdParts[countryIndex];
          entityName = requirementIdParts.slice(1, countryIndex).join('-');
        }
      }
      
      // Try to find transfer by matching entity and country
      const transfer = transfers.find(t => {
        const transferEntity = t.entity.toLowerCase().replace(/\s+/g, '-');
        const transferCountry = t.jurisdiction.toLowerCase().replace(/\s+/g, '-');
        return transferEntity === entityName && transferCountry === countryName;
      });
      
      // If no transfer found, try to find by requirement ID match
      const transferByReq = transfers.find(t => 
        t.requirements.some(req => req.id === evidence.requirementId)
      );
      
      const finalTransfer = transfer || transferByReq;
      const requirement = finalTransfer?.requirements.find(req => req.id === evidence.requirementId);
      
      // Format names for display
      const displayEntity = entityName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const displayCountry = countryName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      return {
        ...evidence,
        transferId: finalTransfer?.id || `transfer-${entityName}-${countryName}`,
        transferName: finalTransfer?.name || `Evidence Upload - ${displayEntity} (${displayCountry})`,
        jurisdiction: finalTransfer?.jurisdiction || displayCountry,
        entity: finalTransfer?.entity || displayEntity,
        requirementId: evidence.requirementId,
        requirementTitle: requirement?.name || 'Legal Requirement Evidence'
      };
    });

    // Filter documents based on filters
    const filteredDocuments = allDocuments.filter(doc => {
      if (documentFilters.status && doc.status !== documentFilters.status) return false;
      if (documentFilters.transferId && !doc.transferId.includes(documentFilters.transferId)) return false;
      if (documentFilters.uploadedBy && !doc.uploadedBy.toLowerCase().includes(documentFilters.uploadedBy.toLowerCase())) return false;
      if (documentFilters.fileType) {
        const fileExtension = doc.filename.split('.').pop()?.toLowerCase();
        if (fileExtension !== documentFilters.fileType) return false;
      }
      return true;
    });

    // Group documents by status for stats
    const documentStats = {
      total: allDocuments.length,
      pending: allDocuments.filter(d => d.status === 'PENDING').length,
      underReview: allDocuments.filter(d => d.status === 'UNDER_REVIEW').length,
      approved: allDocuments.filter(d => d.status === 'APPROVED').length,
      rejected: allDocuments.filter(d => d.status === 'REJECTED').length,
      escalated: allDocuments.filter(d => d.status === 'ESCALATED').length
    };

  return (
      <>
        <StatsGrid>
          <StatCard>
            <StatValue>{documentStats.total}</StatValue>
            <StatLabel>Total Documents</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{documentStats.pending}</StatValue>
            <StatLabel>Pending</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{documentStats.underReview}</StatValue>
            <StatLabel>Under Review</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{documentStats.approved}</StatValue>
            <StatLabel>Approved</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{documentStats.rejected}</StatValue>
            <StatLabel>Rejected</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{documentStats.escalated}</StatValue>
            <StatLabel>Escalated</StatLabel>
          </StatCard>
        </StatsGrid>
        <Filters>
          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <SelectWrapper>
              <StyledSelect
                value={documentFilters.status}
                onChange={(value) => setDocumentFilters(prev => ({ ...prev, status: value }))}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'UNDER_REVIEW', label: 'Under Review' },
                  { value: 'APPROVED', label: 'Approved' },
                  { value: 'REJECTED', label: 'Rejected' },
                  { value: 'ESCALATED', label: 'Escalated' }
                ]}
                placeholder="All Status"
              />
            </SelectWrapper>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Transfer ID</FilterLabel>
            <SelectWrapper>
              <StyledSelect
                value={documentFilters.transferId}
                onChange={(value) => setDocumentFilters(prev => ({ ...prev, transferId: value }))}
                options={[
                  { value: '', label: 'All Transfers' },
                  ...transfers.map(transfer => ({
                    value: transfer.id,
                    label: `${transfer.id} - ${transfer.name}`
                  }))
                ]}
                placeholder="All Transfers"
              />
            </SelectWrapper>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>File Type</FilterLabel>
            <SelectWrapper>
              <StyledSelect
                value={documentFilters.fileType}
                onChange={(value) => setDocumentFilters(prev => ({ ...prev, fileType: value }))}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'pdf', label: 'PDF' },
                  { value: 'docx', label: 'Word Document' },
                  { value: 'xlsx', label: 'Excel' },
                  { value: 'pptx', label: 'PowerPoint' },
                  { value: 'txt', label: 'Text File' },
                  { value: 'jpg', label: 'Image (JPG)' },
                  { value: 'png', label: 'Image (PNG)' }
                ]}
                placeholder="All Types"
              />
            </SelectWrapper>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Uploaded By</FilterLabel>
            <input
              type="text"
              placeholder="Search by user..."
              value={documentFilters.uploadedBy}
              onChange={(e) => setDocumentFilters(prev => ({ ...prev, uploadedBy: e.target.value }))}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem',
                minWidth: '150px'
              }}
            />
          </FilterGroup>
        </Filters>

        {loading ? (
          <LoadingMessage>Loading documents...</LoadingMessage>
        ) : allDocuments.length > 0 ? (
          (() => {
            const transferGroups = transfers.map(transfer => {
              const transferDocuments = filteredDocuments.filter(doc => {
                const matches = doc.transferId === transfer.id;
                return matches;
              });
              
              const statusCounts = {
                pending: transferDocuments.filter(d => d.status === 'PENDING').length,
                approved: transferDocuments.filter(d => d.status === 'APPROVED').length,
                rejected: transferDocuments.filter(d => d.status === 'REJECTED').length,
                underReview: transferDocuments.filter(d => d.status === 'UNDER_REVIEW').length,
                escalated: transferDocuments.filter(d => d.status === 'ESCALATED').length
              };
              
              const statusSummary = [
                statusCounts.approved > 0 ? `${statusCounts.approved}✅` : '',
                statusCounts.pending > 0 ? `${statusCounts.pending}⏳` : '',
                statusCounts.rejected > 0 ? `${statusCounts.rejected}❌` : '',
                statusCounts.underReview > 0 ? `${statusCounts.underReview}👀` : '',
                statusCounts.escalated > 0 ? `${statusCounts.escalated}⚠️` : ''
              ].filter(Boolean).join(' ');

              return {
                transfer,
                documents: transferDocuments,
                totalDocuments: transferDocuments.length,
                statusCounts,
                statusSummary
              };
            }).filter(group => group.totalDocuments > 0);
            
            // If no transfer groups found, try alternative matching strategies
            let finalTransferGroups = transferGroups;
            if (transferGroups.length === 0 && filteredDocuments.length > 0) {
              // Try to create transfer groups based on document transfer IDs
              const documentTransferIds = [...new Set(filteredDocuments.map(doc => doc.transferId))];
              
              const alternativeGroups = documentTransferIds.map(transferId => {
                const transferDocuments = filteredDocuments.filter(doc => doc.transferId === transferId);
                const firstDoc = transferDocuments[0];
                
                // Extract entity and jurisdiction from the first document's transfer info
                const entity = firstDoc.entity || 'Unknown Entity';
                const jurisdiction = firstDoc.jurisdiction || 'Unknown Jurisdiction';
                
                const statusCounts = {
                  pending: transferDocuments.filter(d => d.status === 'PENDING').length,
                  approved: transferDocuments.filter(d => d.status === 'APPROVED').length,
                  rejected: transferDocuments.filter(d => d.status === 'REJECTED').length,
                  underReview: transferDocuments.filter(d => d.status === 'UNDER_REVIEW').length,
                  escalated: transferDocuments.filter(d => d.status === 'ESCALATED').length
                };
                
                const statusSummary = [
                  statusCounts.approved > 0 ? `${statusCounts.approved}✅` : '',
                  statusCounts.pending > 0 ? `${statusCounts.pending}⏳` : '',
                  statusCounts.rejected > 0 ? `${statusCounts.rejected}❌` : '',
                  statusCounts.underReview > 0 ? `${statusCounts.underReview}👀` : '',
                  statusCounts.escalated > 0 ? `${statusCounts.escalated}⚠️` : ''
                ].filter(Boolean).join(' ');

                return {
                  transfer: {
                    id: transferId,
                    name: `Transfer - ${entity} (${jurisdiction})`,
                    entity: entity,
                    jurisdiction: jurisdiction,
                    createdBy: 'system',
                    createdAt: new Date().toISOString(),
                    status: 'ACTIVE' as const,
                    subjectType: 'Various',
                    requirements: []
                  },
                  documents: transferDocuments,
                  totalDocuments: transferDocuments.length,
                  statusCounts,
                  statusSummary
                };
              });
              
              if (alternativeGroups.length > 0) {
                finalTransferGroups = alternativeGroups;
              } else {
                finalTransferGroups = [{
                  transfer: {
                    id: 'unmatched',
                    name: 'Unmatched Documents',
                    entity: 'Various',
                    jurisdiction: 'Various',
                    createdBy: 'system',
                    createdAt: new Date().toISOString(),
                    status: 'ACTIVE' as const,
                    subjectType: 'Various',
                    requirements: []
                  },
                  documents: filteredDocuments,
                  totalDocuments: filteredDocuments.length,
                  statusCounts: {
                    pending: filteredDocuments.filter(d => d.status === 'PENDING').length,
                    approved: filteredDocuments.filter(d => d.status === 'APPROVED').length,
                    rejected: filteredDocuments.filter(d => d.status === 'REJECTED').length,
                    underReview: filteredDocuments.filter(d => d.status === 'UNDER_REVIEW').length,
                    escalated: filteredDocuments.filter(d => d.status === 'ESCALATED').length
                  },
                  statusSummary: ''
                }];
              }
            }

              // Pagination
              const startIndex = (transferPage - 1) * transfersPerPage;
              const endIndex = startIndex + transfersPerPage;
              const paginatedGroups = finalTransferGroups.slice(startIndex, endIndex);
              const totalPages = Math.ceil(finalTransferGroups.length / transfersPerPage);

              return (
                <>
                  <TransferGroups>
                    {paginatedGroups.map((group) => (
                      <TransferGroup key={group.transfer.id}>
                        <TransferHeader onClick={() => toggleTransferExpansion(group.transfer.id)}>
                          <TransferInfo>
                            <TransferName>{group.transfer.name}</TransferName>
                          </TransferInfo>
                          <ExpandIcon $expanded={expandedTransfers.has(group.transfer.id)}>
                            ▶
                          </ExpandIcon>
                        </TransferHeader>
                        
                        {expandedTransfers.has(group.transfer.id) && (
                          <DocumentList>
                            {group.documents.length > 0 ? (
                              <>
                                <DocumentRow style={{ 
                                  background: '#f8f9fa', 
                                  fontWeight: '600', 
                                  fontSize: '0.8rem',
                                  color: '#666',
                                  borderBottom: '2px solid #e0e0e0'
                                }}>
                                  <div>Document</div>
                                  <div>Status</div>
                                  <div>Uploaded By</div>
                                  <div>Date</div>
                                  <div>Size</div>
                                  <div>Action</div>
                                </DocumentRow>
                                {group.documents.map((doc) => (
                                  <DocumentRow key={doc.id}>
                                    <DocumentName>
                                      <DocumentTitle>{doc.filename}</DocumentTitle>
                                    </DocumentName>
                                    <CompactStatus $status={doc.status}>
                                      {doc.status}
                                    </CompactStatus>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                      {doc.uploadedBy}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                      {new Date(doc.uploadedAt).toLocaleDateString()}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                      {formatFileSize(doc.size)}
                                    </div>
                                    <CompactButton onClick={() => handleReviewClick(doc)}>
                                      Review
                                    </CompactButton>
                                  </DocumentRow>
                                ))}
                              </>
                            ) : (
                              <EmptyTransferMessage>
                                No documents found for this transfer
                              </EmptyTransferMessage>
                            )}
                          </DocumentList>
                        )}
                      </TransferGroup>
                    ))}
                  </TransferGroups>
                  
                  {totalPages > 1 && (
                    <Pagination>
                      <PageButton 
                        onClick={() => setTransferPage(prev => Math.max(1, prev - 1))}
                        disabled={transferPage === 1}
                      >
                        ← Previous
                      </PageButton>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages, transferPage - 2 + i));
                        return (
                          <PageButton
                            key={pageNum}
                            $active={pageNum === transferPage}
                            onClick={() => setTransferPage(pageNum)}
                          >
                            {pageNum}
                          </PageButton>
                        );
                      })}
                      
                      <PageButton 
                        onClick={() => setTransferPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={transferPage === totalPages}
                      >
                        Next →
                      </PageButton>
                    </Pagination>
                  )}
                </>
              );
            })()
        ) : (
          <NoDataMessage>
            {allDocuments.length === 0 
              ? 'No documents found. Upload some documents to see them here.' 
              : 'No documents found for the selected filters'
            }
          </NoDataMessage>
        )}
      </>
    );
  };

  const renderContent = () => {
    if (activeItem === 'change-requests') {
      return <AdminCRDashboard />;
    }

    switch (activeItem) {
      case 'evidence-queue':
        return (
          <Section>
            {renderEvidenceQueue()}
          </Section>
        );
      case 'my-reviews':
        return (
          <Section>
            {renderMyReviews()}
          </Section>
        );
      case 'all-transfers':
        return (
          <Section>
            {renderAllTransfers()}
          </Section>
        );
      case 'ai-insights':
        return (
          <Section>
            <AdminAIInsights />
          </Section>
        );
      case 'document-library':
        return (
          <Section>
            {renderDocumentLibrary()}
          </Section>
        );
      case 'publish-summary':
        return <PublishSummary />;
      case 'template-upload':
        return (
          <Section>
            {renderTemplateUpload()}
          </Section>
        );
      default:
        return (
          <Section>
            {renderEvidenceQueue()}
          </Section>
        );
    }
  };
  
  const renderTemplateUpload = () => {
    const handleTemplateDelete = (templateId: string) => {
      if (window.confirm('Are you sure you want to delete this template?')) {
        deleteTemplate(templateId);
        const allTemplates = getAllTemplates();
        setTemplates(allTemplates);
      }
    };

    const handleTemplateStatusChange = (templateId: string, newStatus: 'ACTIVE' | 'DRAFT' | 'ARCHIVED') => {
      updateTemplate(templateId, { status: newStatus });
      const allTemplates = getAllTemplates();
      setTemplates(allTemplates);
    };

    const handleUploadSuccess = () => {
      const allTemplates = getAllTemplates();
      setTemplates(allTemplates);
    };
    
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>Template Management</h2>
          <Button variant="primary" onClick={() => setUploadDialogOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiUpload />
            Upload Template
          </Button>
        </div>

        {templates.length === 0 ? (
          <div style={{ 
            padding: '3rem', 
            textAlign: 'center', 
            background: 'white', 
            borderRadius: '8px', 
            border: '1px solid #e0e0e0' 
          }}>
            <FiFile size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
            <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No templates uploaded yet</div>
            <div style={{ fontSize: '0.9rem', color: '#999' }}>Click "Upload Template" to add your first template</div>
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Template Name</Th>
                <Th>Type</Th>
                <Th>Uploaded</Th>
                <Th>Size</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {templates.map(template => (
                <Tr key={template.id}>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiFile />
                      <div>
                        <div style={{ fontWeight: '600' }}>{template.name}</div>
                        {template.description && (
                          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                            {template.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </Td>
                  <Td>{template.documentType}</Td>
                  <Td>{new Date(template.uploadedAt).toLocaleDateString()}</Td>
                  <Td>{formatFileSize(template.fileSize)}</Td>
                  <Td>
                    <CompactStatus $status={template.status}>{template.status}</CompactStatus>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {template.status !== 'ACTIVE' && (
                        <button
                          onClick={() => handleTemplateStatusChange(template.id, 'ACTIVE')}
                          style={{
                            padding: '0.3rem 0.6rem',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            background: '#4CAF50',
                            color: 'white'
                          }}
                          title="Set as Active"
                        >
                          <FiEdit size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleTemplateDelete(template.id)}
                        style={{
                          padding: '0.3rem 0.6rem',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          background: '#F44336',
                          color: 'white'
                        }}
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}

        <UploadTemplateDialog
          isOpen={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      </>
    );
  };

  return (
    <DashboardContainer>
      <SidebarWrapper>
        <Sidebar
          groups={sidebarGroups}
          activeItemId={activeItem}
          onItemClick={handleSidebarItemClick}
          onGroupToggle={handleSidebarGroupToggle}
        />
      </SidebarWrapper>
      
      <MainContent>
        {renderContent()}
      </MainContent>

      {showReviewDrawer && selectedEvidence && (
        <ReviewDrawer
          evidence={selectedEvidence}
          allEvidence={(() => {
            // Check if this is a MER transfer evidence (has merTransferId)
            if (selectedEvidence.merTransferId) {
              // For MER submissions, find all evidence related to this transfer
              // This includes both the virtual evidence entry AND actual uploaded files
              const transferId = selectedEvidence.merTransferId;
              
              console.log('MER Transfer ID:', transferId);
              console.log('Searching for all evidence files for this MER transfer...');
              
              const filtered = allEvidence.filter(ev => {
                // Match by merTransferId OR by requirementId starting with the transfer ID
                const matchesByMerTransferId = ev.merTransferId === transferId;
                const matchesByRequirementId = ev.requirementId.startsWith(`req-${transferId}-`);
                const matches = matchesByMerTransferId || matchesByRequirementId;
                
                if (matches) {
                  console.log(`✓ Matched Evidence: ${ev.filename} (${ev.size} bytes)`, {
                    merTransferId: ev.merTransferId,
                    requirementId: ev.requirementId,
                    matchedBy: matchesByMerTransferId ? 'merTransferId' : 'requirementId'
                  });
                }
                
                return matches;
              });
              
              console.log(`Found ${filtered.length} evidence file(s) for MER transfer ${transferId}`);
              return filtered;
            }
            
            // For non-MER evidence, extract transfer ID from requirementId
            const extractTransferId = (reqId: string) => {
              if (reqId.startsWith('req-transfer-')) {
                // Remove 'req-transfer-' prefix
                const withoutPrefix = reqId.substring('req-transfer-'.length);
                // Split by '-' and take first 3 parts (e.g., MER-001-1766121260042)
                const parts = withoutPrefix.split('-');
                if (parts.length >= 3) {
                  return `transfer-${parts[0]}-${parts[1]}-${parts[2]}`;
                }
              }
              return null;
            };
            
            const selectedTransferId = extractTransferId(selectedEvidence.requirementId);
            if (selectedTransferId) {
              console.log('Non-MER Transfer ID:', selectedTransferId);
              
              const filtered = allEvidence.filter(ev => {
                const evTransferId = extractTransferId(ev.requirementId);
                return evTransferId === selectedTransferId;
              });
              
              console.log(`Found ${filtered.length} evidence file(s) for transfer ${selectedTransferId}`);
              return filtered;
            }
            
            // Fallback: return only the selected evidence
            console.log('Fallback: returning only selected evidence');
            return [selectedEvidence];
          })()}
          onClose={() => setShowReviewDrawer(false)}
          onDecision={handleReviewDecision}
        />
      )}
    </DashboardContainer>
  );
};

export default AdminDashboard;
