import React, { useState } from 'react';
import styled from 'styled-components';

const DetailPanel = styled.div`
  flex: 1;
  background: #fff;
  padding: 32px 32px 24px 32px;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  box-shadow: none;
  margin: 24px 0 24px 0;
`;
const DetailTitle = styled.div`
  font-size: 1.25em;
  font-weight: 700;
  margin-bottom: 18px;
  color: #1e293b;
  letter-spacing: 0.01em;
`;
const CollapsibleSection = styled.div`
  background: none;
  border-radius: 0;
  margin-bottom: 16px;
  box-shadow: none;
  border-bottom: 1px solid #e5e7eb;
  overflow: visible;
`;
const SectionHeader = styled.div`
  padding: 14px 0 10px 0;
  cursor: pointer;
  font-weight: 600;
  background: none;
  border-bottom: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1em;
  color: #334155;
  transition: background 0.18s;
  &:hover {
    background: #f6f8fa;
  }
`;
const SectionContent = styled.div`
  padding: 10px 0 16px 0;
  font-size: 0.98em;
  color: #222;
  background: none;
`;
const OutputChip = styled.span<{ type: string }>`
  display: inline-block;
  padding: 2px 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.98em;
  color: #fff;
  background: ${({ type }) =>
    type === 'OK' ? '#22c55e' :
    type === 'OKC' ? '#fbbf24' :
    type === 'NOK' ? '#ef4444' : '#64748b'};
  margin-left: 8px;
`;
const MetaSection = styled.div`
  background: none;
  border: none;
  border-radius: 0;
  margin-top: 8px;
  margin-bottom: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 0;
  justify-content: space-between;
`;
const MetaSpacer = styled.div`
  flex: 1 1 auto;
`;
const MetaItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 24px;
  font-size: 0.95em;
  &:not(:last-child) {
    border-right: 1px solid #e5e7eb;
    padding-right: 18px;
  }
`;
const MetaLabel = styled.div`
  color: #64748b;
  font-weight: 500;
  margin-right: 4px;
  font-size: 0.95em;
`;
const MetaValue = styled.div`
  color: #222;
  font-weight: 600;
  font-size: 1em;
`;

interface EntityDetailPanelProps {
  entity: string;
  details: {
    output?: string;
    legalBusinessRequirements?: string;
    endUserActions?: string;
    remediation?: string;
    contactPerson?: string;
    dateGenerated?: string;
    versionDate?: string;
  };
}

const EntityDetailPanel: React.FC<EntityDetailPanelProps> = ({ entity, details = {} }) => {
  const [open, setOpen] = useState({
    legal: false,
    actions: false,
    remediation: false,
  });

  const toggle = (key: keyof typeof open) => setOpen(o => ({ ...o, [key]: !o[key] }));

  return (
    <DetailPanel>
      <DetailTitle>{entity}</DetailTitle>
      <CollapsibleSection>
        <SectionHeader style={{ cursor: 'default', background: '#f1f5f9', color: '#334155', justifyContent: 'space-between' }}>
          <span>Output:</span>
          <OutputChip type={details.output || ''}>{details.output || '--'}</OutputChip>
        </SectionHeader>
      </CollapsibleSection>
      <CollapsibleSection>
        <SectionHeader onClick={() => toggle('legal')}>
          Legal/Business Requirements <span style={{ fontWeight: 400, fontSize: '0.95em', color: '#64748b' }}>{open.legal ? '▲' : '▼'}</span>
        </SectionHeader>
        {open.legal && <SectionContent>{details.legalBusinessRequirements || '--'}</SectionContent>}
      </CollapsibleSection>
      <CollapsibleSection>
        <SectionHeader onClick={() => toggle('actions')}>
          End User Actions <span style={{ fontWeight: 400, fontSize: '0.95em', color: '#64748b' }}>{open.actions ? '▲' : '▼'}</span>
        </SectionHeader>
        {open.actions && <SectionContent>{details.endUserActions || '--'}</SectionContent>}
      </CollapsibleSection>
      <CollapsibleSection>
        <SectionHeader onClick={() => toggle('remediation')}>
          Remediation <span style={{ fontWeight: 400, fontSize: '0.95em', color: '#64748b' }}>{open.remediation ? '▲' : '▼'}</span>
        </SectionHeader>
        {open.remediation && <SectionContent>{details.remediation || '--'}</SectionContent>}
      </CollapsibleSection>
      <MetaSection>
        <MetaItem>
          <MetaLabel>Contact Person</MetaLabel>
          <MetaValue>{details.contactPerson || '--'}</MetaValue>
        </MetaItem>
        <MetaSpacer />
        <MetaItem>
          <MetaLabel>Date Generated</MetaLabel>
          <MetaValue>{details.dateGenerated || '--'}</MetaValue>
        </MetaItem>
        <MetaItem>
          <MetaLabel>Version Date</MetaLabel>
          <MetaValue>{details.versionDate || '--'}</MetaValue>
        </MetaItem>
      </MetaSection>
    </DetailPanel>
  );
};

export default EntityDetailPanel; 