import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Evidence, Transfer, ReviewDecision, UploadedTemplate } from '../types/index';
import { useEvidenceApi } from '../hooks/useEvidenceApi';
import { getAllTemplates } from '../services/uploadedTemplateService';
import UploadTemplateDialog from './UploadTemplateDialog';
import { FiUpload, FiTrash2 } from 'react-icons/fi';
import ReviewDrawer from './ReviewDrawer';
import StatusChip from './StatusChip';
import AdminAIInsights from './AdminAIInsights';
import AdminCRDashboard from './AdminCRDashboard';
import PublishSummary from './PublishSummary';
import StyledSelect from './common/StyledSelect';
import { SidebarGroup } from './common/Sidebar';
import { AdminQueueSummary, useToast } from './common';
import MERReviewPanel from './MERReview/MERReviewPanel';

// Modular Dashboard Imports
import ModularDashboard from './common/ModularDashboard';
import {
  Section,
  Table,
  Th,
  Td,
  Tr,
  ActionButton,
  NoDataMessage,
  LoadingMessage,
  StatusBadge,
  PriorityBadge,
  Filters,
  FilterGroup,
  FilterLabel,
  SelectWrapper,
  Pagination,
  PageButton
} from './common/DashboardComponents';

// Local Styled Components for Admin Specific Views
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



