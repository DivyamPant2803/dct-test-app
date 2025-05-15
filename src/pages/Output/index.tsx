import React, { useState, useCallback, Suspense } from 'react';
import styled from 'styled-components';
import OutputHeader from '../../components/OutputHeader';
import ApprovedChannels from '../../components/ApprovedChannels';
import OutputCards from '../../components/OutputCards';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 20px;
  background: #f8f9fa;
  overflow: auto;
`;
// Simple CSS spinner
const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 40px auto;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Lazy-load ResultsTable for optimization
const ResultsTable = React.lazy(() => import('../../components/ResultsTable'));

const Output: React.FC = () => {
  const [filters, setFilters] = useState<Record<string, string[]>>({
    informationCategory: [],
    purposeTypes: [],
    countryScope: [],
    recipientTypes: [],
    clientPurposes: [],
    scopeOfTransfer: []
  });

  // Modal state for ApprovedChannels
  const [showApprovedChannels, setShowApprovedChannels] = useState(false);
  const handleOpenApprovedChannels = () => {
    console.log('Approved Channels button clicked');
    setShowApprovedChannels(true);
  };
  const handleCloseApprovedChannels = () => setShowApprovedChannels(false);

  // Memoize the handler to prevent infinite loop
  const handleFilterChange = useCallback((newFilters: Record<string, string[]>) => {
    setFilters(newFilters);
  }, []);

  // Simulate loading for large data
  const [loading, setLoading] = useState(true);
  React.useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 800); // Simulate data processing
    return () => clearTimeout(timeout);
  }, [filters]);

  // Minimal mock formData for ResultsTable
  const formData = {
    informationCategory: ['client'],
    dataSubjectType: ['employee'],
    countries: ['Japan'],
    entities: ['SG Pte Ltd'],
    recipientType: ['entity']
  };

  return (
    <PageContainer>
      <OutputHeader
        informationCategory={['client', 'employee']}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApprovedChannelsClick={handleOpenApprovedChannels}
      />
      {showApprovedChannels && (
        console.log('Rendering ApprovedChannels modal'),
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.2)', minWidth: 400, minHeight: 300, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto', position: 'relative' }}>
            <ApprovedChannels />
            <button onClick={handleCloseApprovedChannels} style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer' }}>&times;</button>
          </div>
        </div>
      )}
      <ContentContainer>
        {loading ? (
          <Spinner />
        ) : (
          <OutputCards
            combinations={[
              {
                id: '1',
                country: 'Japan',
                entity: 'Japan Technology Solutions Corporation 株式会社',
                type: 'Employee',
                legalOrBusiness: 'Legal',
                transferType: 'Inside the Country',
                purpose: 'Monitoring',
                output: 'OK',
                risk: 'Low',
                status: 'Active',
                contact: 'APAC Data Protection Officer',
                dateGenerated: '2025-05-14',
                versionDate: '2025-05-14',
                requirements: [
                  'Obtain explicit consent',
                  'Document transfer purpose',
                  'Maintain transfer records'
                ],
                actions: [
                  'Notify data subject',
                  'Provide opt-out option'
                ],
                remediation: [
                  'Implement encryption',
                  'Regular audits',
                  'Access controls'
                ]
              },
              {
                id: '2',
                country: 'Germany',
                entity: 'CS Client Entity',
                type: 'Client',
                legalOrBusiness: 'Business',
                transferType: 'Outside the Country',
                purpose: 'Asset Management',
                output: 'OKC',
                risk: 'Medium',
                status: 'Active',
                contact: 'EU Data Protection Officer',
                dateGenerated: '2025-05-14',
                versionDate: '2025-05-14',
                requirements: [
                  'Obtain client consent',
                  'Document asset management purpose'
                ],
                actions: [
                  'Notify client',
                  'Provide data access report'
                ],
                remediation: [
                  'Implement encryption',
                  'Regular audits',
                  'Access controls'
                ]
              }
            ]}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default Output; 