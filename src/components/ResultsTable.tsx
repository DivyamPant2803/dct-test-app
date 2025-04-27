import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import OutputHeader from './OutputHeader';

const TableContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
`;

const ExportButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #eee;
  border-radius: 4px;
  background: white;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f8f8;
    border-color: #ddd;
    color: #333;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: nowrap;
  background: #f8f8f8;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 4px;
    
    &:hover {
      background: #ccc;
    }
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 180px;
  flex-shrink: 0;
`;

const FilterLabel = styled.label`
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #333;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;

  &:hover {
    border-color: #999;
  }

  &:focus {
    outline: none;
    border-color: #ff0000;
    box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.1);
  }

  option {
    padding: 0.5rem;
  }
`;

const TableWrapper = styled.div`
  flex: 1;
  overflow: auto;
  padding: 20px;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 4px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
`;

const Th = styled.th`
  background: #f8f8f8;
  padding: 1rem;
  text-align: left;
  font-weight: 500;
  color: #333;
  top: 0;
  z-index: 1;
  border-bottom: 2px solid #eee;
  white-space: normal;
  min-width: 120px;
  vertical-align: top;

  &:nth-child(1) { width: 10%; } /* Country */
  &:nth-child(2) { width: 10%; } /* Entity Name */
  &:nth-child(3) { width: 8%; }  /* Output */
  &:nth-child(4) { width: 20%; } /* Legal Requirements */
  &:nth-child(5) { width: 15%; } /* End User Actions */
  &:nth-child(6) { width: 15%; } /* Remediation */
  &:nth-child(7) { width: 5%; }  /* Risk Level */
  &:nth-child(8) { width: 5%; }  /* Status */
  &:nth-child(9) { width: 12%; } /* Contact Person */
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  color: #666;
  white-space: normal;
  word-wrap: break-word;
  vertical-align: top;
  line-height: 1.4;
`;

const Tr = styled.tr`
  &:hover {
    background: #f9f9f9;
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

const StatusBadge = styled.span<{ $status: 'allowed' | 'restricted' | 'prohibited' }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
  background-color: ${props => {
    switch (props.$status) {
      case 'allowed':
        return '#4CAF50';
      case 'restricted':
        return '#FFA000';
      case 'prohibited':
        return '#FF0000';
      default:
        return '#666666';
    }
  }};
  color: white;
`;

const ListContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ListItem = styled.div`
  position: relative;
  padding-left: 1rem;
  
  &:before {
    content: "•";
    position: absolute;
    left: 0;
  }
`;

interface ResultRow {
  id: string;
  country: string;
  entityName: string;
  output: React.ReactNode;
  legalRequirements: string[];
  endUserActions: string[];
  remediation: string[];
  contactPerson: string;
  dateGenerated: string;
  versionDate: string;
  informationCategory: string;
  dataSubjectType: string;
  recipientType: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'Pending' | 'Expired';
}

interface ResultsTableProps {
  formData: {
    informationCategory: string[];
    dataSubjectType: string[];
    countries: string[];
    entities: string[];
    recipientType: string[];
  };
}

interface StatusBadgeProps {
  $status: 'allowed' | 'restricted' | 'prohibited';
  children: React.ReactNode;
}

const getRequirementsByCategory = (category: string) => {
  switch (category) {
    case 'Employee':
      return [
        'Employment Contract Update Required',
        'Internal Privacy Policy Update',
        'Works Council Consultation',
        'Data Processing Agreement'
      ];
    case 'Client':
      return [
        'Client Data Processing Agreement',
        'Privacy Notice Update Required',
        'Explicit Consent Required',
        'Data Transfer Impact Assessment'
      ];
    default:
      return ['Data Protection Agreement Required'];
  }
};

const getActionsBySubjectType = (subjectType: string) => {
  switch (subjectType) {
    case 'Current Employee':
      return [
        'Update employment contracts',
        'Provide privacy notice',
        'Document transfer purpose',
        'Maintain transfer records'
      ];
    case 'Client Employee':
      return [
        'Obtain client authorization',
        'Update service agreements',
        'Document transfer basis',
        'Implement data minimization'
      ];
    default:
      return [
        'Obtain explicit consent',
        'Document transfer purpose',
        'Maintain transfer records'
      ];
  }
};

