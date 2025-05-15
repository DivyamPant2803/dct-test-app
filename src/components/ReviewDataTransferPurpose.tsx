import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAppDispatch } from '../hooks/useRedux';
import { setReviewDataTransferPurpose } from './Questionnaire/questionnaireSlice';

const Container = styled.div`
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

// Redesigned TabsWrapper for better UI/UX
const TabsWrapper = styled.div`
  display: flex;
  gap: 0.75rem;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 2;
`;

// Redesigned TabButton for better UI/UX
const TabButton = styled.button<{ selected: boolean }>`
  background: ${props => (props.selected ? '#fff' : 'transparent')};
  border: none;
  outline: none;
  font-size: 1.05rem;
  font-weight: 600;
  color: ${props => (props.selected ? '#111' : '#888')};
  border-radius: 16px 16px 0 0;
  box-shadow: ${props => (props.selected ? '0 2px 8px 0 rgba(0,0,0,0.07)' : 'none')};
  border-bottom: 3px solid ${props => (props.selected ? '#111' : 'transparent')};
  padding: 0.85rem 2.2rem 0.7rem 2.2rem;
  margin-bottom: -2px;
  cursor: pointer;
  transition: color 0.18s, background 0.18s, border-bottom 0.18s, box-shadow 0.18s;
  position: relative;

  &:hover {
    background: ${props => (props.selected ? '#fff' : '#f5f5f5')};
    color: #111;
  }
`;

type RecipientType = 'Entity' | 'Service Provider' | 'Third Party' | 'External Authorities';

interface Props {
  informationCategory: string[] | string;
  dataSubjectType: string[];
  recipientType: string[];
  onChange?: (selectedItems: Set<string>) => void;
}

// Helper to map dataSubjectType to display label and section type
const getTabInfo = (type: string) => {
  switch (type) {
    case 'Employee':
      return { label: 'UBS Employee', section: 'employee', fullType: 'Employee - UBS Employee' };
    case 'Candidate':
      return { label: 'UBS Candidate', section: 'employee', fullType: 'Employee - UBS Candidate' };
    case 'CS Employee':
      return { label: 'CS Employee', section: 'employee', fullType: 'Employee - CS Employee' };
    case 'Client':
      return { label: 'UBS Client', section: 'client', fullType: 'Client - UBS Client' };
    case 'Prospect':
      return { label: 'UBS Prospect', section: 'client', fullType: 'Client - UBS Prospect' };
    case 'CS Client':
      return { label: 'CS Client', section: 'client', fullType: 'Client - CS Client' };
    default:
      return { label: type, section: 'client', fullType: type };
  }
};

const ReviewDataTransferPurpose: React.FC<Props> = ({
  dataSubjectType,
  recipientType,
  onChange
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const dispatch = useAppDispatch();

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

  // Build tabs dynamically from selected dataSubjectType
  const tabInfos = dataSubjectType.map(getTabInfo);
  const [activeTab, setActiveTab] = useState<string>(tabInfos[0]?.label || '');

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
    dispatch(setReviewDataTransferPurpose(Array.from(allItems)));
  }, [dataSubjectType, recipientType, dispatch]);

  useEffect(() => {
    // If the available tabs change, update the active tab if needed
    if (!tabInfos.find(tab => tab.label === activeTab) && tabInfos.length > 0) {
      setActiveTab(tabInfos[0].label);
    }
  }, [tabInfos, activeTab]);

  const handleToggle = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      onChange?.(newSet);
      dispatch(setReviewDataTransferPurpose(Array.from(newSet)));
      return newSet;
    });
  };

  const renderChips = (items: string[], prefix: string) => (
    <ChipsContainer>
      {items.map(item => (
        <Chip
          key={`${prefix}-${item}`}
          selected={selectedItems.has(`${prefix}-${item}`)}
          onClick={(e) => handleToggle(`${prefix}-${item}`, e)}
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

  // Render a single section based on tab info
  const renderTabSection = (tab: { label: string; section: string; fullType: string }) => {
    if (tab.section === 'employee') {
      return renderEmployeeSection(tab.fullType);
    } else {
      return renderClientSection(tab.fullType);
    }
  };

  return (
    <Container>
      <TabsWrapper>
        {tabInfos.map(tab => (
          <TabButton
            type="button"
            key={tab.label}
            selected={activeTab === tab.label}
            onClick={() => setActiveTab(tab.label)}
            data-testid={`tab-${tab.label}`}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabsWrapper>
      {tabInfos.filter(tab => tab.label === activeTab).map(tab => (
        <React.Fragment key={tab.label}>{renderTabSection(tab)}</React.Fragment>
      ))}
    </Container>
  );
};

export default ReviewDataTransferPurpose;