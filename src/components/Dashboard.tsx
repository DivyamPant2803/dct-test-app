import React, { useState } from 'react';
import styled from 'styled-components';
import { PersonaDashboardConfig } from '../types/persona';
import { usePersona } from '../contexts/PersonaContext';

// Styled components matching the existing design language
const DashboardContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const DashboardHeader = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PersonaInfo = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  &::before {
    content: '';
    width: 4px;
    height: 40px;
    background: ${props => props.$color};
    border-radius: 2px;
  }
`;

const PersonaIcon = styled.span`
  font-size: 2rem;
`;

const PersonaDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const PersonaName = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222;
  margin: 0;
`;

const PersonaDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0.25rem 0 0 0;
`;

const DashboardActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button<{ $variant: string; $color: string }>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid ${props => {
    switch (props.$variant) {
      case 'primary': return props.$color;
      case 'escalate': return '#9C27B0';
      case 'danger': return '#F44336';
      default: return '#ccc';
    }
  }};
  background: ${props => {
    switch (props.$variant) {
      case 'primary': return props.$color;
      case 'escalate': return '#9C27B0';
      case 'danger': return '#F44336';
      default: return 'white';
    }
  }};
  color: ${props => props.$variant === 'secondary' ? '#222' : 'white'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 2rem;
  width: 100%;
  z-index: 1;
  border: 2px solid #e1e5e9;
  min-height: 60px;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: ${props => props.$active ? '#222' : 'white'};
  color: ${props => props.$active ? 'white' : '#222'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  position: relative;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: visible;
  opacity: 1;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.$active ? '#444' : '#f8f9fa'};
    transform: ${props => props.$active ? 'none' : 'translateY(-1px)'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:first-child {
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
  }
  
  &:last-child {
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
  }
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FilterLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
`;

const SelectWrapper = styled.div`
  min-width: 150px;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
  color: #222;
  
  &:focus {
    outline: none;
    border-color: #222;
  }
`;


// Import actual components
import PersonaStats from './dashboard/PersonaStats';
import EscalatedEvidenceList from './dashboard/EscalatedEvidenceList';

// Component registry for dynamic component loading
const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  // User components
  'TransfersList': () => <div>Transfers List Component</div>,
  'GuidanceContent': () => <div>Guidance Content Component</div>,
  'UserStats': PersonaStats,
  'RecentActivity': () => <div>Recent Activity Component</div>,
  
  // Admin components
  'EvidenceQueue': () => <div>Evidence Queue Component</div>,
  'MyReviews': () => <div>My Reviews Component</div>,
  'AllTransfers': () => <div>All Transfers Component</div>,
  'AIInsights': () => <div>AI Insights Component</div>,
  'AdminStats': PersonaStats,
  'AdminActivity': () => <div>Admin Activity Component</div>,
  
  // Legal components
  'EscalatedEvidence': EscalatedEvidenceList,
  'LegalReviews': () => <div>Legal Reviews Component</div>,
  'EscalationHistory': () => <div>Escalation History Component</div>,
  'LegalAnalytics': () => <div>Legal Analytics Component</div>,
  'LegalStats': PersonaStats,
  'PriorityQueue': () => <div>Priority Queue Component</div>,
  
  // Business components
  'BusinessEvidence': EscalatedEvidenceList,
  'ProcessReviews': () => <div>Process Reviews Component</div>,
  'BusinessEscalationHistory': () => <div>Escalation History Component</div>,
  'BusinessAnalytics': () => <div>Business Analytics Component</div>,
  'BusinessStats': PersonaStats,
  
  // DISO components
  'DISOEvidence': EscalatedEvidenceList,
  'SecurityReviews': () => <div>Security Reviews Component</div>,
  'RiskAssessments': () => <div>Risk Assessments Component</div>,
  'SecurityAnalytics': () => <div>Security Analytics Component</div>,
  'DISOStats': PersonaStats,
  'SecurityAlerts': () => <div>Security Alerts Component</div>,
  
  // Finance components
  'FinanceEvidence': EscalatedEvidenceList,
  'BudgetReviews': () => <div>Budget Reviews Component</div>,
  'ContractAnalysis': () => <div>Contract Analysis Component</div>,
  'FinancialAnalytics': () => <div>Financial Analytics Component</div>,
  'FinanceStats': PersonaStats,
  'BudgetMetrics': () => <div>Budget Metrics Component</div>,
  
  // Privacy components
  'PrivacyEvidence': EscalatedEvidenceList,
  'DataProtectionReviews': () => <div>Data Protection Reviews Component</div>,
  'ConsentManagement': () => <div>Consent Management Component</div>,
  'PrivacyAnalytics': () => <div>Privacy Analytics Component</div>,
  'PrivacyStats': PersonaStats,
  'PrivacyAlerts': () => <div>Privacy Alerts Component</div>,
};

