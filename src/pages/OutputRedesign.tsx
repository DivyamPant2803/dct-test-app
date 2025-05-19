import React, { useState } from 'react';
import styled from 'styled-components';
import CombinationsSidebar from './OutputRedesign/CombinationsSidebar';
import EntitiesSidebar from './OutputRedesign/EntitiesSidebar';
import EntityDetailPanel from './OutputRedesign/EntityDetailPanel';
import { useAppSelector } from '../hooks/useRedux';
import { getMockEntityDetails } from './OutputRedesign/mockEntityDetails';

const Layout = styled.div`
  display: flex;
  height: 90vh;
  background: #fafbfc;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  overflow: hidden;
`;

const OutputRedesign: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState('entityA');
  const [selectedBusinessDivision, setSelectedBusinessDivision] = useState<string | null>(null);
  const [selectedInfoCategory, setSelectedInfoCategory] = useState<string | null>(null);
  const [selectedGuidance, setSelectedGuidance] = useState<string | null>(null);
  const [selectedRecipientTypes, setSelectedRecipientTypes] = useState<string | null>(null);
  
  const selectedDataSubjectType : string | null = null;
  const selectedRecipientType : string | null = null;

  // Get entities from Redux
  const entities = useAppSelector(state => state.questionnaire.entities);

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

  // Assume you have selectedEntity, selectedInfoCategory, selectedDataSubjectType, selectedRecipientType in state
  const details = React.useMemo(() => {
    if (!selectedEntity) return {};
    return getMockEntityDetails(selectedEntity, {
      infoCategory: selectedInfoCategory || undefined,
      dataSubjectType: selectedDataSubjectType || undefined,
      recipientType: selectedRecipientType || undefined,
    });
  }, [selectedEntity, selectedInfoCategory, selectedDataSubjectType, selectedRecipientType]);

  // Compute showAzureHostingLocations
  const showAzureHostingLocations =
    selectedGuidance === 'Business Guidance' &&
    selectedInfoCategory === 'CID' &&
    selectedRecipientTypes === 'Service Provider' &&
    (selectedBusinessDivision === 'P&C' || selectedBusinessDivision === 'GWM');

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
      />
      <EntitiesSidebar selectedEntity={selectedEntity} onSelect={setSelectedEntity} entities={filteredEntities} />
      {selectedEntity && <EntityDetailPanel entity={selectedEntity} details={details} showAzureHostingLocations={showAzureHostingLocations} selectedBusinessDivision={selectedBusinessDivision} />}
    </Layout>
  );
};

export default OutputRedesign; 