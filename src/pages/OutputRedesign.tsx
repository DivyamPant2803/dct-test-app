import React, { useState } from 'react';
import styled from 'styled-components';
import CombinationsSidebar from './OutputRedesign/CombinationsSidebar';
import EntitiesSidebar from './OutputRedesign/EntitiesSidebar';
import EntityDetailPanel from './OutputRedesign/EntityDetailPanel';

const Layout = styled.div`
  display: flex;
  height: 90vh;
  background: #fafbfc;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  overflow: hidden;
`;

const OutputRedesign: React.FC = () => {
  const [selectedCombination, setSelectedCombination] = useState('comb1');
  const [selectedEntity, setSelectedEntity] = useState('entityA');

  return (
    <Layout>
      <CombinationsSidebar selectedCombination={selectedCombination} onSelect={setSelectedCombination} />
      <EntitiesSidebar selectedEntity={selectedEntity} onSelect={setSelectedEntity} />
      <EntityDetailPanel entity={selectedEntity} />
    </Layout>
  );
};

export default OutputRedesign; 