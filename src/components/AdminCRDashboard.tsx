import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { ChangeRequest, CRStatus } from '../types/index';
import { useRequirementsApi } from '../hooks/useRequirementsApi';
import CRReviewDrawer from './CRReviewDrawer';
import StyledSelect from './common/StyledSelect';
import { FiEye, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';

const DashboardContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

// const SectionTitle = styled.h2`
//   font-size: 1.25rem;
//   font-weight: 600;
//   color: #222;
//   margin-bottom: 1rem;
//   border-bottom: 2px solid #f0f0f0;
//   padding-bottom: 0.5rem;
//   flex-shrink: 0;
// `;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
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
  padding: 0.75rem;
  text-align: left;
  font-weight: 500;
  color: #333;
  border-bottom: 2px solid #eee;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.75rem;
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

const DiffBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #e0f2fe;
  color: #0277bd;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: #666;
  font-size: 0.9rem;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: #666;
  font-size: 0.9rem;
`;

type TabType = 'pending' | 'approved' | 'rejected';

const AdminCRDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReviewDrawer, setShowReviewDrawer] = useState(false);
  const [selectedCR, setSelectedCR] = useState<ChangeRequest | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    approver: 'current-admin' // Default to current admin
  });

  const { getChangeRequests, submitCRDecision } = useRequirementsApi();

  // Load change requests when tab or filters change
  const loadChangeRequests = useCallback(async () => {
    setLoading(true);
    try {
      let status: CRStatus | undefined;
      
      switch (activeTab) {
        case 'pending':
          status = 'PENDING';
          break;
        case 'approved':
          status = 'APPROVED';
          break;
        case 'rejected':
          status = 'REJECTED';
          break;
      }
      
      const data = await getChangeRequests(status, filters.approver);
      console.log('AdminCRDashboard: Loading CRs with status:', status, 'approver:', filters.approver);
      console.log('AdminCRDashboard: Loaded data:', data);
      setChangeRequests(data);
    } catch (error) {
      console.error('Error loading change requests:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters.approver, getChangeRequests]);


  useEffect(() => {
    loadChangeRequests();
  }, [loadChangeRequests]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleReviewCR = (cr: ChangeRequest) => {
    setSelectedCR(cr);
    setShowReviewDrawer(true);
  };

  const handleCRDecision = async (crId: string, decision: 'APPROVE' | 'REJECT', note?: string) => {
    try {
      await submitCRDecision(crId, decision, note, filters.approver);
      setShowReviewDrawer(false);
      setSelectedCR(null);
      
      // Reload change requests
      loadChangeRequests();
    } catch (error) {
      console.error('Error submitting CR decision:', error);
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

  // const getTabTitle = (tab: TabType) => {
  //   switch (tab) {
  //     case 'pending':
  //       return 'Pending CRs';
  //     case 'approved':
  //       return 'Approved';
  //     case 'rejected':
  //       return 'Rejected';
  //   }
  // };

  return (
    <DashboardContainer>
      <Tabs>
        <Tab 
          $active={activeTab === 'pending'} 
          onClick={() => setActiveTab('pending')}
        >
          Pending CRs
        </Tab>
        <Tab 
          $active={activeTab === 'approved'} 
          onClick={() => setActiveTab('approved')}
        >
          Approved
        </Tab>
        <Tab 
          $active={activeTab === 'rejected'} 
          onClick={() => setActiveTab('rejected')}
        >
          Rejected
        </Tab>
      </Tabs>

      <Section>
        
        <Filters>
          <FilterGroup>
            <FilterLabel>Assigned To</FilterLabel>
            <SelectWrapper>
              <StyledSelect
                value={filters.approver}
                onChange={(value) => handleFilterChange('approver', value)}
                options={[
                  { value: 'current-admin', label: 'Current Admin' },
                  { value: 'admin-john', label: 'John Smith' },
                  { value: 'admin-sarah', label: 'Sarah Johnson' },
                  { value: 'admin-mike', label: 'Mike Wilson' },
                  { value: 'admin-lisa', label: 'Lisa Brown' }
                ]}
                placeholder="Select approver..."
              />
            </SelectWrapper>
          </FilterGroup>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button onClick={loadChangeRequests} $variant="secondary">
              <FiRefreshCw />
              Refresh
            </Button>
          </div>
        </Filters>

        {loading ? (
          <LoadingMessage>Loading change requests...</LoadingMessage>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>CR ID</Th>
                <Th>Title</Th>
                <Th>Requirement</Th>
                <Th>Author</Th>
                <Th>Submitted</Th>
                <Th>Status</Th>
                <Th>Changes</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {changeRequests.length === 0 ? (
                <tr>
                  <Td colSpan={8}>
                    <NoDataMessage>No change requests found</NoDataMessage>
                  </Td>
                </tr>
              ) : (
                changeRequests.map((cr) => (
                  <Tr key={cr.id}>
                    <Td>{cr.id}</Td>
                    <Td>{cr.title}</Td>
                    <Td>{cr.jurisdiction} - {cr.entity}</Td>
                    <Td>{cr.author}</Td>
                    <Td>{formatDate(cr.createdAt)}</Td>
                    <Td>
                      <StatusBadge $status={cr.status}>
                        {getStatusIcon(cr.status)}
                        {cr.status}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <DiffBadge>Text Changes</DiffBadge>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button onClick={() => handleReviewCR(cr)}>
                          <FiEye />
                          Review
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

      <CRReviewDrawer
        isOpen={showReviewDrawer}
        onClose={() => {
          setShowReviewDrawer(false);
          setSelectedCR(null);
        }}
        changeRequest={selectedCR}
        onDecision={handleCRDecision}
        currentReviewer={filters.approver}
      />
    </DashboardContainer>
  );
};

export default AdminCRDashboard;
