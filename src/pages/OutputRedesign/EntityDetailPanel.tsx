import React from 'react';
import styled from 'styled-components';

const DetailPanel = styled.div`
  flex: 1;
  background: #fff;
  padding: 32px 36px;
  display: flex;
  flex-direction: column;
`;
const DetailTitle = styled.div`
  font-size: 1.3em;
  font-weight: 700;
  margin-bottom: 18px;
`;
const DetailSection = styled.div`
  background: #fafbfc;
  border-radius: 8px;
  margin-bottom: 18px;
  padding: 18px 16px;
  font-size: 1.08em;
  font-weight: 500;
`;
const DetailSectionRow = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 12px;
`;
const DetailLabel = styled.div`
  font-size: 0.98em;
  color: #888;
  min-width: 120px;
`;
const DetailValue = styled.div`
  font-size: 1em;
  color: #222;
  min-width: 120px;
`;

const EntityDetailPanel = ({ entity }: { entity: string }) => (
  <DetailPanel>
    <DetailTitle>{entity}</DetailTitle>
    {/* TODO: Tabs or expandable cards for Output, Requirements, Actions, Remediation, etc. */}
    <DetailSection>Output</DetailSection>
    <DetailSection>Legal/Business Requirements</DetailSection>
    <DetailSection>End User Actions</DetailSection>
    <DetailSection>Remediation</DetailSection>
    <DetailSectionRow>
      <DetailLabel>Contact Person</DetailLabel>
      <DetailValue>--</DetailValue>
      <DetailLabel>Date Generated</DetailLabel>
      <DetailValue>--</DetailValue>
      <DetailLabel>Version Date</DetailLabel>
      <DetailValue>--</DetailValue>
    </DetailSectionRow>
  </DetailPanel>
);

export default EntityDetailPanel; 