const getRemediationByRecipientType = (recipientType: string) => {
  switch (recipientType) {
    case 'Group Entity':
      return [
        'Implement BCRs',
        'Regular compliance audits',
        'Access controls review'
      ];
    case 'Third Party':
      return [
        'Vendor assessment',
        'Data processing agreement',
        'Regular audits',
        'Access restrictions'
      ];
    default:
      return [
        'Implement encryption',
        'Regular audits',
        'Access controls'
      ];
  }
};

const getTransferStatus = (country: string): 'allowed' | 'restricted' | 'prohibited' => {
  const restrictedCountries = ['China', 'Russia', 'India'];
  const prohibitedCountries = ['North Korea', 'Iran', 'Mexico'];
  
  if (prohibitedCountries.includes(country)) return 'prohibited';
  if (restrictedCountries.includes(country)) return 'restricted';
  return 'allowed';
};

const getContactPerson = (country: string) => {
  const contacts: Record<string, string> = {
    'United States': 'US Data Protection Officer',
    'United Kingdom': 'UK Data Protection Officer',
    'Germany': 'EU Data Protection Officer',
    'France': 'EU Data Protection Officer',
    'Japan': 'APAC Data Protection Officer',
    'Singapore': 'APAC Data Protection Officer',
    'Australia': 'APAC Data Protection Officer',
  };
  
  return contacts[country] || 'Global Data Protection Officer';
};

const getLegalRequirements = (category: string, transferStatus: 'allowed' | 'restricted' | 'prohibited') => {
  if (transferStatus === 'allowed') return [];
  
  const baseRequirements = getRequirementsByCategory(category);
  const additionalRequirements = transferStatus === 'prohibited' 
    ? ['Transfer Impact Assessment Required', 'Executive Approval Required', 'Local DPO Consultation Required']
    : ['Additional Safeguards Required', 'Risk Assessment Required'];
  
  return [...baseRequirements, ...additionalRequirements];
};

