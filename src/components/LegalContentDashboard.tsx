import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Requirement, ChangeRequest } from '../types/index';
import { useRequirementsApi } from '../hooks/useRequirementsApi';
import ProposeEditModal from './ProposeEditModal';
import StyledSelect from './common/StyledSelect';
import { FiEye, FiEdit3, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const DashboardContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
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
  padding: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
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

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
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
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
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

type TabType = 'explore' | 'my-requests';

const LegalContentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);
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
    initializeSampleData 
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
      setRequirements(data);
    } catch (error) {
      console.error('Error loading requirements:', error);
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
    } else {
      loadChangeRequests();
    }
  }, [activeTab, loadRequirements, loadChangeRequests]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
          $active={activeTab === 'my-requests'} 
          onClick={() => setActiveTab('my-requests')}
        >
          My Change Requests
        </Tab>
      </Tabs>

      {activeTab === 'explore' && (
        <Section>
          <SectionTitle>Explore Requirements</SectionTitle>
          
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
                    { value: 'United Kingdom', label: 'United Kingdom' }
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
                    { value: 'Prospect', label: 'Prospect' }
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
                  <Th>Last Updated</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {requirements.length === 0 ? (
                  <tr>
                    <Td colSpan={7}>
                      <NoDataMessage>No requirements found</NoDataMessage>
                    </Td>
                  </tr>
                ) : (
                  requirements.map((req) => (
                    <Tr key={req.id}>
                      <Td>{req.title}</Td>
                      <Td>{req.jurisdiction}</Td>
                      <Td>{req.entity}</Td>
                      <Td>{req.subjectType}</Td>
                      <Td>v{req.version}</Td>
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
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Section>
      )}

      {activeTab === 'my-requests' && (
        <Section>
          <SectionTitle>My Change Requests</SectionTitle>
          
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
    </DashboardContainer>
  );
};

export default LegalContentDashboard;