const DocumentTitle = styled.div`
  font-weight: 500;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  const [showMERReviewPanel, setShowMERReviewPanel] = useState(false);
  const [selectedMERTransferId, setSelectedMERTransferId] = useState<string | null>(null);
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
  const [allEvidence, setAllEvidence] = useState<Evidence[]>([]);

  const { getTransfers, submitReviewDecision, getAllEvidence } = useEvidenceApi();
  const { showToast } = useToast();

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
        } else if (activeItem === 'document-library' || activeItem === 'my-reviews') {
          // Load evidence for other tabs too if needed
          const evidence = await getAllEvidence();
          setAllEvidence(evidence);
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
    // Check if this is a MER submission
    if (evidence.merTransferId) {
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


  const filteredEvidence = allEvidence.filter(evidence => {
    if (filters.status && evidence.status !== filters.status) return false;
    // Add more filter logic as needed
    return true;
  });

  const renderEvidenceQueue = () => (
    <>
      <AdminQueueSummary evidence={allEvidence} />
        
        <Section>
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
            <NoDataMessage>No evidence found for the selected filter</NoDataMessage>
          )}
        </Section>
    </>
  );

  const renderMyReviews = () => {
    // Filter evidence reviewed by current admin
    const myReviewedEvidence = allEvidence.filter(e => 
      e.reviewerId === 'current-admin' && 
      (e.status === 'APPROVED' || e.status === 'REJECTED' || e.status === 'ESCALATED')
    );

    return (
      <Section>
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
                    <ActionButton
                      variant="secondary"
                      onClick={() => handleReviewClick(evidence)}
                    >
                      View Details
                    </ActionButton>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <NoDataMessage>No reviews found</NoDataMessage>
        )}
      </Section>
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
      <Section>
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
      </Section>
    );
  };

  const renderDocumentLibrary = () => {
    const allDocuments = allEvidence.map(evidence => {
      const requirementIdParts = evidence.requirementId.split('-');
      let entityName = 'Unknown';
      let countryName = 'Unknown';
      
      if (requirementIdParts.length >= 3) {
        const countryIndex = requirementIdParts.lastIndexOf(requirementIdParts[requirementIdParts.length - 1]);
        if (countryIndex > 1) {
          countryName = requirementIdParts[countryIndex];
          // This parsing logic is rudimentary based on ID convention
        }
      }
      return { ...evidence, entityName, countryName };
    });

    const filteredDocs = allDocuments.filter(doc => {
      // Basic filter logic
      if (documentFilters.status && doc.status !== documentFilters.status) return false;
      return true;
    });

    // Pagination Logic
    const indexOfLastDoc = transferPage * transfersPerPage;
    const indexOfFirstDoc = indexOfLastDoc - transfersPerPage;
    const currentDocs = filteredDocs.slice(indexOfFirstDoc, indexOfLastDoc);
    const totalPages = Math.ceil(filteredDocs.length / transfersPerPage);

    return (
      <Section>
        <Filters>
            <FilterGroup>
              <FilterLabel>Document Status</FilterLabel>
              <SelectWrapper>
                <StyledSelect
                  value={documentFilters.status}
                  onChange={(value) => setDocumentFilters(prev => ({ ...prev, status: value }))}
                  options={[
                      { value: '', label: 'All Status' },
                      { value: 'PENDING', label: 'Pending' },
                      { value: 'APPROVED', label: 'Approved' },
                      { value: 'REJECTED', label: 'Rejected' }
                  ]}
                  placeholder="All Status"
                />
              </SelectWrapper>
            </FilterGroup>
        </Filters>

        <TransferGroups>
          {currentDocs.length > 0 ? (
             currentDocs.map(doc => {
               const isExpanded = expandedTransfers.has(doc.id);
               return (
                 <TransferGroup key={doc.id}>
                    <TransferHeader onClick={() => toggleTransferExpansion(doc.id)}>
                      <TransferInfo>
                         <ExpandIcon $expanded={isExpanded}>▶</ExpandIcon>
                         <TransferName>{doc.filename}</TransferName>
                         <StatusBadge $status={doc.status}>{doc.status}</StatusBadge>
                      </TransferInfo>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                    </TransferHeader>
                    {isExpanded && (
                      <DocumentList>
                        <DocumentRow>
                           <DocumentTitle>ID: {doc.requirementId}</DocumentTitle>
                           <ActionButton $size="sm" onClick={() => handleReviewClick(doc)}>View</ActionButton>
                        </DocumentRow>
                      </DocumentList>
                    )}
                 </TransferGroup>
               )
             })
          ) : (
            <EmptyTransferMessage>No documents found</EmptyTransferMessage>
          )}
        </TransferGroups>

        {totalPages > 1 && (
          <Pagination>
            <PageButton 
              disabled={transferPage === 1} 
              onClick={() => setTransferPage(prev => prev - 1)}
            >
              Previous
            </PageButton>
            <span>Page {transferPage} of {totalPages}</span>
            <PageButton 
              disabled={transferPage === totalPages} 
              onClick={() => setTransferPage(prev => prev + 1)}
            >
              Next
            </PageButton>
          </Pagination>
        )}
      </Section>
    );
  };

  const renderTemplateUpload = () => (
    <Section>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Template Management</h3>
          <ActionButton variant="primary" onClick={() => setUploadDialogOpen(true)}>
             <FiUpload /> Upload Template
          </ActionButton>
       </div>
       <Table>
         <thead>
           <tr>
             <Th>Template Name</Th>
             <Th>File Type</Th>
             <Th>Uploaded At</Th>
             <Th>Actions</Th>
           </tr>
         </thead>
         <tbody>
           {templates.map(template => (
             <Tr key={template.id}>
               <Td>{template.name}</Td>
               <Td>{template.documentType}</Td>
               <Td>{new Date(template.uploadedAt).toLocaleDateString()}</Td>
               <Td>
                 <ActionButton variant="danger" $size="sm">
                   <FiTrash2 /> Delete
                 </ActionButton>
               </Td>
             </Tr>
           ))}
         </tbody>
       </Table>
       
       <UploadTemplateDialog 
         isOpen={uploadDialogOpen} 
         onClose={() => setUploadDialogOpen(false)}
         onSuccess={() => {
            setTemplates(getAllTemplates());
            setUploadDialogOpen(false);
         }}
       />
    </Section>
  );

  const renderContent = () => {
    switch (activeItem) {
      case 'evidence-queue': return renderEvidenceQueue();
      case 'my-reviews': return renderMyReviews();
      case 'all-transfers': return renderAllTransfers();
      case 'ai-insights': return <AdminAIInsights />;
      case 'document-library': return renderDocumentLibrary();
      case 'change-requests': return <AdminCRDashboard />;
      case 'publish-summary': return <PublishSummary />;
      case 'template-upload': return renderTemplateUpload();
      default: return renderEvidenceQueue();
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
          allEvidence={allEvidence.filter(ev => {
             // simplified matching for drawer context
             return ev.requirementId === selectedEvidence.requirementId; 
          })}
          onClose={() => setShowReviewDrawer(false)}
          onDecision={handleReviewDecision}
        />
      )}

      {showMERReviewPanel && selectedMERTransferId && (
        <MERReviewPanel
          transferId={selectedMERTransferId}
          reviewerType="Admin"
          onClose={() => {
            setShowMERReviewPanel(false);
            setSelectedMERTransferId(null);
          }}
          onReviewComplete={async () => {
            const evidence = await getAllEvidence();
            setAllEvidence(evidence);
            showToast('Review completed', 'success');
          }}
        />
      )}
    </ModularDashboard>
  );
};

export default AdminDashboard;
