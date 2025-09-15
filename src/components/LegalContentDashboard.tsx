import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Requirement, ChangeRequest, ReaffirmationStatus, ReaffirmationRequest } from '../types/index';
import { useRequirementsApi } from '../hooks/useRequirementsApi';
import ProposeEditModal from './ProposeEditModal';
import ReaffirmModal from './ReaffirmModal';
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
  margin-bottom: 1.5rem;
  flex-shrink: 0;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: ${props => props.$active ? '#222' : 'white'};
  color: ${props => props.$active ? 'white' : '#222'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  
  &:hover {
    background: ${props => props.$active ? '#444' : '#f8f8f8'};
  }
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
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 500;
  color: #333;
  border-bottom: 2px solid #eee;
  white-space: nowrap;
`;

const ThRight = styled.th`
  background: #f8f8f8;
  padding: 0.75rem 1rem;
  text-align: right;
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

const TdRight = styled.td`
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #eee;
  color: #666;
  vertical-align: top;
  text-align: right;
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

type TabType = 'explore' | 'reaffirmation-due' | 'my-requests';

const LegalContentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [reaffirmationDueRequirements, setReaffirmationDueRequirements] = useState<Requirement[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showReaffirmModal, setShowReaffirmModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  
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
    reaffirmRequirement
  } = useRequirementsApi();

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

  // Load reaffirmation due requirements
  const loadReaffirmationDueRequirements = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams = {
        jurisdiction: filters.jurisdiction ? [filters.jurisdiction] : undefined,
        entity: filters.entity ? [filters.entity] : undefined,
        subjectType: filters.subjectType ? [filters.subjectType] : undefined,
      };
      
      console.log('Loading requirements with filters:', filterParams);
      const data = await getRequirements(filterParams);
      console.log('All requirements loaded:', data.length);
      
      // Filter for requirements that are due or overdue for reaffirmation
      const dueRequirements = data.filter(req => {
        const status = getReaffirmationStatus(req);
        console.log(`Requirement ${req.id} (${req.title}): status=${status}, nextDue=${req.nextReaffirmationDue}, lastReaffirmed=${req.lastReaffirmedAt}`);
        return status === 'DUE_SOON' || status === 'OVERDUE';
      });
      
      console.log('Due requirements found:', dueRequirements.length);
      setReaffirmationDueRequirements(dueRequirements);
    } catch (error) {
      console.error('Error loading reaffirmation due requirements:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, getRequirements]);

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
    } else if (activeTab === 'reaffirmation-due') {
      loadReaffirmationDueRequirements();
    } else {
      loadChangeRequests();
    }
  }, [activeTab, loadRequirements, loadReaffirmationDueRequirements, loadChangeRequests]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleProposeEdit = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setShowProposeModal(true);
  };

  const handleReaffirm = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setShowReaffirmModal(true);
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
      
      setShowReaffirmModal(false);
      setSelectedRequirement(null);
      
      // Reload data to reflect changes
      if (activeTab === 'reaffirmation-due') {
        console.log('Reloading reaffirmation due requirements...');
        await loadReaffirmationDueRequirements();
        console.log('Reaffirmation due requirements reloaded');
      } else {
        console.log('Reloading all requirements...');
        await loadRequirements();
        console.log('All requirements reloaded');
      }
      
      // Show success message
      alert('Requirement reaffirmed successfully!');
    } catch (error) {
      console.error('Error submitting reaffirmation:', error);
      alert('Failed to reaffirm requirement. Please try again.');
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          $active={activeTab === 'reaffirmation-due'} 
          onClick={() => setActiveTab('reaffirmation-due')}
        >
          Reaffirmation Due
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
            <Table>
              <thead>
                <tr>
                  <Th>Title</Th>
                  <Th>Jurisdiction</Th>
                  <Th>Entity</Th>
                  <Th>Subject Type</Th>
                  <Th>Version</Th>
                  <Th>Original Date</Th>
                  <Th>Last Reaffirmed</Th>
                  <Th>Reaffirmation Status</Th>
                  <Th>Last Updated</Th>
                  <Th>Actions</Th>
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
                        <Td>{req.title}</Td>
                        <Td>{req.jurisdiction}</Td>
                        <Td>{req.entity}</Td>
                        <Td>{req.subjectType}</Td>
                        <Td>v{req.version}</Td>
                        <Td>{formatDate(req.originalIngestionDate)}</Td>
                        <Td>{req.lastReaffirmedAt ? formatDate(req.lastReaffirmedAt) : 'Never'}</Td>
                        <Td>
                          <ReaffirmationBadge $status={reaffirmationStatus}>
                            {getReaffirmationStatusText(reaffirmationStatus)}
                          </ReaffirmationBadge>
                        </Td>
                        <Td>{formatDate(req.updatedAt)}</Td>
                        <Td>
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
          )}
        </Section>
      )}

      {activeTab === 'reaffirmation-due' && (
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
            <LoadingMessage>Loading reaffirmation due requirements...</LoadingMessage>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Title</Th>
                  <Th>Jurisdiction</Th>
                  <Th>Entity</Th>
                  <Th>Subject Type</Th>
                  <Th>Version</Th>
                  <Th>Original Date</Th>
                  <Th>Last Reaffirmed</Th>
                  <Th>Status</Th>
                  <ThRight>Days Until Due</ThRight>
                  <ThRight>Actions</ThRight>
                </tr>
              </thead>
              <tbody>
                {reaffirmationDueRequirements.length === 0 ? (
                  <tr>
                    <Td colSpan={10}>
                      <NoDataMessage>No requirements due for reaffirmation</NoDataMessage>
                    </Td>
                  </tr>
                ) : (
                  reaffirmationDueRequirements.map((req) => {
                    const reaffirmationStatus = getReaffirmationStatus(req);
                    const now = new Date();
                    const dueDate = new Date(req.nextReaffirmationDue);
                    const daysUntilDue = isNaN(dueDate.getTime()) ? 0 : Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <Tr key={req.id}>
                        <Td>{req.title}</Td>
                        <Td>{req.jurisdiction}</Td>
                        <Td>{req.entity}</Td>
                        <Td>{req.subjectType}</Td>
                        <Td>v{req.version}</Td>
                        <Td>{formatDate(req.originalIngestionDate)}</Td>
                        <Td>{req.lastReaffirmedAt ? formatDate(req.lastReaffirmedAt) : 'Never'}</Td>
                        <Td>
                          <ReaffirmationBadge $status={reaffirmationStatus}>
                            {getReaffirmationStatusText(reaffirmationStatus)}
                          </ReaffirmationBadge>
                        </Td>
                        <TdRight>
                          <span style={{ 
                            color: daysUntilDue < 0 ? '#991b1b' : daysUntilDue <= 7 ? '#92400e' : '#065f46',
                            fontWeight: '500'
                          }}>
                            {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days`}
                          </span>
                        </TdRight>
                        <TdRight>
                          <Button $variant="primary" onClick={() => handleReaffirm(req)}>
                            Reaffirm
                          </Button>
                        </TdRight>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          )}
        </Section>
      )}

      {activeTab === 'my-requests' && (
        <Section>
          {loading ? (
            <LoadingMessage>Loading change requests...</LoadingMessage>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Title</Th>
                  <Th>Requirement</Th>
                  <Th>Status</Th>
                  <Th>Assigned To</Th>
                  <Th>Submitted</Th>
                  <Th>Decided</Th>
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
                      <Td>{cr.title}</Td>
                      <Td>{cr.jurisdiction} - {cr.entity}</Td>
                      <Td>
                        <StatusBadge $status={cr.status}>
                          {getStatusIcon(cr.status)}
                          {cr.status}
                        </StatusBadge>
                      </Td>
                      <Td>{cr.approver}</Td>
                      <Td>{formatDate(cr.createdAt)}</Td>
                      <Td>{cr.decidedAt ? formatDate(cr.decidedAt) : '-'}</Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
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
        onSubmit={handleSubmitChangeRequest}
      />

      <ReaffirmModal
        isOpen={showReaffirmModal}
        onClose={() => {
          setShowReaffirmModal(false);
          setSelectedRequirement(null);
        }}
        requirement={selectedRequirement}
        onSubmit={handleSubmitReaffirmation}
      />
    </DashboardContainer>
  );
};

export default LegalContentDashboard;
