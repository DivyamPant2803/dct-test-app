import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LegalTemplate, TemplateSelection } from '../types/index';
import { useTemplateApi } from '../hooks/useTemplateApi';
import StyledSelect from './common/StyledSelect';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  gap: 1rem;
`;

const FiltersPanel = styled.div`
  width: 30%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PreviewPanel = styled.div`
  width: 70%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
`;

const SelectWrapper = styled.div`
  width: 100%;
`;

const VersionList = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const VersionItem = styled.div<{ $selected: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${props => props.$selected ? '#222' : '#eee'};
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  background: ${props => props.$selected ? '#f0f7ff' : 'white'};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$selected ? '#e6f2ff' : '#f9f9f9'};
    border-color: ${props => props.$selected ? '#222' : '#ccc'};
  }
`;

const VersionHeader = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
`;

const VersionMeta = styled.div`
  font-size: 0.75rem;
  color: #666;
  line-height: 1.3;
`;

const TemplateHeader = styled.div`
  text-align: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 1rem;
`;

const TemplateTitle = styled.h2`
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
`;

const TemplateMeta = styled.div`
  color: #666;
  font-size: 0.8rem;
  margin-bottom: 0;
`;

const SelectionSummary = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SelectionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CounterBadge = styled.span`
  background: #222;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const SelectionControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ToggleButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background: #222;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;

  &:hover {
    background: #444;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  border: 1px solid ${props => props.$variant === 'primary' ? '#222' : '#ccc'};
  background: ${props => props.$variant === 'primary' ? '#222' : 'white'};
  color: ${props => props.$variant === 'primary' ? 'white' : '#222'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;

  &:hover {
    background: ${props => props.$variant === 'primary' ? '#444' : '#f8f8f8'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TemplateSection = styled.div`
  background: #fafafa;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
`;

const SectionTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
`;

const BasicInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0;
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
`;

const InfoLabel = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
`;

const DataSubjectCard = styled.div<{ $expanded: boolean }>`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.2s ease;
`;

const CardHeader = styled.div<{ $expanded: boolean }>`
  padding: 1rem 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.$expanded ? '#f8f9fa' : 'white'};
  transition: background 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #333;
`;

const ExpandIcon = styled.span<{ $expanded: boolean }>`
  font-size: 0.9rem;
  color: #666;
  transition: transform 0.2s ease;
  transform: ${props => props.$expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const CardContent = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
`;

const SubFieldsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
`;

const SubField = styled.div<{ $fullWidth?: boolean }>`
  grid-column: ${props => props.$fullWidth ? '1 / -1' : 'auto'};
`;

const SubFieldLabel = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
`;

const CheckboxGroup = styled.div<{ $horizontal?: boolean }>`
  display: flex;
  flex-direction: ${props => props.$horizontal ? 'row' : 'column'};
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
  padding: 0.25rem 0;
  text-align: left;
  
  &:hover {
    color: #222;
  }
`;

const Checkbox = styled.input`
  margin: 0;
  transform: scale(1.1);
`;

const CheckboxWithText = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const TextDisplay = styled.div`
  flex: 1;
  font-size: 0.9rem;
  color: #333;
  line-height: 1.5;
  text-align: left;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #333;
  background: white;
  resize: vertical;
  line-height: 1.5;
  text-align: left;
  
  &:focus {
    outline: none;
    border-color: #222;
    box-shadow: 0 0 0 2px rgba(34, 34, 34, 0.1);
  }
`;

const OutputChip = styled.span<{ type: string }>`
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.75rem;
  color: #fff;
  background: ${({ type }) =>
    type === 'OK' ? '#10b981' :
    type === 'OKC' ? '#f59e0b' :
    type === 'NOK' ? '#ef4444' : '#6b7280'};
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const UseTemplateButton = styled(Button)`
  margin-top: auto;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