const getComponent = (componentName: string) => {
  return COMPONENT_REGISTRY[componentName] || (() => <div>Component not found: {componentName}</div>);
};

interface DashboardProps {
  config: PersonaDashboardConfig;
}

const Dashboard: React.FC<DashboardProps> = ({ config }) => {
  const { currentPersona } = usePersona();
  const [activeTab, setActiveTab] = useState(config.defaultTab);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const activeTabConfig = config.tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = getComponent(activeTabConfig?.component || 'DefaultComponent');

  const handleFilterChange = (filterId: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterId]: value }));
  };

  const handleAction = (actionId: string) => {
    console.log(`Action triggered: ${actionId} for persona: ${currentPersona}`);
    // Action handling will be implemented based on specific requirements
  };

  return (
    <DashboardContainer>
      <Tabs>
        {config.tabs.map((tab) => (
          <Tab
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Tab>
        ))}
      </Tabs>

      <ContentArea>
        {/* Render sections */}
        {config.sections.map((section) => {
          const SectionComponent = getComponent(section.component);
          return (
            <Section key={section.id}>
              <SectionComponent 
                persona={currentPersona}
                escalatedTo={currentPersona === 'legal' ? 'Legal' : 
                           currentPersona === 'business' ? 'Business' :
                           currentPersona === 'diso' ? 'DISO' :
                           currentPersona === 'finance' ? 'Finance' :
                           currentPersona === 'privacy' ? 'Privacy' : undefined}
                {...section.props} 
              />
            </Section>
          );
        })}

        {/* Render active tab content */}
        <Section>
          <SectionTitle>{activeTabConfig?.label || 'Content'}</SectionTitle>
          
          {/* Render filters */}
          {config.filters.length > 0 && (
            <Filters>
              {config.filters.map((filter) => (
                <FilterGroup key={filter.id}>
                  <FilterLabel>{filter.label}</FilterLabel>
                  <SelectWrapper>
                    {filter.type === 'select' ? (
                      <Select
                        value={filters[filter.id] || ''}
                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                      >
                        {filter.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <input
                        type={filter.type === 'date-range' ? 'date' : 'text'}
                        placeholder={filter.placeholder}
                        value={filters[filter.id] || ''}
                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          minWidth: '150px'
                        }}
                      />
                    )}
                  </SelectWrapper>
                </FilterGroup>
              ))}
            </Filters>
          )}

          {/* Render active component */}
          <ActiveComponent 
            persona={currentPersona}
            escalatedTo={currentPersona === 'legal' ? 'Legal' : 
                       currentPersona === 'business' ? 'Business' :
                       currentPersona === 'diso' ? 'DISO' :
                       currentPersona === 'finance' ? 'Finance' :
                       currentPersona === 'privacy' ? 'Privacy' : undefined}
            config={config}
            filters={filters}
            onAction={handleAction}
          />
        </Section>
      </ContentArea>
    </DashboardContainer>
  );
};

export default Dashboard;
