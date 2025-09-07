import React, { useState } from 'react';
import styled from 'styled-components';
import ApprovedChannels from './ApprovedChannels';
import { FiUser, FiDownload, FiFileText } from 'react-icons/fi';
import { exportOutputToExcel, ApprovedChannelRow } from './exportOutputToExcel';

const DetailPanel = styled.div`
  flex: 1;
  background: #fff;
  padding: 32px 32px 24px 32px;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  box-shadow: none;
  margin: 24px 0 24px 0;
  overflow-y: auto;
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
const StatusChip = styled.span<{ status: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.95em;
  background: ${({ status }) =>
    status === 'Approved' ? '#d1fae5' : status === 'Approved with predefined conditions' ? '#fef3c7' : '#fee2e2'};
  color: ${({ status }) =>
    status === 'Approved' ? '#065f46' : status === 'Approved with predefined conditions' ? '#92400e' : '#991b1b'};
  font-weight: 500;
  white-space: normal;
  word-break: break-word;
  text-align: left;
`;
const ContactPersonCard = styled.div`
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 18px;
  font-size: 1.05em;
  font-weight: 500;
  color: #1e293b;
  box-shadow: none;
`;
const ContactIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 1.3em;
  color: #64748b;
`;
const ExportButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin: 0;
`;
const ExportButton = styled.button`
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.98em;
  color: #334155;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s;
  &:hover {
    background: #e0e7ef;
  }
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
    cloudHostingLocations?: string;
    accessLocations?: string;
    approvedChannels?: string;
  };
  showAzureHostingLocations?: boolean;
  selectedBusinessDivision?: string | null;
}

interface AzureHostingLocation {
  region: string;
  approvalStatus: 'Approved' | 'Approved with predefined conditions' | 'Not approved';
  conditions?: string;
}

export function getMockAzureHostingLocations(entity: string): AzureHostingLocation[] {
  return [
    {
      region: 'South East Asia (SAS) - Singapore',
      approvalStatus: 'Approved',
    },
    {
      region: 'East Asia (EAS) - Hong Kong',
      approvalStatus: 'Approved with predefined conditions',
      conditions: `Predefined conditions for ${entity} in Hong Kong: Data must be encrypted at rest and in transit. Access restricted to approved personnel only.`,
    },
    {
      region: 'Switzerland North (NCH) - Switzerland',
      approvalStatus: 'Not approved',
    },
  ];
}

interface AccessLocationRecord {
  id: string;
  country: string;
  countryCode: string;
  businessDivision: string;
  entity: string;
  exposureAllowedTo: string[];
}

const entityCountryMap: Record<string, string> = {
  'Singapore Global Wealth Management (GWM) Entity 2': 'Singapore',
  'South Korea Global Wealth Management (GWM) Entity 3': 'South Korea',
  'South Korea Global Wealth Management (GWM) Entity 4': 'South Korea',
  'United Kingdom Global Wealth Management (GWM) Entity 3': 'United Kingdom',
  // Add more mappings as needed
};

export function getMockAccessLocations(entity: string, selectedBusinessDivision: string | null): AccessLocationRecord[] {
  const country = entityCountryMap[entity] || 'Germany';
  if (selectedBusinessDivision === 'GWM') {
    return [{
      id: '1',
      country,
      countryCode: country.slice(0, 2).toUpperCase(),
      businessDivision: 'GWM',
      entity,
      exposureAllowedTo: ['France', 'United Kingdom', 'United States'],
    }];
  }
  if (selectedBusinessDivision === 'P&C') {
    return [{
      id: '2',
      country: 'Germany',
      countryCode: 'DE',
      businessDivision: 'P&C',
      entity,
      exposureAllowedTo: ['Switzerland', 'United States'],
    }];
  }
  return [];
}

const EntityDetailPanel: React.FC<EntityDetailPanelProps> = ({ entity, details = {}, showAzureHostingLocations = true, selectedBusinessDivision }) => {
  const [open, setOpen] = useState({
    legal: false,
    actions: false,
    remediation: false,
    cloudHostingLocations: false,
    accessLocations: false,
    approvedChannels: false,
  });

  const accessLocations = getMockAccessLocations(entity, selectedBusinessDivision ?? null);
  const country = accessLocations.length > 0 ? accessLocations[0].country : '--';

  const handleExportPDF = () => {
    // TODO: Implement export to PDF
    alert('Export to PDF clicked!');
  };
  const handleExportExcel = () => {
    // Prepare Output Data (single row as an array)
    const outputData = [
      {
        'Entity Name': entity,
        Output: details.output || '',
        'Legal/Business Requirements': details.legalBusinessRequirements || '',
        'End User Actions': details.endUserActions || '',
        Remediation: details.remediation || '',
        'Contact Person': details.contactPerson || '',
        'Date Generated': details.dateGenerated || '',
        'Version Date': details.versionDate || '',
        // Add more fields as needed
      }
    ];
    // Azure Cloud Hosting Locations
    const azureCloudHosting = getMockAzureHostingLocations(entity);
    // Access Locations
    const accessLocations = getMockAccessLocations(entity, selectedBusinessDivision ?? null);
    // Approved Channels (replace with real data if available)
    const approvedChannels: ApprovedChannelRow[] = [];
    exportOutputToExcel(outputData, azureCloudHosting, accessLocations, approvedChannels, entity + '_output');
  };

  const toggle = (key: keyof typeof open) => setOpen(o => ({ ...o, [key]: !o[key] }));

  return (
    <DetailPanel>
      <DetailTitle>{entity}
        <span style={{ fontWeight: 400, fontSize: '0.95em', color: '#64748b', marginLeft: 16 }}>
          {country !== '--' && <>({country})</>}
        </span>
      </DetailTitle>
      <ContactPersonCard>
        <ContactIcon><FiUser /></ContactIcon>
        <span>Contact Person: <b>{details.contactPerson || '--'}</b></span>
      </ContactPersonCard>
      <CollapsibleSection>
        <SectionHeader style={{ cursor: 'default', background: '#f1f5f9', color: '#334155', justifyContent: 'space-between' }}>
          <span>Result:</span>
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
      {showAzureHostingLocations && (
        <CollapsibleSection>
          <SectionHeader onClick={() => toggle('cloudHostingLocations')}>
            Azure Cloud Hosting Locations <span style={{ fontWeight: 400, fontSize: '0.95em', color: '#64748b' }}>{open.cloudHostingLocations ? '▲' : '▼'}</span>
          </SectionHeader>
          {open.cloudHostingLocations && (
            <SectionContent>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'none' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>Region</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>Approval Status</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>Conditions</th>
                  </tr>
                </thead>
                <tbody>
                  {getMockAzureHostingLocations(entity).map((loc, idx) => (
                    <tr key={loc.region} style={{ background: idx % 2 === 0 ? '#f8fafc' : 'transparent' }}>
                      <td style={{ padding: '10px 12px', textAlign: 'left', verticalAlign: 'top' }}>{loc.region}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'left', verticalAlign: 'top' }}>
                        <StatusChip status={loc.approvalStatus}>{loc.approvalStatus}</StatusChip>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'left', verticalAlign: 'top' }}>
                        {loc.approvalStatus === 'Approved with predefined conditions' ? (
                          <span>{loc.conditions}</span>
                        ) : (
                          <span style={{ color: '#bbb' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionContent>
          )}
        </CollapsibleSection>
      )}
      {
        showAzureHostingLocations && (
          <CollapsibleSection>
            <SectionHeader onClick={() => toggle('accessLocations')}>
              Access Locations <span style={{ fontWeight: 400, fontSize: '0.95em', color: '#64748b' }}>{open.accessLocations ? '▲' : '▼'}</span>
            </SectionHeader>
            {open.accessLocations && (
              <SectionContent style={{ textAlign: 'left' }}>
                {
                  (() => {
                    if (selectedBusinessDivision === 'GWM' || selectedBusinessDivision === 'P&C') {
                      const records = getMockAccessLocations(entity, selectedBusinessDivision);
                      const match = records[0];
                      if (match && match.exposureAllowedTo.length > 0) {
                        return match.exposureAllowedTo.join(', ');
                      } else {
                        return <span style={{ color: '#bbb' }}>—</span>;
                      }
                    } else {
                      return <span style={{ color: '#bbb' }}>—</span>;
                    }
                  })()
                }
              </SectionContent>
            )}
          </CollapsibleSection>
        )
      }
      <CollapsibleSection>
        <SectionHeader onClick={() => toggle('approvedChannels')}
         style={{ cursor: 'default', justifyContent: 'space-between' }}>
          Approved Channels <span style={{ fontWeight: 400, fontSize: '0.95em', color: '#64748b' }}>{open.approvedChannels ? '▲' : '▼'}</span>
        </SectionHeader>
        {open.approvedChannels && (
          <SectionContent>
            <ApprovedChannels />
          </SectionContent>
        )}
      </CollapsibleSection>
      <MetaSection>
        <ExportButtonGroup>
          <ExportButton onClick={handleExportPDF} title="Export to PDF">
            <FiFileText /> PDF
          </ExportButton>
          <ExportButton onClick={handleExportExcel} title="Export to Excel">
            <FiDownload /> Excel
          </ExportButton>
        </ExportButtonGroup>
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