`;

const LegalTemplates: React.FC = () => {
  const [jurisdictions, setJurisdictions] = useState<string[]>([]);
  const [entityNames, setEntityNames] = useState<string[]>([]);
  const [entityIds, setEntityIds] = useState<string[]>([]);
  const [templates, setTemplates] = useState<LegalTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate | null>(null);
  const [selection, setSelection] = useState<TemplateSelection>({
    recipientType: [],
    contactPerson: false,
    dataSubjectTypes: {}
  });

  const [filters, setFilters] = useState({
    jurisdiction: '',
    entityName: '',
    entityId: ''
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const { loading, fetchJurisdictions, fetchEntityNames, fetchEntityIds, fetchTemplates } = useTemplateApi();

  // Load jurisdictions on mount
  useEffect(() => {
    const loadJurisdictions = async () => {
      const data = await fetchJurisdictions();
      setJurisdictions(data);
    };
    loadJurisdictions();
  }, [fetchJurisdictions]);

  // Load entity names when jurisdiction changes
  useEffect(() => {
    const loadEntityNames = async () => {
      if (filters.jurisdiction) {
        const data = await fetchEntityNames(filters.jurisdiction);
        setEntityNames(data);
      } else {
        setEntityNames([]);
      }
      // Reset dependent filters
      setFilters(prev => ({ ...prev, entityName: '', entityId: '' }));
      setEntityIds([]);
      setTemplates([]);
      setSelectedTemplate(null);
    };
    loadEntityNames();
  }, [filters.jurisdiction, fetchEntityNames]);

  // Load entity IDs when entity name changes
  useEffect(() => {
    const loadEntityIds = async () => {
      if (filters.jurisdiction && filters.entityName) {
        const data = await fetchEntityIds(filters.jurisdiction, filters.entityName);
        setEntityIds(data);
      } else {
        setEntityIds([]);
      }
      // Reset dependent filters
      setFilters(prev => ({ ...prev, entityId: '' }));
      setTemplates([]);
      setSelectedTemplate(null);
    };
    loadEntityIds();
  }, [filters.jurisdiction, filters.entityName, fetchEntityIds]);

  // Load templates when entity ID changes
  useEffect(() => {
    const loadTemplates = async () => {
      if (filters.jurisdiction && filters.entityName && filters.entityId) {
        const data = await fetchTemplates({
          jurisdiction: filters.jurisdiction,
          entityName: filters.entityName,
          entityId: filters.entityId
        });
        setTemplates(data);
      } else {
        setTemplates([]);
      }
      setSelectedTemplate(null);
    };
    loadTemplates();
  }, [filters.jurisdiction, filters.entityName, filters.entityId, fetchTemplates]);

  // Initialize expanded sections when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      const initialExpanded: Record<string, boolean> = {};
      selectedTemplate.dataSubjectTypes.forEach(dst => {
        initialExpanded[dst.type] = false; // All sections collapsed by default
      });
      setExpandedSections(initialExpanded);

      // Initialize selection state
      const initialSelection: TemplateSelection = {
        recipientType: [],
        contactPerson: false,
        dataSubjectTypes: {}
      };

      selectedTemplate.dataSubjectTypes.forEach(dst => {
        initialSelection.dataSubjectTypes[dst.type] = {
          selected: false,
          transferLocation: [],
          categoryOfData: [],
          purpose: [],
          output: [],
          conditions: false,
          remediations: false
        };
      });

      setSelection(initialSelection);
    }
  }, [selectedTemplate]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (template: LegalTemplate) => {
    setSelectedTemplate(template);
  };

  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleRecipientTypeChange = (value: string, checked: boolean) => {
    setSelection(prev => ({
      ...prev,
      recipientType: checked 
        ? [...prev.recipientType, value]
        : prev.recipientType.filter(rt => rt !== value)
    }));
  };

  const handleContactPersonChange = (checked: boolean) => {
    setSelection(prev => ({
      ...prev,
      contactPerson: checked
    }));
  };

  const handleDataSubjectTypeChange = (type: string, checked: boolean) => {
    if (!selectedTemplate) return;

    const dataSubjectType = selectedTemplate.dataSubjectTypes.find(dst => dst.type === type);
    if (!dataSubjectType) return;

    setSelection(prev => ({
      ...prev,
      dataSubjectTypes: {
        ...prev.dataSubjectTypes,
        [type]: {
          selected: checked,
          transferLocation: checked ? [...dataSubjectType.transferLocation] : [],
          categoryOfData: checked ? [...dataSubjectType.categoryOfData] : [],
          purpose: checked ? [...dataSubjectType.purpose] : [],
          output: checked ? [...dataSubjectType.output] : [],
          conditions: checked,
          remediations: checked
        }
      }
    }));
  };

  const handleSubFieldChange = (type: string, field: string, value: string, checked: boolean) => {
    if (!selectedTemplate) return;

    const dataSubjectType = selectedTemplate.dataSubjectTypes.find(dst => dst.type === type);
    if (!dataSubjectType) return;

    setSelection(prev => {
      const currentDataSubject = prev.dataSubjectTypes[type];
      if (!currentDataSubject) return prev;

      const currentArray = currentDataSubject[field as keyof typeof currentDataSubject] as string[];
      const newArray = checked 
        ? [...currentArray, value]
        : currentArray.filter(v => v !== value);

      // Check if all sub-fields are selected to determine parent checkbox state
      const allTransferLocationSelected = field === 'transferLocation' 
        ? newArray.length === dataSubjectType.transferLocation.length
        : currentDataSubject.transferLocation.length === dataSubjectType.transferLocation.length;
      
      const allCategoryOfDataSelected = field === 'categoryOfData'
        ? newArray.length === dataSubjectType.categoryOfData.length
        : currentDataSubject.categoryOfData.length === dataSubjectType.categoryOfData.length;
      
      const allPurposeSelected = field === 'purpose'
        ? newArray.length === dataSubjectType.purpose.length
        : currentDataSubject.purpose.length === dataSubjectType.purpose.length;
      
      const allOutputSelected = field === 'output'
        ? newArray.length === dataSubjectType.output.length
        : currentDataSubject.output.length === dataSubjectType.output.length;

      const allConditionsSelected = field === 'conditions' ? checked : currentDataSubject.conditions;
      const allRemediationsSelected = field === 'remediations' ? checked : currentDataSubject.remediations;

      const allSelected = allTransferLocationSelected && allCategoryOfDataSelected && 
                          allPurposeSelected && allOutputSelected && 
                          allConditionsSelected && allRemediationsSelected;

      return {
        ...prev,
        dataSubjectTypes: {
          ...prev.dataSubjectTypes,
          [type]: {
            ...currentDataSubject,
            selected: allSelected,
            [field]: newArray
          }
        }
      };
    });
  };

  const handleTextFieldChange = (type: string, field: string, checked: boolean) => {
    if (!selectedTemplate) return;

    const dataSubjectType = selectedTemplate.dataSubjectTypes.find(dst => dst.type === type);
    if (!dataSubjectType) return;

    setSelection(prev => {
      const currentDataSubject = prev.dataSubjectTypes[type];
      if (!currentDataSubject) return prev;

      // Check if all sub-fields are selected to determine parent checkbox state
      const allTransferLocationSelected = currentDataSubject.transferLocation.length === dataSubjectType.transferLocation.length;
      const allCategoryOfDataSelected = currentDataSubject.categoryOfData.length === dataSubjectType.categoryOfData.length;
      const allPurposeSelected = currentDataSubject.purpose.length === dataSubjectType.purpose.length;
      const allOutputSelected = currentDataSubject.output.length === dataSubjectType.output.length;
      
      const allConditionsSelected = field === 'conditions' ? checked : currentDataSubject.conditions;
      const allRemediationsSelected = field === 'remediations' ? checked : currentDataSubject.remediations;

      const allSelected = allTransferLocationSelected && allCategoryOfDataSelected && 
                          allPurposeSelected && allOutputSelected && 
                          allConditionsSelected && allRemediationsSelected;

      return {
        ...prev,
        dataSubjectTypes: {
          ...prev.dataSubjectTypes,
          [type]: {
            ...currentDataSubject,
            selected: allSelected,
            [field]: checked
          }
        }
      };
    });
  };

  const handleToggleSelectAll = () => {
    if (!selectedTemplate) return;

    const totalFieldCount = getTotalFieldCount();
    const currentSelectedCount = getTotalSelectedCount();
    
    // If more than half are selected, deselect all; otherwise select all
    const shouldSelectAll = currentSelectedCount < totalFieldCount / 2;

    if (shouldSelectAll) {
      const newSelection: TemplateSelection = {
        recipientType: [...selectedTemplate.recipientType],
        contactPerson: true,
        dataSubjectTypes: {}
      };

      selectedTemplate.dataSubjectTypes.forEach(dst => {
        newSelection.dataSubjectTypes[dst.type] = {
          selected: true,
          transferLocation: [...dst.transferLocation],
          categoryOfData: [...dst.categoryOfData],
          purpose: [...dst.purpose],
          output: [...dst.output],
          conditions: true,
          remediations: true
        };
      });

      setSelection(newSelection);
    } else {
      const newSelection: TemplateSelection = {
        recipientType: [],
        contactPerson: false,
        dataSubjectTypes: {}
      };

      selectedTemplate.dataSubjectTypes.forEach(dst => {
        newSelection.dataSubjectTypes[dst.type] = {
          selected: false,
          transferLocation: [],
          categoryOfData: [],
          purpose: [],
          output: [],
          conditions: false,
          remediations: false
        };
      });

      setSelection(newSelection);
    }
  };

  const getTotalSelectedCount = () => {
    let count = 0;
    count += selection.recipientType.length;
    if (selection.contactPerson) count += 1;
    
    Object.values(selection.dataSubjectTypes).forEach(dst => {
      if (dst.selected) count += 1;
      count += dst.transferLocation.length;
      count += dst.categoryOfData.length;
      count += dst.purpose.length;
      count += dst.output.length;
      if (dst.conditions) count += 1;
      if (dst.remediations) count += 1;
    });

    return count;
  };

  const getTotalFieldCount = () => {
    if (!selectedTemplate) return 0;
    
    let count = 0;
    count += selectedTemplate.recipientType.length;
    count += 1; // contact person
    
    selectedTemplate.dataSubjectTypes.forEach(dst => {
      count += 1; // data subject type itself
      count += dst.transferLocation.length;
      count += dst.categoryOfData.length;
      count += dst.purpose.length;
      count += dst.output.length;
      count += 2; // conditions and remediations
    });

    return count;
  };

  const handleUseTemplate = () => {
    console.log('Using template with selection:', selection);
    alert(`Template applied with ${getTotalSelectedCount()} selected fields!`);
  };

  return (
    <Container>
      <FiltersPanel>
        <FilterGroup>
          <FilterLabel>Jurisdiction</FilterLabel>
          <SelectWrapper>
            <StyledSelect
              value={filters.jurisdiction}
              onChange={(value) => handleFilterChange('jurisdiction', value)}
              options={[
                { value: '', label: 'Select Jurisdiction' },
                ...jurisdictions.map(j => ({ value: j, label: j }))
              ]}
              placeholder="Select Jurisdiction"
            />
          </SelectWrapper>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Entity Name</FilterLabel>
          <SelectWrapper>
            <StyledSelect
              value={filters.entityName}
              onChange={(value) => handleFilterChange('entityName', value)}
              options={[
                { value: '', label: 'Select Entity Name' },
                ...entityNames.map(e => ({ value: e, label: e }))
              ]}
              placeholder="Select Entity Name"
              disabled={!filters.jurisdiction}
            />
          </SelectWrapper>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Entity ID</FilterLabel>
          <SelectWrapper>
            <StyledSelect
              value={filters.entityId}
              onChange={(value) => handleFilterChange('entityId', value)}
              options={[
                { value: '', label: 'Select Entity ID' },
                ...entityIds.map(e => ({ value: e, label: e }))
              ]}
              placeholder="Select Entity ID"
              disabled={!filters.entityName}
            />
          </SelectWrapper>
        </FilterGroup>

        <VersionList>
          {loading ? (
            <LoadingMessage>Loading templates...</LoadingMessage>
          ) : templates.length > 0 ? (
            templates.map(template => (
              <VersionItem
                key={template.id}
                $selected={selectedTemplate?.id === template.id}
                onClick={() => handleTemplateSelect(template)}
              >
                <VersionHeader>Version {template.version}</VersionHeader>
                <VersionMeta>
                  Ingested: {new Date(template.ingestedAt).toLocaleDateString()}<br />
                  By: {template.ingestedBy}
                </VersionMeta>
              </VersionItem>
            ))
          ) : (
            <NoDataMessage>
              {filters.entityId ? 'No templates found' : 'Select filters to view templates'}
            </NoDataMessage>
          )}
        </VersionList>
      </FiltersPanel>

      <PreviewPanel>
        {selectedTemplate ? (
          <>
            <TemplateHeader>
              <TemplateTitle>
                {selectedTemplate.entityName} - {selectedTemplate.version}
              </TemplateTitle>
              <TemplateMeta>
                Jurisdiction: {selectedTemplate.jurisdiction} • Entity ID: {selectedTemplate.entityId}
              </TemplateMeta>
            </TemplateHeader>

            <SelectionSummary>
              <SelectionInfo>
                <CounterBadge>
                  {getTotalSelectedCount()} of {getTotalFieldCount()} selected
                </CounterBadge>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                  Select the fields you want to include in your new ingestion
                </span>
              </SelectionInfo>
              <SelectionControls>
                <ToggleButton onClick={handleToggleSelectAll}>
                  {getTotalSelectedCount() < getTotalFieldCount() / 2 ? 'Select All' : 'Deselect All'}
                </ToggleButton>
              </SelectionControls>
            </SelectionSummary>

            {/* Basic Information Section */}
            <TemplateSection>
              <SectionTitle>
                Basic Information
              </SectionTitle>
              
              <BasicInfoGrid>
                <InfoCard>
                  <InfoLabel>Recipient Types</InfoLabel>
                  <CheckboxGroup>
                    {selectedTemplate.recipientType.map(rt => (
                      <CheckboxItem key={rt}>
                        <Checkbox
                          type="checkbox"
                          checked={selection.recipientType.includes(rt)}
                          onChange={(e) => handleRecipientTypeChange(rt, e.target.checked)}
                        />
                        {rt}
                      </CheckboxItem>
                    ))}
                  </CheckboxGroup>
                </InfoCard>

                <InfoCard>
                  <InfoLabel>Contact Person</InfoLabel>
                  <CheckboxWithText>
                    <Checkbox
                      type="checkbox"
                      checked={selection.contactPerson}
                      onChange={(e) => handleContactPersonChange(e.target.checked)}
                    />
                    <TextDisplay>
                      {selectedTemplate.contactPerson.match(/\(([^)]+)\)/)?.[1] || selectedTemplate.contactPerson}
                    </TextDisplay>
                  </CheckboxWithText>
                </InfoCard>
              </BasicInfoGrid>
            </TemplateSection>

            {/* Data Subject Types Section */}
            <TemplateSection>
              <SectionTitle>
                Data Subject Types
              </SectionTitle>
              
              {selectedTemplate.dataSubjectTypes.map(dst => (
                <DataSubjectCard key={dst.type} $expanded={expandedSections[dst.type]}>
                  <CardHeader 
                    $expanded={expandedSections[dst.type]}
                    onClick={() => toggleSectionExpanded(dst.type)}
                  >
                    <CardTitle>
                      <Checkbox
                        type="checkbox"
                        checked={selection.dataSubjectTypes[dst.type]?.selected || false}
                        onChange={(e) => handleDataSubjectTypeChange(dst.type, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {dst.type}
                    </CardTitle>
                    <ExpandIcon $expanded={expandedSections[dst.type]}>
                      ▼
                    </ExpandIcon>
                  </CardHeader>
                  
                  {expandedSections[dst.type] && (
                    <CardContent>
                      <SubFieldsGrid>
                        <SubField>
                          <SubFieldLabel>Transfer Location</SubFieldLabel>
                          <CheckboxGroup>
                            {dst.transferLocation.map(tl => (
                              <CheckboxItem key={tl}>
                                <Checkbox
                                  type="checkbox"
                                  checked={selection.dataSubjectTypes[dst.type]?.transferLocation.includes(tl) || false}
                                  onChange={(e) => handleSubFieldChange(dst.type, 'transferLocation', tl, e.target.checked)}
                                />
                                {tl}
                              </CheckboxItem>
                            ))}
                          </CheckboxGroup>
                        </SubField>

                        <SubField>
                          <SubFieldLabel>Category of Data</SubFieldLabel>
                          <CheckboxGroup>
                            {dst.categoryOfData.map(cod => (
                              <CheckboxItem key={cod}>
                                <Checkbox
                                  type="checkbox"
                                  checked={selection.dataSubjectTypes[dst.type]?.categoryOfData.includes(cod) || false}
                                  onChange={(e) => handleSubFieldChange(dst.type, 'categoryOfData', cod, e.target.checked)}
                                />
                                {cod}
                              </CheckboxItem>
                            ))}
                          </CheckboxGroup>
                        </SubField>

                        <SubField>
                          <SubFieldLabel>Purpose</SubFieldLabel>
                          <CheckboxGroup>
                            {dst.purpose.map(p => (
                              <CheckboxItem key={p}>
                                <Checkbox
                                  type="checkbox"
                                  checked={selection.dataSubjectTypes[dst.type]?.purpose.includes(p) || false}
                                  onChange={(e) => handleSubFieldChange(dst.type, 'purpose', p, e.target.checked)}
                                />
                                {p}
                              </CheckboxItem>
                            ))}
                          </CheckboxGroup>
                        </SubField>

                        <SubField>
                          <SubFieldLabel>Output</SubFieldLabel>
                          <CheckboxGroup>
                            {dst.output.map(o => (
                              <CheckboxItem key={o}>
                                <Checkbox
                                  type="checkbox"
                                  checked={selection.dataSubjectTypes[dst.type]?.output.includes(o) || false}
                                  onChange={(e) => handleSubFieldChange(dst.type, 'output', o, e.target.checked)}
                                />
                                <OutputChip type={o}>{o}</OutputChip>
                              </CheckboxItem>
                            ))}
                          </CheckboxGroup>
                        </SubField>

                        <SubField $fullWidth>
                          <SubFieldLabel>Conditions</SubFieldLabel>
                          <CheckboxWithText>
                            <Checkbox
                              type="checkbox"
                              checked={selection.dataSubjectTypes[dst.type]?.conditions || false}
                              onChange={(e) => handleTextFieldChange(dst.type, 'conditions', e.target.checked)}
                            />
                            <TextArea readOnly value={dst.conditions} />
                          </CheckboxWithText>
                        </SubField>

                        <SubField $fullWidth>
                          <SubFieldLabel>Remediations</SubFieldLabel>
                          <CheckboxWithText>
                            <Checkbox
                              type="checkbox"
                              checked={selection.dataSubjectTypes[dst.type]?.remediations || false}
                              onChange={(e) => handleTextFieldChange(dst.type, 'remediations', e.target.checked)}
                            />
                            <TextArea readOnly value={dst.remediations} />
                          </CheckboxWithText>
                        </SubField>
                      </SubFieldsGrid>
                    </CardContent>
                  )}
                </DataSubjectCard>
              ))}
            </TemplateSection>

            <UseTemplateButton
              $variant="primary"
              onClick={handleUseTemplate}
              disabled={getTotalSelectedCount() === 0}
            >
              Use Template ({getTotalSelectedCount()} selected)
            </UseTemplateButton>
          </>
        ) : (
          <NoDataMessage>
            Select a template version to preview and configure
          </NoDataMessage>
        )}
      </PreviewPanel>
    </Container>
  );
};

export default LegalTemplates;
