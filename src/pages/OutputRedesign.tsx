import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import CombinationsSidebar from './OutputRedesign/CombinationsSidebar';
import EntitiesSidebar from './OutputRedesign/EntitiesSidebar';
import EntityDetailPanel from './OutputRedesign/EntityDetailPanel';
import OutputTable from './OutputRedesign/OutputTable';
import { useAppSelector } from '../hooks/useRedux';
import { getMockEntityDetails } from './OutputRedesign/mockEntityDetails';
import { FiList, FiGrid, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Layout = styled.div`
  display: flex;
  height: 90vh;
  background: #fafbfc;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  overflow: hidden;
  position: relative;
`;

const CollapsibleSidebar = styled.div<{ isCollapsed: boolean }>`
  position: relative;
  transition: width 0.3s ease;
  width: ${({ isCollapsed }) => isCollapsed ? '60px' : '320px'};
  min-width: ${({ isCollapsed }) => isCollapsed ? '60px' : '320px'};
  overflow: hidden;
  background: #f8f9fa;
  border-right: 1px solid #e5e5e5;
`;

const CollapseToggle = styled.button<{ isCollapsed: boolean }>`
  position: absolute;
  top: 50%;
  right: ${({ isCollapsed }) => isCollapsed ? '-12px' : '-12px'};
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  svg {
    color: #6b7280;
    transition: transform 0.2s ease;
    transform: ${({ isCollapsed }) => isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const CollapsedContent = styled.div<{ isCollapsed: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f8f9fa;
  display: ${({ isCollapsed }) => isCollapsed ? 'flex' : 'none'};
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0.75rem 0.5rem;
  z-index: 5;
  gap: 0.5rem;
`;

const CollapsedText = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  color: #6b7280;
  text-align: center;
  line-height: 1.2;
  max-width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0.25rem 0;
  border-bottom: 1px solid #e5e5e5;
  width: 100%;
  
  &:last-child {
    border-bottom: none;
  }
`;

const CollapsedLabel = styled.div`
  font-size: 0.6rem;
  font-weight: 500;
  color: #9ca3af;
  text-align: center;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ViewToggle = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  background: white;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: #f8f8f8;
    border-color: #ddd;
    color: #333;
  }
