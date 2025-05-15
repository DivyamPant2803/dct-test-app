import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FixedSizeGrid as Grid } from 'react-window';
import OutputFilters from './OutputFilters';

// Mock data type (should match your real data structure)
export type OutputCombination = {
  id: string;
  country: string;
  entity: string;
  type: string;
  legalOrBusiness: string;
  transferType: string;
  purpose: string;
  output: string;
  risk: string;
  status: string;
  contact: string;
  dateGenerated: string;
  versionDate: string;
  requirements: string[];
  actions: string[];
  remediation: string[];
  recipientType?: string;
};

// Example mock data
declare const combinations: OutputCombination[];

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 24px;
  padding: 16px 0;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  min-width: 320px;
  position: relative;
`;

const Badge = styled.span<{ color: string }>`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.9em;
  background: ${({ color }) => color};
  color: #fff;
  margin-left: 8px;
`;

const Section = styled.div`
  margin-top: 12px;
`;

const SectionTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  cursor: pointer;
`;

const SectionList = styled.ul`
  margin: 0 0 0 16px;
  padding: 0;
  font-size: 0.97em;
`;

const CardFooter = styled.div`
  margin-top: 18px;
  font-size: 0.93em;
  color: #666;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const EditButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.95em;
  cursor: pointer;
  &:hover {
    background: #e0e0e0;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);
  padding: 32px 28px 24px 28px;
  min-width: 340px;
  max-width: 95vw;
`;

const ModalTitle = styled.div`
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 18px;
`;

const ModalRow = styled.div`
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
`;

const ModalLabel = styled.label`
  font-size: 0.98em;
  margin-bottom: 4px;
`;

const ModalSelect = styled.select`
  padding: 6px 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 1em;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
`;

const ModalButton = styled.button`
  padding: 7px 18px;
  border-radius: 6px;
  border: 1px solid #222;
  background: #222;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  &:hover, &:focus {
    background: #444;
    outline: none;
  }
`;

const groupByEntity = (combinations: OutputCombination[]) => {
  const map: Record<string, OutputCombination> = {};
  combinations.forEach(comb => {
    // Only keep the first combination for each entity (or you can enhance to keep the most relevant)
    if (!map[comb.entity]) {
      map[comb.entity] = comb;
    }
  });
  return Object.values(map);
};

const infoCategories = ['Employee', 'Client'];
const subjectTypes = ['Current Employee', 'Client Employee', 'Other'];
const recipientTypes = ['Group Entity', 'Third Party', 'Other'];
const transferTypes = ['Inside the Country', 'Outside the Country'];
const purposes = ['Monitoring', 'Client Relationship Management', 'Asset Management'];

