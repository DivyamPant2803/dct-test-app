import React, { useState, useMemo } from 'react';
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

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
`;

const Td = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #eee;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.status === 'Active' ? '#e6f4ea' : '#f8f9fa'};
  color: ${props => props.status === 'Active' ? '#1e8e3e' : '#666'};
`;

const RiskBadge = styled.span<{ level: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.level.toLowerCase()) {
      case 'low':
        return '#e6f4ea';
      case 'medium':
        return '#fff3e0';
      case 'high':
        return '#fce8e6';
      default:
        return '#f8f9fa';
    }
  }};
  color: ${props => {
    switch (props.level.toLowerCase()) {
      case 'low':
        return '#1e8e3e';
      case 'medium':
        return '#f57c00';
      case 'high':
        return '#d93025';
      default:
        return '#666';
    }
  }};
`;

// Define a type for the data rows that includes filterable fields
interface OutputRow {
  country: string;
  entityName: string;
  output: string;
  legalRequirements: string[];
  endUserActions: string[];
  remediation: string[];
  riskLevel: string;
  status: string;
  contactPerson: string;
  dateGenerated: string;
  versionDate: string;
  informationCategory: string;
  purposeTypes: string;
  countryScope: string;
  recipientTypes: string;
  clientPurposes: string;
  scopeOfTransfer: string;
  [key: string]: string | string[]; // index signature for filterable fields
}

const Output: React.FC = () => {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const sampleData: OutputRow[] = [
    {
      country: 'Japan',
      entityName: 'SG Pte Ltd',
      output: 'OK',
      legalRequirements: [
        'Obtain explicit consent',
        'Document transfer purpose',
        'Maintain transfer records'
      ],
      endUserActions: [
        'Obtain explicit consent',
        'Document transfer purpose',
        'Maintain transfer records'
      ],
      remediation: [
        'Implement encryption',
        'Regular audits',
        'Access controls'
      ],
      riskLevel: 'Low',
      status: 'Active',
      contactPerson: 'APAC Data Protection Officer',
      dateGenerated: '2025-04-24',
      versionDate: '2025-04-24',
      // Example filterable fields:
      informationCategory: 'client',
      purposeTypes: 'employee-employee',
      countryScope: 'inside',
      recipientTypes: 'entity',
      clientPurposes: 'outsourcing',
      scopeOfTransfer: 'internal',
    }
  ];

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    // Filtering is handled by useMemo below
  };

  // Filtering logic: only include rows that match all non-empty filters
  const filteredRows = useMemo(() => {
    return sampleData.filter(row => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        // Only compare if the row's value is a string
        const rowValue = row[key];
        if (typeof rowValue === 'string') {
          return rowValue === value;
        }
        return true;
      });
    });
  }, [sampleData, filters]);

  return (
    <PageContainer>
      <OutputHeader
        informationCategory={['client', 'employee']}
        onFilterChange={handleFilterChange}
      />
      
      <ContentContainer>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Country</Th>
                <Th>Entity Name</Th>
                <Th>Output</Th>
                <Th>Legal Requirements</Th>
                <Th>End User Actions</Th>
                <Th>Remediation</Th>
                <Th>Risk Level</Th>
                <Th>Status</Th>
                <Th>Contact Person</Th>
                <Th>Date Generated</Th>
                <Th>Version Date</Th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, index) => (
                <tr key={index}>
                  <Td>{row.country}</Td>
                  <Td>{row.entityName}</Td>
                  <Td>
                    <StatusBadge status={row.output}>{row.output}</StatusBadge>
                  </Td>
                  <Td>
                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                      {row.legalRequirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </Td>
                  <Td>
                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                      {row.endUserActions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </Td>
                  <Td>
                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                      {row.remediation.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </Td>
                  <Td>
                    <RiskBadge level={row.riskLevel}>{row.riskLevel}</RiskBadge>
                  </Td>
                  <Td>
                    <StatusBadge status={row.status}>{row.status}</StatusBadge>
                  </Td>
                  <Td>{row.contactPerson}</Td>
                  <Td>{row.dateGenerated}</Td>
                  <Td>{row.versionDate}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </ContentContainer>
    </PageContainer>
  );
};

export default Output; 