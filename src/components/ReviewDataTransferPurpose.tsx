import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setReviewDataTransferPurpose } from './Questionnaire/questionnaireSlice';
import {
  INFO_CATEGORY_CID,
  INFO_CATEGORY_ED,
  DATA_SUBJECT_TYPES_CLIENT,
  DATA_SUBJECT_TYPES_EMPLOYEE,
  SCOPE_PERSONAL_DATA,
  SCOPE_SENSITIVE_PERSONAL_DATA,
  SCOPE_CRIMINAL_DATA,
  DATA_SUBJECT_TYPE_EMPLOYEE,
  DATA_SUBJECT_TYPE_CS_CLIENT,
  DATA_SUBJECT_TYPE_U_EMPLOYEE,
  DATA_SUBJECT_TYPE_U_CANDIDATE,
  DATA_SUBJECT_TYPE_CS_EMPLOYEE,
  DATA_SUBJECT_TYPE_U_CLIENT,
  DATA_SUBJECT_TYPE_PROSPECT,
  DATA_SUBJECT_TYPE_CLIENT,
  DATA_SUBJECT_TYPE_CANDIDATE
} from '../constants';

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
    case DATA_SUBJECT_TYPE_EMPLOYEE:
      return { label: DATA_SUBJECT_TYPE_U_EMPLOYEE, section: INFO_CATEGORY_ED, fullType: 'ED - Employee' };
    case DATA_SUBJECT_TYPE_CANDIDATE:
      return { label: DATA_SUBJECT_TYPE_U_CANDIDATE, section: INFO_CATEGORY_ED, fullType: 'ED - Candidate' };
    case DATA_SUBJECT_TYPE_CS_EMPLOYEE:
      return { label: DATA_SUBJECT_TYPE_CS_EMPLOYEE, section: INFO_CATEGORY_ED, fullType: 'ED - CS Employee' };
    case DATA_SUBJECT_TYPE_CLIENT:
      return { label: DATA_SUBJECT_TYPE_U_CLIENT, section: INFO_CATEGORY_CID, fullType: 'CID - Client' };
    case DATA_SUBJECT_TYPE_PROSPECT:
      return { label: DATA_SUBJECT_TYPE_PROSPECT, section: INFO_CATEGORY_CID, fullType: 'CID - Prospect' };
    case DATA_SUBJECT_TYPE_CS_CLIENT:
      return { label: DATA_SUBJECT_TYPE_CS_CLIENT, section: INFO_CATEGORY_CID, fullType: 'CID - CS Client' };
    default:
      return { label: type, section: INFO_CATEGORY_CID, fullType: type };
  }
};