const OutputCards: React.FC<{
  combinations: OutputCombination[];
  filters: Record<string, string[]>;
  onFilterChange: (filters: Record<string, string[]>) => void;
}> = ({ combinations, filters, onFilterChange }) => {
  // Group by entity
  const entityCards = useMemo(() => groupByEntity(combinations), [combinations]);

  // Expand/collapse state for sections
  const [expanded, setExpanded] = useState<{ [id: string]: { req: boolean; act: boolean; rem: boolean } }>({});
  const toggle = (id: string, key: 'req' | 'act' | 'rem') => {
    setExpanded(e => ({ ...e, [id]: { ...e[id], [key]: !e[id]?.[key] } }));
  };

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<OutputCombination>>({});
  const [cards, setCards] = useState<OutputCombination[]>(entityCards);

  // When combinations change, update cards
  React.useEffect(() => {
    setCards(entityCards);
  }, [entityCards]);

  // Helper functions for real-time logic
  const getRequirementsByCategory = (category: string) => {
    switch (category) {
      case 'Employee':
        return [
          'Employment Contract Update Required',
          'Internal Privacy Policy Update',
          'Works Council Consultation',
          'Data Processing Agreement'
        ];
      case 'Client':
        return [
          'Client Data Processing Agreement',
          'Privacy Notice Update Required',
          'Explicit Consent Required',
          'Data Transfer Impact Assessment'
        ];
      default:
        return ['Data Protection Agreement Required'];
    }
  };
  const getActionsBySubjectType = (subjectType: string) => {
    switch (subjectType) {
      case 'Current Employee':
        return [
          'Update employment contracts',
          'Provide privacy notice',
          'Document transfer purpose',
          'Maintain transfer records'
        ];
      case 'Client Employee':
        return [
          'Obtain client authorization',
          'Update service agreements',
          'Document transfer basis',
          'Implement data minimization'
        ];
      default:
        return [
          'Obtain explicit consent',
          'Document transfer purpose',
          'Maintain transfer records'
        ];
    }
  };
  const getRemediationByRecipientType = (recipientType: string) => {
    switch (recipientType) {
      case 'Group Entity':
        return [
          'Implement BCRs',
          'Regular compliance audits',
          'Access controls review'
        ];
      case 'Third Party':
        return [
          'Vendor assessment',
          'Data processing agreement',
          'Regular audits',
          'Access restrictions'
        ];
      default:
        return [
          'Implement encryption',
          'Regular audits',
          'Access controls'
        ];
    }
  };
  const getTransferStatus = (country: string): 'allowed' | 'restricted' | 'prohibited' => {
    const restrictedCountries = ['China', 'Russia', 'India'];
    const prohibitedCountries = ['North Korea', 'Iran', 'Mexico'];
    if (prohibitedCountries.includes(country)) return 'prohibited';
    if (restrictedCountries.includes(country)) return 'restricted';
    return 'allowed';
  };
  const getContactPerson = (country: string) => {
    const contacts: Record<string, string> = {
      'United States': 'US Data Protection Officer',
      'United Kingdom': 'UK Data Protection Officer',
      'Germany': 'EU Data Protection Officer',
      'France': 'EU Data Protection Officer',
      'Japan': 'APAC Data Protection Officer',
      'Singapore': 'APAC Data Protection Officer',
      'Australia': 'APAC Data Protection Officer',
    };
    return contacts[country] || 'Global Data Protection Officer';
  };
  const getLegalRequirements = (category: string, transferStatus: 'allowed' | 'restricted' | 'prohibited') => {
    if (transferStatus === 'allowed') return [];
    const baseRequirements = getRequirementsByCategory(category);
    const additionalRequirements = transferStatus === 'prohibited' 
      ? ['Transfer Impact Assessment Required', 'Executive Approval Required', 'Local DPO Consultation Required']
      : ['Additional Safeguards Required', 'Risk Assessment Required'];
    return [...baseRequirements, ...additionalRequirements];
  };

  const handleEditClick = (comb: OutputCombination) => {
    setEditingId(comb.id);
    setEditValues(comb);
  };

  const handleEditChange = (field: keyof OutputCombination, value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const handleEditSave = (id: string) => {
    setCards(prev => prev.map(card =>
      card.id === id ? { ...card, ...editValues, id: card.id + '-edit' } : card
    ));
    setEditingId(null);
    setEditValues({});
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  return (
    <div>
      <OutputFilters 
        informationCategory={[]}
        filters={filters} 
        onFilterChange={onFilterChange} 
      />
      <CardGrid>
        {cards.map(comb => {
          const isEditing = editingId === comb.id;
          // Use editValues if editing, otherwise comb
          const current = isEditing ? { ...comb, ...editValues } : comb;
          // Real-time logic for output, requirements, actions, remediation
          const transferStatus = getTransferStatus(current.country);
          const output = transferStatus === 'allowed' ? 'OK' : transferStatus === 'restricted' ? 'OKC' : 'NOK';
          const risk = transferStatus === 'prohibited' ? 'High' : transferStatus === 'restricted' ? 'Medium' : 'Low';
          const requirements = getLegalRequirements(current.legalOrBusiness === 'Legal' ? 'Employee' : 'Client', transferStatus);
          const actions = getActionsBySubjectType(current.type || '');
          const remediation = getRemediationByRecipientType(current.recipientType || '');
          const contact = getContactPerson(current.country);
          return (
            <Card key={comb.id}>
              {isEditing ? (
                <EditButton style={{background:'#e0e0e0'}} onClick={handleEditCancel}>Cancel</EditButton>
              ) : (
                <EditButton onClick={() => handleEditClick(comb)}>✏️ Edit</EditButton>
              )}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: '1.1em' }}>{current.country}</span>
                <Badge color={output === 'OK' ? '#27ae60' : output === 'OKC' ? '#e67e22' : '#e74c3c'}>{output}</Badge>
                <Badge color={risk === 'Low' ? '#27ae60' : risk === 'Medium' ? '#f1c40f' : '#e74c3c'}>{risk} Risk</Badge>
              </div>
              <div style={{ fontWeight: 500 }}>{current.entity}</div>
              <div style={{ color: '#888', fontSize: '0.97em', marginBottom: 6 }}>
                {isEditing ? (
                  <>
                    <select value={current.legalOrBusiness || ''} onChange={e => handleEditChange('legalOrBusiness', e.target.value)} style={{marginRight:8}}>
                      {infoCategories.map(opt => <option key={opt} value={opt === 'Employee' ? 'Legal' : 'Business'}>{opt}</option>)}
                    </select>
                    <select value={current.type || ''} onChange={e => handleEditChange('type', e.target.value)} style={{marginRight:8}}>
                      {subjectTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <select value={current.transferType || ''} onChange={e => handleEditChange('transferType', e.target.value)} style={{marginRight:8}}>
                      {transferTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <select value={current.recipientType || ''} onChange={e => handleEditChange('recipientType', e.target.value)} style={{marginRight:8}}>
                      {recipientTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </>
                ) : (
                  <>{current.legalOrBusiness} | {current.type} | {current.transferType}</>
                )}
              </div>
              <div style={{ fontSize: '0.97em', marginBottom: 6 }}>
                Purpose: {isEditing ? (
                  <select value={current.purpose || ''} onChange={e => handleEditChange('purpose', e.target.value)}>
                    {purposes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (<b>{current.purpose}</b>)}
              </div>
              <Section>
                <SectionTitle onClick={() => toggle(comb.id, 'req')}>
                  {expanded[comb.id]?.req ? '▼' : '▶'} Legal/Business Requirements
                </SectionTitle>
                {expanded[comb.id]?.req && (
                  <SectionList>
                    {requirements.map((r, i) => <li key={i}>{r}</li>)}
                  </SectionList>
                )}
              </Section>
              <Section>
                <SectionTitle onClick={() => toggle(comb.id, 'act')}>
                  {expanded[comb.id]?.act ? '▼' : '▶'} End User Actions
                </SectionTitle>
                {expanded[comb.id]?.act && (
                  <SectionList>
                    {actions.map((a, i) => <li key={i}>{a}</li>)}
                  </SectionList>
                )}
              </Section>
              <Section>
                <SectionTitle onClick={() => toggle(comb.id, 'rem')}>
                  {expanded[comb.id]?.rem ? '▼' : '▶'} Remediation
                </SectionTitle>
                {expanded[comb.id]?.rem && (
                  <SectionList>
                    {remediation.map((r, i) => <li key={i}>{r}</li>)}
                  </SectionList>
                )}
              </Section>
              <CardFooter>
                <div>Status: <b>{current.status}</b></div>
                <div>Contact: {contact}</div>
                <div>Date: {current.dateGenerated}</div>
                <div>Version: {current.versionDate}</div>
              </CardFooter>
              {isEditing && (
                <div style={{marginTop:12, textAlign:'right'}}>
                  <ModalButton type="button" onClick={() => handleEditSave(comb.id)}>Save</ModalButton>
                </div>
              )}
            </Card>
          );
        })}
      </CardGrid>
    </div>
  );
};

export default OutputCards; 