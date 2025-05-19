import React, { useState } from 'react';
import styled from 'styled-components';

const DetailPanel = styled.div`
  flex: 1;
  background: #fff;
  padding: 36px 44px 32px 44px;
  display: flex;
  flex-direction: column;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  margin: 24px 32px 24px 32px;
`;
const DetailTitle = styled.div`
  font-size: 1.6em;
  font-weight: 800;
  margin-bottom: 28px;
  color: #1e293b;
  letter-spacing: 0.01em;
`;
const CollapsibleSection = styled.div`
  background: #f6f8fa;
  border-radius: 12px;
  margin-bottom: 22px;
  box-shadow: 0 1px 4px rgba(30,41,59,0.04);
  overflow: hidden;
  border: 1px solid #e5e7eb;
`;
const SectionHeader = styled.div`
  padding: 20px 22px;
  cursor: pointer;
  font-weight: 700;
  background: #f1f5f9;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.13em;
  color: #334155;
  transition: background 0.18s;
  &:hover {
    background: #e0e7ef;
  }
`;
const SectionContent = styled.div`
  padding: 20px 22px;
  font-size: 1.08em;
  color: #222;
  background: #f9fafb;
`;
const OutputChip = styled.span<{ type: string }>`
  display: inline-block;
  padding: 3px 18px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1.08em;
  color: #fff;
  background: ${({ type }) =>
    type === 'OK' ? '#22c55e' :
    type === 'OKC' ? '#fbbf24' :
    type === 'NOK' ? '#ef4444' : '#64748b'};
  margin-left: 12px;
`;
const MetaSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-top: 8px;
  margin-bottom: 0;
  padding: 10px 18px 8px 18px;
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
  margin-right: 32px;
  font-size: 0.98em;
  &:not(:last-child) {
    border-right: 1px solid #e5e7eb;
    padding-right: 24px;
  }
`;
const MetaLabel = styled.div`
  color: #64748b;
  font-weight: 600;
  margin-right: 6px;
  font-size: 0.97em;
`;
const MetaValue = styled.div`
  color: #222;
  font-weight: 700;
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