const ReviewDataTransferPurpose: React.FC<Props> = ({
  dataSubjectType,
  recipientType,
  onChange,
  informationCategory
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const dispatch = useAppDispatch();
  const reviewDataTransferPurpose = useAppSelector(state => state.questionnaire.reviewDataTransferPurpose);

  const scopeData = [SCOPE_PERSONAL_DATA, SCOPE_SENSITIVE_PERSONAL_DATA, SCOPE_CRIMINAL_DATA];
  
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

  const clientDSTypes = new Set(DATA_SUBJECT_TYPES_CLIENT);
  const employeeDSTypes = new Set(DATA_SUBJECT_TYPES_EMPLOYEE);

  // Build tabs dynamically from selected dataSubjectType
  const tabInfos = dataSubjectType.map(getTabInfo);
  const [activeTab, setActiveTab] = useState<string>(tabInfos[0]?.label || '');

  // Helper to build categorizedPurpose from selectedItems
  const buildCategorizedPurpose = (selectedItemsSet: Set<string>) => {
    const infoCats = Array.isArray(informationCategory) ? informationCategory : [informationCategory];
    const categorizedPurpose: { [infoCat: string]: { [dsType: string]: { [recipientType: string]: string[] } } } = {};
    infoCats.forEach(infoCat => {
      categorizedPurpose[infoCat] = {};
      let allowedDSTypes: Set<string>;
      if (infoCat === INFO_CATEGORY_CID) {
        allowedDSTypes = clientDSTypes;
      } else if (infoCat === INFO_CATEGORY_ED) {
        allowedDSTypes = employeeDSTypes;
      } else {
        allowedDSTypes = new Set();
      }
      dataSubjectType.forEach(dsType => {
        if (allowedDSTypes.has(dsType)) {
          categorizedPurpose[infoCat][dsType] = {};
          // Include 'Scope' as a recipient type
          const allRecipientTypes = [...recipientType, 'Scope'];
          allRecipientTypes.forEach(recType => {
            const relevant = Array.from(selectedItemsSet)
              .filter(item => {
                // Split the item to extract the exact infoCat, dsType, and recType
                // Example: "CID - CS Client-Entity-Facilitation of Outsourcing/Nearshoring/Offshoring"
                const [itemInfoCat, itemDsType, itemRecipient] = item.split('-').map(s => s.trim());
                return (
                  itemInfoCat === infoCat &&
                  itemDsType === dsType &&
                  itemRecipient === recType
                );
              })
              .map(item => {
                const parts = item.split('-');
                return parts[parts.length - 1].trim();
              });
            categorizedPurpose[infoCat][dsType][recType] = relevant;
          });
        }
      });
    });
    console.log("ReviewDataTransferPurpose: categorizedPurpose: "+JSON.stringify(categorizedPurpose));
    return categorizedPurpose;
  };

  // Initialize selectedItems only once on mount
  useEffect(() => {
    const allItems = new Set<string>();

    // Add all possible items to the set
    dataSubjectType.forEach(type => {
      // Determine infoCat for this type
      let infoCat;
      if (type === DATA_SUBJECT_TYPE_CS_EMPLOYEE || type === DATA_SUBJECT_TYPE_U_EMPLOYEE || type === 'Candidate') {
        infoCat = 'ED';
      } else {
        infoCat = 'CID';
      }

      if (type === 'Employee' || type === 'Candidate' || type === DATA_SUBJECT_TYPE_CS_EMPLOYEE) {
        scopeData.forEach(item => {
          allItems.add(`${infoCat}-${type}-Scope-${item}`);
        });
      }

      recipientType.forEach(recipient => {
        const purposes = (type === 'Employee' || type === 'Candidate' || type === DATA_SUBJECT_TYPE_CS_EMPLOYEE)
          ? employeePurposes[recipient as RecipientType] || []
          : clientPurposes[recipient as RecipientType] || [];
        purposes.forEach(purpose => {
          allItems.add(`${infoCat}-${type}-${recipient}-${purpose}`);
        });
      });
    });

    setSelectedItems(allItems);
    const categorizedPurpose = buildCategorizedPurpose(allItems);
    dispatch(setReviewDataTransferPurpose(categorizedPurpose));
    // eslint-disable-next-line
  }, []); // Only run on mount

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
      return newSet;
    });
  };

  // Dispatch categorizedPurpose whenever selectedItems changes
  useEffect(() => {
    const categorizedPurpose = buildCategorizedPurpose(selectedItems);
    dispatch(setReviewDataTransferPurpose(categorizedPurpose));
    // eslint-disable-next-line
  }, [selectedItems]);

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

  const renderEmployeeSection = (type: string) => {
    // Determine infoCat for this type
    let infoCat;
    if (type === DATA_SUBJECT_TYPE_CS_EMPLOYEE || type === DATA_SUBJECT_TYPE_U_EMPLOYEE || type === 'Candidate') {
      infoCat = 'ED';
    } else {
      infoCat = 'CID';
    }
    return (
      <CategoryContainer>
        <CategoryHeader>
          <CategoryTitle>{type}</CategoryTitle>
        </CategoryHeader>
        <TableContainer>
          <Table>
            <tbody>
              <TableRow>
                <TableCell>Scope of Data</TableCell>
                <TableCell>
                  {renderChips(
                    (reviewDataTransferPurpose[infoCat] &&
                      reviewDataTransferPurpose[infoCat][type] &&
                      reviewDataTransferPurpose[infoCat][type]['Scope']) || [],
                    `${infoCat}-${type}-Scope`
                  )}
                </TableCell>
              </TableRow>
              {recipientType.map(recipient => (
                <TableRow key={recipient}>
                  <TableCell>{recipient}</TableCell>
                  <TableCell>
                    {renderChips(
                      (reviewDataTransferPurpose[infoCat] &&
                        reviewDataTransferPurpose[infoCat][type] &&
                        reviewDataTransferPurpose[infoCat][type][recipient]) || [],
                      `${infoCat}-${type}-${recipient}`
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </CategoryContainer>
    );
  };

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
                  {renderChips(clientPurposes[recipient as RecipientType] || [], `CID-${type}-${recipient}`)}
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
    if (tab.section === INFO_CATEGORY_ED) {
      return renderEmployeeSection(tab.label);
    } else {
      return renderClientSection(tab.label);
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