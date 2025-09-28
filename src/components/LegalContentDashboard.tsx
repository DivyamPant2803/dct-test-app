import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Requirement, ChangeRequest, ReaffirmationStatus, ReaffirmationRequest, RequirementCombination, BulkReaffirmationRequest } from '../types/index';
import { useRequirementsApi } from '../hooks/useRequirementsApi';
import { useBulkReaffirmation } from '../hooks/useBulkReaffirmation';
import ProposeEditModal from './ProposeEditModal';
import ReaffirmModal from './ReaffirmModal';
import EnhancedBulkReaffirmation from './EnhancedBulkReaffirmation';
import EnhancedReaffirmModal from './EnhancedReaffirmModal';
import BulkOperationProgress from './BulkOperationProgress';
import StyledSelect from './common/StyledSelect';
import { FiEdit3, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const DashboardContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
  margin-bottom: 1rem;
  flex-shrink: 0;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.75rem 1.25rem;
  border: none;
  background: ${props => props.$active ? '#222' : 'white'};
  color: ${props => props.$active ? 'white' : '#222'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  
  &:hover {
    background: ${props => props.$active ? '#444' : '#f8f8f8'};
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden; /* Prevent content overflow */
`;


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

const TableContainer = styled.div`
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow-y: auto; /* Allow vertical scrolling if needed */
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* Fixed layout for better column control */
`;

const Th = styled.th<{ $width?: string }>`
  background: #f8f8f8;
  padding: 0.5rem 0.75rem;
  text-align: left;
  font-weight: 500;
  color: #333;
  border-bottom: 2px solid #eee;
  white-space: nowrap;
  width: ${props => props.$width || 'auto'};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Td = styled.td<{ $width?: string }>`
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #eee;
  color: #666;
  vertical-align: top;
  width: ${props => props.$width || 'auto'};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: break-word;
`;

const Tr = styled.tr`
  &:hover {
    background: #f9f9f9;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => props.$variant === 'primary' ? `
    background: #222;
    color: white;
    
    &:hover {
      background: #444;
    }
  ` : `
    background: white;
    color: #222;
    border: 1px solid #ccc;
    
    &:hover {
      background: #f5f5f5;
    }
  `}
`;

const StatusBadge = styled.span<{ $status: 'PENDING' | 'APPROVED' | 'REJECTED' }>`
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  ${props => {
    switch (props.$status) {
      case 'PENDING':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      case 'APPROVED':
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      case 'REJECTED':
        return `
          background: #fee2e2;
          color: #991b1b;
        `;
    }
  }}
`;

const ReaffirmationBadge = styled.span<{ $status: ReaffirmationStatus }>`
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  display: inline-block;
  white-space: nowrap;
  
  ${props => {
    switch (props.$status) {
      case 'CURRENT':
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      case 'DUE_SOON':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      case 'OVERDUE':
        return `
          background: #fee2e2;
          color: #991b1b;
        `;
    }
  }}
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


type TabType = 'explore' | 'enhanced-bulk' | 'my-requests';

const LegalContentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showReaffirmModal, setShowReaffirmModal] = useState(false);
  const [showEnhancedReaffirmModal, setShowEnhancedReaffirmModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [selectedCombination, setSelectedCombination] = useState<RequirementCombination | null>(null);
  const [selectedCombinations, setSelectedCombinations] = useState<RequirementCombination[]>([]);
  
  // Filters for explore tab
  const [filters, setFilters] = useState({
    jurisdiction: '',
    entity: '',
    subjectType: ''
  });

  const { 
    getRequirements, 
    getChangeRequests, 
    createChangeRequest,
    initializeSampleData,
    reaffirmRequirement,
    generateRequirementCombinations,
    bulkReaffirmRequirements
  } = useRequirementsApi();

  const { progress } = useBulkReaffirmation();

  // Initialize sample data on component mount
  useEffect(() => {
    initializeSampleData();
  }, [initializeSampleData]);

  // Load requirements when filters change
  const loadRequirements = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams = {
        jurisdiction: filters.jurisdiction ? [filters.jurisdiction] : undefined,
        entity: filters.entity ? [filters.entity] : undefined,
        subjectType: filters.subjectType ? [filters.subjectType] : undefined,
      };
      
      const data = await getRequirements(filterParams);
      console.log('Loaded requirements:', data);
      console.log('Sample requirement:', data[0]);
      setRequirements(data);
    } catch (error) {
      console.error('Error loading requirements:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, getRequirements]);


  // Load requirement combinations
  const loadRequirementCombinations = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Loading requirement combinations...');
      
      // Ensure requirements are loaded first
      await loadRequirements();
      
      const combinations = await generateRequirementCombinations();
      console.log('Generated combinations:', combinations.length);
    } catch (error) {
      console.error('Error loading requirement combinations:', error);
    } finally {
      setLoading(false);
    }
  }, [generateRequirementCombinations, loadRequirements]);

  // Load change requests
  const loadChangeRequests = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Loading change requests for current-user...');
      const data = await getChangeRequests(undefined, undefined, 'current-user');
      console.log('Loaded change requests:', data);
      setChangeRequests(data);
    } catch (error) {
      console.error('Error loading change requests:', error);
    } finally {
      setLoading(false);
    }
  }, [getChangeRequests]);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'explore') {
      loadRequirements();
    } else if (activeTab === 'enhanced-bulk') {
      loadRequirementCombinations();
    } else {
      loadChangeRequests();
    }
  }, [activeTab, loadRequirements, loadRequirementCombinations, loadChangeRequests]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleProposeEdit = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setShowProposeModal(true);
  };



  const handleSubmitChangeRequest = async (data: {
    requirementId: string;
    proposedText: string;
    impact: string;
    approver: string;
    title: string;
    jurisdiction: string;
    entity: string;
    subjectType: string;
  }) => {
    try {
      await createChangeRequest(data);
      setShowProposeModal(false);
      setSelectedRequirement(null);
      
      // Switch to "My Change Requests" tab and reload data
      setActiveTab('my-requests');
      await loadChangeRequests();
    } catch (error) {
      console.error('Error creating change request:', error);
      throw error;
    }
  };

  const handleSubmitReaffirmation = async (data: ReaffirmationRequest) => {
    try {
      console.log('Submitting reaffirmation:', data);
      await reaffirmRequirement(data);
      console.log('Reaffirmation completed successfully');
      
      // Reload data to reflect changes
      console.log('Reloading all requirements...');
      await loadRequirements();
      console.log('All requirements reloaded');
      
      setShowReaffirmModal(false);
      setSelectedRequirement(null);
      
      // Show success message
      alert('Requirement reaffirmed successfully!');
    } catch (error) {
      console.error('Error submitting reaffirmation:', error);
      alert('Failed to reaffirm requirement. Please try again.');
      throw error;
    }
  };


  // Enhanced bulk reaffirmation handlers
  const handleEnhancedBulkReaffirm = async (request: BulkReaffirmationRequest) => {
    try {
      console.log('Starting enhanced bulk reaffirmation:', request);
      
      // Use the bulk reaffirmation API
      await bulkReaffirmRequirements(request);
      
      // Reload all data
      await loadRequirements();
      await loadRequirementCombinations();
      
      setShowEnhancedReaffirmModal(false);
      setSelectedCombinations([]);
      
      console.log('Enhanced bulk reaffirmation completed successfully');
    } catch (error) {
      console.error('Error in enhanced bulk reaffirmation:', error);
      throw error;
    }
  };


  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateCompact = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    });
  };

  const getStatusIcon = (status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    switch (status) {
      case 'PENDING':
        return <FiClock />;
      case 'APPROVED':
        return <FiCheckCircle />;
      case 'REJECTED':
        return <FiXCircle />;
    }
  };

  const getReaffirmationStatus = (requirement: Requirement): ReaffirmationStatus => {
    if (!requirement.nextReaffirmationDue) {
      console.error('Missing nextReaffirmationDue for requirement:', requirement.id);
      return 'CURRENT';
    }
    
    const now = new Date();
    const dueDate = new Date(requirement.nextReaffirmationDue);
    
    if (isNaN(dueDate.getTime())) {
      console.error('Invalid nextReaffirmationDue date for requirement:', requirement.id, requirement.nextReaffirmationDue);
      return 'CURRENT';
    }
    
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) {
      return 'OVERDUE';
    } else if (daysUntilDue <= 30) {
      return 'DUE_SOON';
    } else {
      return 'CURRENT';
    }
  };

  const getReaffirmationStatusText = (status: ReaffirmationStatus): string => {
    switch (status) {
      case 'CURRENT':
        return 'Current';
      case 'DUE_SOON':
        return 'Due Soon';
      case 'OVERDUE':
        return 'Overdue';
    }
  };

  return (
    <DashboardContainer>
      <Tabs>
        <Tab 
          $active={activeTab === 'explore'} 
          onClick={() => setActiveTab('explore')}
        >
          Explore Requirements
        </Tab>
        <Tab 
          $active={activeTab === 'enhanced-bulk'} 
          onClick={() => setActiveTab('enhanced-bulk')}
        >
          Enhanced Bulk Reaffirmation
        </Tab>
        <Tab 
          $active={activeTab === 'my-requests'} 
          onClick={() => setActiveTab('my-requests')}
        >
          My Change Requests
        </Tab>
      </Tabs>

      {activeTab === 'explore' && (
        <Section>
          <Filters>
            <FilterGroup>
              <FilterLabel>Jurisdiction</FilterLabel>
              <SelectWrapper>
                <StyledSelect
                  value={filters.jurisdiction}
                  onChange={(value) => handleFilterChange('jurisdiction', value)}
                  options={[
                    { value: '', label: 'All Jurisdictions' },
                    { value: 'Germany', label: 'Germany' },
                    { value: 'United States', label: 'United States' },
                    { value: 'Singapore', label: 'Singapore' },
                    { value: 'United Kingdom', label: 'United Kingdom' },
                    { value: 'Canada', label: 'Canada' },
                    { value: 'Brazil', label: 'Brazil' }
                  ]}
                  placeholder="All Jurisdictions"
                />
              </SelectWrapper>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Entity</FilterLabel>
              <SelectWrapper>
                <StyledSelect
                  value={filters.entity}
                  onChange={(value) => handleFilterChange('entity', value)}
                  options={[
                    { value: '', label: 'All Entities' },
                    { value: 'Deutsche Technologie und Datendienste GmbH', label: 'Deutsche Technologie und Datendienste GmbH' },
                    { value: 'US Global Technology Solutions Corporation', label: 'US Global Technology Solutions Corporation' },
                    { value: 'Singapore Advanced Technology Solutions Pte Ltd', label: 'Singapore Advanced Technology Solutions Pte Ltd' }
                  ]}
                  placeholder="All Entities"
                />
              </SelectWrapper>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Subject Type</FilterLabel>
              <SelectWrapper>
                <StyledSelect
                  value={filters.subjectType}
                  onChange={(value) => handleFilterChange('subjectType', value)}
                  options={[
                    { value: '', label: 'All Types' },
                    { value: 'Employee', label: 'Employee' },
                    { value: 'Client', label: 'Client' },
                    { value: 'Candidate', label: 'Candidate' },
                    { value: 'Prospect', label: 'Prospect' },
                    { value: 'Candidate', label: 'Candidate' }
                  ]}
                  placeholder="All Types"
                />
              </SelectWrapper>
            </FilterGroup>
          </Filters>

          {loading ? (
            <LoadingMessage>Loading requirements...</LoadingMessage>
          ) : (
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <Th $width="25%">Title</Th>
                    <Th $width="12%">Jurisdiction</Th>
                    <Th $width="20%">Entity</Th>
                    <Th $width="10%">Subject Type</Th>
                    <Th $width="6%">Version</Th>
                    <Th $width="10%">Original Date</Th>
                    <Th $width="10%">Last Reaffirmed</Th>
                    <Th $width="12%">Reaffirmation Status</Th>
                    <Th $width="10%">Last Updated</Th>
                    <Th $width="15%">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.length === 0 ? (
                    <tr>
                      <Td colSpan={10}>
                        <NoDataMessage>No requirements found</NoDataMessage>
                      </Td>
                    </tr>
                  ) : (
                    requirements.map((req) => {
                      const reaffirmationStatus = getReaffirmationStatus(req);
                      return (
                        <Tr key={req.id}>
                          <Td $width="25%">{req.title}</Td>
                          <Td $width="12%">{req.jurisdiction}</Td>
                          <Td $width="20%">{req.entity}</Td>
                          <Td $width="10%">{req.subjectType}</Td>
                          <Td $width="6%">v{req.version}</Td>
                          <Td $width="10%">{formatDateCompact(req.originalIngestionDate)}</Td>
                          <Td $width="10%">{req.lastReaffirmedAt ? formatDateCompact(req.lastReaffirmedAt) : 'Never'}</Td>
                          <Td $width="12%">
                            <ReaffirmationBadge $status={reaffirmationStatus}>
                              {getReaffirmationStatusText(reaffirmationStatus)}
                            </ReaffirmationBadge>
                          </Td>
                          <Td $width="10%">{formatDate(req.updatedAt)}</Td>
                          <Td $width="15%">
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <Button onClick={() => handleProposeEdit(req)}>
                                <FiEdit3 />
                                Propose Edit
                              </Button>
                            </div>
                          </Td>
                        </Tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </TableContainer>
          )}
        </Section>
      )}


      {activeTab === 'enhanced-bulk' && (
        <EnhancedBulkReaffirmation />
      )}

      {activeTab === 'my-requests' && (
        <Section>
          {loading ? (
            <LoadingMessage>Loading change requests...</LoadingMessage>
          ) : (
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <Th $width="30%">Title</Th>
                    <Th $width="25%">Requirement</Th>
                    <Th $width="15%">Status</Th>
                    <Th $width="15%">Assigned To</Th>
                    <Th $width="15%">Submitted</Th>
                    <Th $width="15%">Decided</Th>
                  </tr>
                </thead>
                <tbody>
                  {changeRequests.length === 0 ? (
                    <tr>
                      <Td colSpan={6}>
                        <NoDataMessage>No change requests found</NoDataMessage>
                      </Td>
                    </tr>
                  ) : (
                    changeRequests.map((cr) => (
                      <Tr key={cr.id}>
                        <Td $width="30%">{cr.title}</Td>
                        <Td $width="25%">{cr.jurisdiction} - {cr.entity}</Td>
                        <Td $width="15%">
                          <StatusBadge $status={cr.status}>
                            {getStatusIcon(cr.status)}
                            {cr.status}
                          </StatusBadge>
                        </Td>
                        <Td $width="15%">{cr.approver}</Td>
                        <Td $width="15%">{formatDate(cr.createdAt)}</Td>
                        <Td $width="15%">{cr.decidedAt ? formatDate(cr.decidedAt) : '-'}</Td>
                      </Tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableContainer>
          )}
        </Section>
      )}

      <ProposeEditModal
        isOpen={showProposeModal}
        onClose={() => {
          setShowProposeModal(false);
          setSelectedRequirement(null);
        }}
        requirement={selectedRequirement}
        requirements={requirements}
        onSubmit={handleSubmitChangeRequest}
      />

      <ReaffirmModal
        isOpen={showReaffirmModal}
        onClose={() => {
          setShowReaffirmModal(false);
          setSelectedRequirement(null);
        }}
        requirement={selectedRequirement}
        requirements={requirements}
        onSubmit={handleSubmitReaffirmation}
      />

      <EnhancedReaffirmModal
        isOpen={showEnhancedReaffirmModal}
        onClose={() => {
          setShowEnhancedReaffirmModal(false);
          setSelectedCombination(null);
          setSelectedCombinations([]);
        }}
        combination={selectedCombination || undefined}
        combinations={selectedCombinations}
        onSubmit={handleEnhancedBulkReaffirm}
      />

      {progress && (
        <BulkOperationProgress
          progress={progress}
          onClose={() => {
            // Progress modal will handle its own closing
          }}
        />
      )}
    </DashboardContainer>
  );
};

export default LegalContentDashboard;
