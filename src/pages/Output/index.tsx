import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import OutputHeader from '../../components/OutputHeader';

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

const Output: React.FC = () => {
  const [filters, setFilters] = useState<Record<string, string[]>>({
    informationCategory: [],
    purposeTypes: [],
    countryScope: [],
    recipientTypes: [],
    clientPurposes: [],
    scopeOfTransfer: []
  });

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

  return (
    <PageContainer>
      <OutputHeader
        informationCategory={['client', 'employee']}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      <ContentContainer>
        {loading ? (
          <Spinner />
        ) :
          null 
        }
      </ContentContainer>
    </PageContainer>
  );
};

export default Output; 