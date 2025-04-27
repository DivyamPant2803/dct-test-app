import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 1rem;
  max-width: 100%;
  height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 4px;
  }
`;

const CategoryContainer = styled.div`
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  margin-bottom: 1rem;
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryHeader = styled.div`
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
`;

const CategoryTitle = styled.h2`
  font-size: 1.1rem;
  color: #333;
  margin: 0;
  font-weight: 500;
`;

const TableContainer = styled.div`
  padding: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableRow = styled.tr`
  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem;
  vertical-align: top;

  &:first-child {
    width: 180px;
    color: #666;
    font-weight: 500;
    white-space: nowrap;
  }
`;

const ChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: -0.2rem;
`;

const Chip = styled.div<{ selected: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  background: ${props => props.selected ? '#f8f9fa' : 'white'};
  border: 1px solid ${props => props.selected ? '#333' : '#e0e0e0'};
  border-radius: 14px;
  font-size: 0.8125rem;
  color: ${props => props.selected ? '#000' : '#666'};
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  margin: 0.2rem;

  &:hover {
    border-color: #333;
    background: ${props => props.selected ? '#f8f9fa' : '#fff'};
  }
`;

type RecipientType = 'Entity' | 'Service Provider' | 'Third Party' | 'External Authorities';

interface Props {
  informationCategory: string[] | string;
  dataSubjectType: string[];
  recipientType: string[];
  onChange?: (selectedItems: Set<string>) => void;
}

const ReviewDataTransferPurpose: React.FC<Props> = ({
  informationCategory,
  dataSubjectType,
  recipientType,
  onChange
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const scopeData = ['Personal Data', 'Sensitive Personal Data', 'Criminal Data'];
  
  const employeePurposes = {
    'Entity': ['Facilitation of Outsourcing/Nearshoring/Offshoring', 'Administration of Employment Contract', 'Monitoring'],
    'Service Provider': ['Facilitation of Outsourcing/Nearshoring/Offshoring', 'Ad-Hoc Provision of Services'],
    'Third Party': ['Compliance with Legal or Regulatory Obligations', 'Other Purposes'],
    'External Authorities': ['Compliance with Legal or Regulatory Obligations', 'Compliance with Voluntary Disclosure']
  };

  const clientPurposes = {
    'Entity': ['Facilitation of Outsourcing/Nearshoring/Offshoring', 'Client Relationship Management', 'KYC/AML'],
    'Service Provider': ['Facilitation of Outsourcing/Nearshoring/Offshoring', 'Ad-Hoc Provision of Services'],
    'Third Party': ['Compliance with Legal or Regulatory Obligations', 'Other Purposes'],
    'External Authorities': ['Compliance with Legal or Regulatory Obligations', 'Compliance with Voluntary Disclosure']
  };

  useEffect(() => {
    const allItems = new Set<string>();

    // Add all possible items to the set
    dataSubjectType.forEach(type => {
      const prefix = type.includes('Employee') || type === 'Candidate' ? 'Employee - ' : 'Client - ';
      const suffix = type === 'Employee' ? 'UBS Employee' :
                    type === 'Candidate' ? 'UBS Candidate' :
                    type === 'CS Employee' ? 'CS Employee' :
                    type === 'Client' ? 'UBS Client' :
                    type === 'Prospect' ? 'UBS Prospect' : 'CS Client';
      const fullType = `${prefix}${suffix}`;

      if (type === 'Employee' || type === 'Candidate' || type === 'CS Employee') {
        scopeData.forEach(item => {
          allItems.add(`${fullType}-scope-${item}`);
        });
      }

      recipientType.forEach(recipient => {
        const purposes = (type === 'Employee' || type === 'Candidate' || type === 'CS Employee')
          ? employeePurposes[recipient as RecipientType] || []
          : clientPurposes[recipient as RecipientType] || [];
        
        purposes.forEach(purpose => {
          allItems.add(`${fullType}-${recipient}-${purpose}`);
        });
      });
    });

    setSelectedItems(allItems);
  }, [dataSubjectType, recipientType]);

  const handleToggle = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      onChange?.(newSet);
      return newSet;
    });
  };

  const renderChips = (items: string[], prefix: string) => (
    <ChipsContainer>
      {items.map(item => (
        <Chip
          key={`${prefix}-${item}`}
          selected={selectedItems.has(`${prefix}-${item}`)}
          onClick={() => handleToggle(`${prefix}-${item}`)}
        >
          {item}
        </Chip>
      ))}
    </ChipsContainer>
  );

  const renderEmployeeSection = (type: string) => (
    <CategoryContainer>
      <CategoryHeader>
        <CategoryTitle>{type}</CategoryTitle>
      </CategoryHeader>
      <TableContainer>
        <Table>
          <tbody>
            <TableRow>
              <TableCell>Scope of Data</TableCell>
              <TableCell>{renderChips(scopeData, `${type}-scope`)}</TableCell>
            </TableRow>
            {recipientType.map(recipient => (
              <TableRow key={recipient}>
                <TableCell>{recipient}</TableCell>
                <TableCell>
                  {renderChips(employeePurposes[recipient as RecipientType] || [], `${type}-${recipient}`)}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </CategoryContainer>
  );

  const renderClientSection = (type: string) => (
    <CategoryContainer>
      <CategoryHeader>
        <CategoryTitle>{type}</CategoryTitle>
      </CategoryHeader>
      <TableContainer>
        <Table>
          <tbody>
            {recipientType.map(recipient => (
              <TableRow key={recipient}>
                <TableCell>{recipient}</TableCell>
                <TableCell>
                  {renderChips(clientPurposes[recipient as RecipientType] || [], `${type}-${recipient}`)}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </CategoryContainer>
  );

  const renderSections = () => {
    const sections = [];
    
    // Employee sections - only render if the type is selected
    if (dataSubjectType.includes('Employee')) {
      sections.push(renderEmployeeSection('Employee - UBS Employee'));
    }
    if (dataSubjectType.includes('Candidate')) {
      sections.push(renderEmployeeSection('Employee - UBS Candidate'));
    }
    if (dataSubjectType.includes('CS Employee')) {
      sections.push(renderEmployeeSection('Employee - CS Employee'));
    }

    // Client sections - only render if the type is selected
    if (dataSubjectType.includes('Client')) {
      sections.push(renderClientSection('Client - UBS Client'));
    }
    if (dataSubjectType.includes('Prospect')) {
      sections.push(renderClientSection('Client - UBS Prospect'));
    }
    if (dataSubjectType.includes('CS Client')) {
      sections.push(renderClientSection('Client - CS Client'));
    }

    return sections;
  };

  return (
    <Container>
      {renderSections()}
    </Container>
  );
};

export default ReviewDataTransferPurpose;