`;

const OutputRedesign: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedBusinessDivision, setSelectedBusinessDivision] = useState<string | null>(null);
  const [selectedInfoCategory, setSelectedInfoCategory] = useState<string | null>(null);
  const [selectedGuidance, setSelectedGuidance] = useState<string | null>(null);
  const [selectedRecipientTypes, setSelectedRecipientTypes] = useState<string | null>(null);
  const [selectedDataSubjectType, setSelectedDataSubjectType] = useState<string | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [selectedTransferLocation, setSelectedTransferLocation] = useState<string | null>(null);
  const [isTableView, setIsTableView] = useState(true);
  const [isCombinationsSidebarCollapsed, setIsCombinationsSidebarCollapsed] = useState(false);
  
  const selectedRecipientType : string | null = null;

  // Redux selectors
  const entities = useAppSelector(state => state.questionnaire.entities);
  const informationCategory = useAppSelector(state => state.questionnaire.informationCategory);
  const dataSubjectType = useAppSelector(state => state.questionnaire.dataSubjectType);
  const recipientType = useAppSelector(state => state.questionnaire.recipientType);
  const reviewDataTransferPurpose = useAppSelector(state => state.questionnaire.reviewDataTransferPurpose);
  const transferLocation = useAppSelector(state => state.questionnaire.transferLocation);
  const countries = useAppSelector(state => state.questionnaire.entitiesByCountry);

  // Filter entities by selected business division
  let filteredEntities: { id: string, name: string }[] = [];
  if (selectedInfoCategory === 'ED') {
    filteredEntities = (entities['Employee'] || []).map(id => ({ id, name: id }));
  } else if (selectedInfoCategory === 'CID') {
    if (selectedBusinessDivision) {
      filteredEntities = (entities[selectedBusinessDivision] || []).map(id => ({ id, name: id }));
    } else {
      filteredEntities = Object.entries(entities)
        .filter(([div]) => div !== 'Employee')
        .flatMap(([_, ids]) => ids.map(id => ({ id, name: id })));
    }
  } else {
    filteredEntities = Object.values(entities).flat().map(id => ({ id, name: id }));
  }

  // Auto-select first available options on mount or when dependencies change
  useEffect(() => {
    // 1. Guidance
    if (!selectedGuidance) {
      if (informationCategory.includes('ED')) setSelectedGuidance('Legal Guidance');
      else if (informationCategory.includes('CID')) setSelectedGuidance('Business Guidance');
    }
    // 2. Info Category
    if (!selectedInfoCategory) {
      if (selectedGuidance === 'Business Guidance') setSelectedInfoCategory('CID');
      else if (informationCategory.length > 0) setSelectedInfoCategory(informationCategory[0]);
    }
    // 3. Business Division (for CID)
    if (selectedInfoCategory === 'CID' && !selectedBusinessDivision) {
      const divisions = Object.keys(entities).filter(div => div !== 'Employee');
      if (divisions.length > 0) setSelectedBusinessDivision(divisions[0]);
    }
    // 4. Data Subject Type
    function isCategorizedDataSubjectType(val: any): val is { CID: string[]; ED: string[] } {
      return val && typeof val === 'object' && 'CID' in val && 'ED' in val;
    }
    let dataSubjectTypeChips: string[] = [];
    if (
      selectedInfoCategory &&
      isCategorizedDataSubjectType(dataSubjectType) &&
      (selectedInfoCategory === 'CID' || selectedInfoCategory === 'ED')
    ) {
      dataSubjectTypeChips = dataSubjectType[selectedInfoCategory];
    }
    if (!selectedDataSubjectType && dataSubjectTypeChips.length > 0) {
      setSelectedDataSubjectType(dataSubjectTypeChips[0]);
    }
    // 5. Recipient Types
    let recipientTypeChips: string[] = Array.isArray(recipientType) ? recipientType : [];
    if (!selectedRecipientTypes && recipientTypeChips.length > 0) {
      setSelectedRecipientTypes(recipientTypeChips[0]);
    }
    // 6. Purpose
    let purposeChips: string[] = [];
    if (
      selectedInfoCategory &&
      selectedDataSubjectType &&
      reviewDataTransferPurpose &&
      selectedRecipientTypes &&
      reviewDataTransferPurpose[selectedInfoCategory] &&
      reviewDataTransferPurpose[selectedInfoCategory][selectedDataSubjectType] &&
      reviewDataTransferPurpose[selectedInfoCategory][selectedDataSubjectType][selectedRecipientTypes]
    ) {
      purposeChips = reviewDataTransferPurpose[selectedInfoCategory][selectedDataSubjectType][selectedRecipientTypes];
    }
    if (!selectedPurpose && purposeChips.length > 0) {
      setSelectedPurpose(purposeChips[0]);
    }
    // 7. Entity
    if (filteredEntities.length > 0 && !selectedEntity) {
      setSelectedEntity(filteredEntities[0].id);
    }
    // 6. Transfer Location
    if (!selectedTransferLocation && Array.isArray(transferLocation) && transferLocation.length > 0) {
      setSelectedTransferLocation(transferLocation[0]);
    }
  }, [
    informationCategory,
    selectedGuidance,
    selectedInfoCategory,
    selectedBusinessDivision,
    dataSubjectType,
    selectedDataSubjectType,
    recipientType,
    selectedRecipientTypes,
    reviewDataTransferPurpose,
    selectedPurpose,
    filteredEntities,
    selectedEntity,
    entities,
    transferLocation,
    selectedTransferLocation
  ]);

  // Assume you have selectedEntity, selectedInfoCategory, selectedDataSubjectType, selectedRecipientType in state
  const details = React.useMemo(() => {
    if (!selectedEntity) return {};
    return getMockEntityDetails(selectedEntity, {
      infoCategory: selectedInfoCategory || undefined,
      dataSubjectType: selectedDataSubjectType || undefined,
      recipientType: selectedRecipientTypes || undefined,
    });
  }, [selectedEntity, selectedInfoCategory, selectedDataSubjectType, selectedRecipientTypes]);

  // Compute showAzureHostingLocations
  const showAzureHostingLocations =
    selectedGuidance === 'Business Guidance' &&
    selectedInfoCategory === 'CID' &&
    selectedRecipientTypes === 'Service Provider' &&
    (selectedBusinessDivision === 'P&C' || selectedBusinessDivision === 'GWM');

  // Build a map: entityId -> countryName
  const entityIdToCountry: { [entityId: string]: string } = {};
  Object.entries(countries).forEach(([countryName, entityIds]) => {
    entityIds.forEach(entityId => {
      entityIdToCountry[entityId] = countryName;
    });
  });

  const filteredEntitiesWithCountry = filteredEntities.map(entity => ({
    ...entity,
    country: [entityIdToCountry[entity.id] || "--"]
  }));

  return (
    <Layout>
      <CombinationsSidebar
        selectedBusinessDivision={selectedBusinessDivision}
        onBusinessDivisionSelect={setSelectedBusinessDivision}
        selectedInfoCategory={selectedInfoCategory}
        onInfoCategorySelect={setSelectedInfoCategory}
        selectedGuidance={selectedGuidance}
        setSelectedGuidance={setSelectedGuidance}
        selectedRecipientTypes={selectedRecipientTypes}
        setSelectedRecipientTypes={setSelectedRecipientTypes}
        selectedDataSubjectType={selectedDataSubjectType}
        setSelectedDataSubjectType={setSelectedDataSubjectType}
        selectedTransferLocation={selectedTransferLocation}
        setSelectedTransferLocation={setSelectedTransferLocation}
        selectedPurpose={selectedPurpose}
        setSelectedPurpose={setSelectedPurpose}
      />
      {isTableView ? (
        <OutputTable
          selectedBusinessDivision={selectedBusinessDivision}
          selectedInfoCategory={selectedInfoCategory}
          selectedGuidance={selectedGuidance}
          selectedRecipientTypes={selectedRecipientTypes}
          selectedDataSubjectType={selectedDataSubjectType}
          selectedPurpose={selectedPurpose}
          selectedTransferLocation={selectedTransferLocation}
          entities={filteredEntitiesWithCountry}
        />
      ) : (
        <>
          <EntitiesSidebar selectedEntity={selectedEntity} onSelect={setSelectedEntity} entities={filteredEntities} />
          {selectedEntity && <EntityDetailPanel entity={selectedEntity} details={details} showAzureHostingLocations={showAzureHostingLocations} selectedBusinessDivision={selectedBusinessDivision} />}
        </>
      )}
    </Layout>
  );
};

export default OutputRedesign; 