const ResultsTable: React.FC<ResultsTableProps> = ({ formData }) => {
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string[]>>({
    informationCategory: [],
    purposeTypes: [],
    countryScope: [],
    recipientTypes: [],
    clientPurposes: []
  });

  const initialData = useMemo(() => {
    const results: ResultRow[] = [];
    const currentDate = new Date().toISOString().split('T')[0];

    console.log('Generating data with formData:', formData);

    // Early validation with detailed logging
    if (!formData?.countries?.length) {
      console.error('No countries in formData');
      return results;
    }
    if (!formData?.entities?.length) {
      console.error('No entities in formData');
      return results;
    }
    if (!formData?.informationCategory?.length) {
      console.error('No information categories in formData');
      return results;
    }
    if (!formData?.dataSubjectType?.length) {
      console.error('No data subject types in formData');
      return results;
    }
    if (!formData?.recipientType?.length) {
      console.error('No recipient types in formData');
      return results;
    }

    // Generate combinations
    try {
      formData.countries.forEach(country => {
        formData.entities.forEach(entity => {
          formData.informationCategory.forEach(category => {
            formData.dataSubjectType.forEach(subjectType => {
              formData.recipientType.forEach(recipient => {
                const transferStatus = getTransferStatus(country);
                
                results.push({
                  id: `${country}-${entity}-${category}-${Date.now()}`,
                  country,
                  entityName: entity,
                  output: (
                    <StatusBadge $status={transferStatus}>
                      {transferStatus === 'allowed' ? 'OK' : 
                       transferStatus === 'restricted' ? 'OKC' : 
                       'NOK'}
                    </StatusBadge>
                  ),
                  legalRequirements: getLegalRequirements(category, transferStatus),
                  endUserActions: getActionsBySubjectType(subjectType),
                  remediation: getRemediationByRecipientType(recipient),
                  contactPerson: getContactPerson(country),
                  dateGenerated: currentDate,
                  versionDate: currentDate,
                  informationCategory: category,
                  dataSubjectType: subjectType,
                  recipientType: recipient,
                  riskLevel: transferStatus === 'prohibited' ? 'High' :
                            transferStatus === 'restricted' ? 'Medium' : 'Low',
                  status: 'Active'
                });
              });
            });
          });
        });
      });
    } catch (error) {
      console.error('Error generating data:', error);
    }

    console.log('Generated rows:', results.length);
    return results;
  }, [formData]);

  const filteredData = useMemo(() => {
    console.log('Filtering data with filters:', appliedFilters);
    
    if (!initialData.length) {
      console.log('No initial data to filter');
      return [];
    }

    return initialData.filter(row => {
      if (Object.values(appliedFilters).every(filters => filters.length === 0)) {
        return true;
      }

      if (appliedFilters.informationCategory.length > 0 &&
          !appliedFilters.informationCategory.includes(row.informationCategory.toLowerCase())) {
        return false;
      }

      if (appliedFilters.purposeTypes.length > 0) {
        const purposeMatch = appliedFilters.purposeTypes.some(purpose => {
          const [subject, type] = purpose.split('-');
          return row.dataSubjectType.toLowerCase().includes(subject) &&
                 row.dataSubjectType.toLowerCase().includes(type);
        });
        if (!purposeMatch) return false;
      }

      if (appliedFilters.recipientTypes.length > 0 &&
          !appliedFilters.recipientTypes.includes(row.recipientType.toLowerCase())) {
        return false;
      }

      if (appliedFilters.countryScope.length > 0) {
        const isInside = row.country === formData.countries[0];
        const matchesScope = appliedFilters.countryScope.includes(isInside ? 'inside' : 'outside');
        if (!matchesScope) return false;
      }

      return true;
    });
  }, [initialData, appliedFilters, formData.countries]);

  const handleFilterChange = (newFilters: Record<string, string[]>) => {
    console.log('Applying new filters:', newFilters);
    setAppliedFilters(newFilters);
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Exporting to PDF...');
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log('Exporting to Excel...');
  };

  console.log('Rendering table with data:', {
    initialDataLength: initialData.length,
    filteredDataLength: filteredData.length,
    formData
  });

  return (
    <TableContainer>
      <OutputHeader
        informationCategory={formData.informationCategory}
        onFilterChange={handleFilterChange}
      />
      <TableWrapper>
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
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <Tr key={row.id}>
                  <Td>{row.country}</Td>
                  <Td>{row.entityName}</Td>
                  <Td>{row.output}</Td>
                  <Td>
                    <ListContent>
                      {row.legalRequirements.map((req, i) => (
                        <ListItem key={i}>{req}</ListItem>
                      ))}
                    </ListContent>
                  </Td>
                  <Td>
                    <ListContent>
                      {row.endUserActions.map((action, i) => (
                        <ListItem key={i}>{action}</ListItem>
                      ))}
                    </ListContent>
                  </Td>
                  <Td>
                    <ListContent>
                      {row.remediation.map((rem, i) => (
                        <ListItem key={i}>{rem}</ListItem>
                      ))}
                    </ListContent>
                  </Td>
                  <Td style={{ 
                    color: row.riskLevel === 'High' ? '#ff0000' : 
                           row.riskLevel === 'Medium' ? '#ff9900' : '#4CAF50',
                    fontWeight: 500 
                  }}>
                    {row.riskLevel}
                  </Td>
                  <Td>{row.status}</Td>
                  <Td>{row.contactPerson}</Td>
                  <Td>{row.dateGenerated}</Td>
                  <Td>{row.versionDate}</Td>
                </Tr>
              ))
            ) : (
              <tr>
                <td colSpan={11}>
                  <NoDataMessage>
                    No results found for the selected filters
                  </NoDataMessage>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableWrapper>
    </TableContainer>
  );
};

export default ResultsTable; 