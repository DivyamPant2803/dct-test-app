import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { 
  RequirementCombination, 
  EntityGroup, 
  FilterCriteria, 
  BulkReaffirmationRequest,
  ReaffirmationStatus 
} from '../types/index';
import { FiChevronDown, FiChevronRight, FiCheck, FiX, FiFilter, FiRefreshCw } from 'react-icons/fi';

// Styled Components
const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1rem;
  margin-bottom: 0.75rem;
  flex-shrink: 0;
`;

const Title = styled.h1`
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #222;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 1rem;
`;

const StatCard = styled.div<{ $variant?: 'success' | 'warning' | 'danger' }>`
  padding: 0.75rem;
  border-radius: 6px;
  background: ${props => {
    switch (props.$variant) {
      case 'success': return '#d1fae5';
      case 'warning': return '#fef3c7';
      case 'danger': return '#fee2e2';
      default: return '#f8f9fa';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$variant) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      default: return '#e9ecef';
    }
  }};
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const TotalCountText = styled.div`
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.5rem;
  text-align: center;
`;

const FilterSection = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1rem;
  margin-bottom: 0.75rem;
  flex-shrink: 0;
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const FilterTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #222;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FilterLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 500;
  color: #333;
`;

const MultiSelect = styled.div`
  position: relative;
`;

const SelectButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  
  &:hover {
    border-color: #222;
  }
`;

const Dropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
  display: ${props => props.$isOpen ? 'block' : 'none'};
`;

const DropdownItem = styled.div`
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const ClearFiltersButton = styled.button`
  padding: 0.4rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  color: #666;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #f5f5f5;
  }
`;

const ContentSection = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const EntityGroupContainer = styled.div`
  margin-bottom: 0.75rem;
`;

const EntityHeader = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
  }
`;

const EntityInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const EntityName = styled.div`
  font-weight: 600;
  color: #222;
  font-size: 0.9rem;
`;

const EntityStats = styled.div`
  display: flex;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: #666;
`;

const EntityActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const ExpandIcon = styled.div<{ $isExpanded: boolean }>`
  transform: ${props => props.$isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
`;

const CombinationsList = styled.div<{ $isExpanded: boolean }>`
  display: ${props => props.$isExpanded ? 'block' : 'none'};
  margin-top: 0.5rem;
  padding-left: 0.75rem;
`;

const CombinationItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const CombinationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const CombinationDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const CombinationTitle = styled.div`
  font-weight: 500;
  color: #222;
  font-size: 0.8rem;
`;

const CombinationMeta = styled.div`
  font-size: 0.7rem;
  color: #666;
  display: flex;
  gap: 0.75rem;
`;

const StatusBadge = styled.span<{ $status: ReaffirmationStatus }>`
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 500;
  
  ${props => {
    switch (props.$status) {
      case 'CURRENT':
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      case 'DUE_SOON':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      case 'OVERDUE':
        return `
          background: #fee2e2;
          color: #991b1b;
        `;
    }
  }}
`;

const SelectionSummary = styled.div`
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #e9ecef;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
`;

const SelectionInfo = styled.div`
  font-weight: 500;
  color: #222;
  font-size: 0.8rem;
`;

const SelectionActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => props.$variant === 'primary' ? `
    background: #222;
    color: white;
    
    &:hover {
      background: #444;
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  ` : `
    background: white;
    color: #222;
    border: 1px solid #ccc;
    
    &:hover {
      background: #f5f5f5;
    }
  `}
`;

interface EnhancedBulkReaffirmationProps {
  combinations: RequirementCombination[];
  onBulkReaffirm: (request: BulkReaffirmationRequest) => Promise<void>;
  onIndividualReaffirm: (combinationId: string) => void;
}

const EnhancedBulkReaffirmation: React.FC<EnhancedBulkReaffirmationProps> = ({
  combinations,
  onBulkReaffirm,
  onIndividualReaffirm
}) => {
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());
  const [selectedCombinations, setSelectedCombinations] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterCriteria>({
    entities: [],
    dataSubjectTypes: [],
    transferLocations: [],
    recipientTypes: [],
    reviewDataTransferPurposes: [],
    reaffirmationStatuses: []
  });
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  // Group combinations by entity
  const entityGroups = useMemo(() => {
    const groups: EntityGroup[] = [];
    const entityMap = new Map<string, RequirementCombination[]>();

    combinations.forEach(combo => {
      if (!entityMap.has(combo.entity)) {
        entityMap.set(combo.entity, []);
      }
      entityMap.get(combo.entity)!.push(combo);
    });

    entityMap.forEach((combos, entity) => {
      const totalRequirements = combos.length;
      const dueRequirements = combos.filter(c => c.reaffirmationStatus === 'DUE_SOON').length;
      const overdueRequirements = combos.filter(c => c.reaffirmationStatus === 'OVERDUE').length;

      groups.push({
        entity,
        combinations: combos,
        totalRequirements,
        dueRequirements,
        overdueRequirements
      });
    });

    return groups.sort((a, b) => a.entity.localeCompare(b.entity));
  }, [combinations]);

  // Filter combinations based on criteria
  const filteredEntityGroups = useMemo(() => {
    return entityGroups.map(group => ({
      ...group,
      combinations: group.combinations.filter(combo => {
        if (filters.entities.length > 0 && !filters.entities.includes(combo.entity)) return false;
        if (filters.dataSubjectTypes.length > 0 && !filters.dataSubjectTypes.includes(combo.dataSubjectType)) return false;
        if (filters.transferLocations.length > 0 && !filters.transferLocations.includes(combo.transferLocation)) return false;
        if (filters.recipientTypes.length > 0 && !filters.recipientTypes.includes(combo.recipientType)) return false;
        if (filters.reviewDataTransferPurposes.length > 0 && !filters.reviewDataTransferPurposes.includes(combo.reviewDataTransferPurpose)) return false;
        if (filters.reaffirmationStatuses.length > 0 && !filters.reaffirmationStatuses.includes(combo.reaffirmationStatus)) return false;
        return true;
      })
    })).filter(group => group.combinations.length > 0);
  }, [entityGroups, filters]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const entities = [...new Set(combinations.map(c => c.entity))].sort();
    const dataSubjectTypes = [...new Set(combinations.map(c => c.dataSubjectType))].sort();
    const transferLocations = [...new Set(combinations.map(c => c.transferLocation))].sort();
    const recipientTypes = [...new Set(combinations.map(c => c.recipientType))].sort();
    const reviewDataTransferPurposes = [...new Set(combinations.map(c => c.reviewDataTransferPurpose))].sort();
    const reaffirmationStatuses: ReaffirmationStatus[] = ['CURRENT', 'DUE_SOON', 'OVERDUE'];

    return {
      entities,
      dataSubjectTypes,
      transferLocations,
      recipientTypes,
      reviewDataTransferPurposes,
      reaffirmationStatuses
    };
  }, [combinations]);

  const handleEntityToggle = (entity: string) => {
    setExpandedEntities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entity)) {
        newSet.delete(entity);
      } else {
        newSet.add(entity);
      }
      return newSet;
    });
  };

  const handleCombinationSelect = (combinationId: string) => {
    setSelectedCombinations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(combinationId)) {
        newSet.delete(combinationId);
      } else {
        newSet.add(combinationId);
      }
      return newSet;
    });
  };

  const handleEntitySelect = (entity: string, selectAll: boolean) => {
    const entityGroup = filteredEntityGroups.find(g => g.entity === entity);
    if (!entityGroup) return;

    setSelectedCombinations(prev => {
      const newSet = new Set(prev);
      entityGroup.combinations.forEach(combo => {
        if (selectAll) {
          newSet.add(combo.id);
        } else {
          newSet.delete(combo.id);
        }
      });
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allCombinationIds = filteredEntityGroups.flatMap(g => g.combinations.map(c => c.id));
    setSelectedCombinations(new Set(allCombinationIds));
  };

  const handleClearSelection = () => {
    setSelectedCombinations(new Set());
  };

  const handleFilterChange = (filterType: keyof FilterCriteria, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      entities: [],
      dataSubjectTypes: [],
      transferLocations: [],
      recipientTypes: [],
      reviewDataTransferPurposes: [],
      reaffirmationStatuses: []
    });
  };

  const handleBulkReaffirm = async () => {
    if (selectedCombinations.size === 0) return;

    const request: BulkReaffirmationRequest = {
      combinationIds: Array.from(selectedCombinations),
      action: 'REAFFIRMED_AS_IS',
      comment: 'Bulk reaffirmation'
    };

    try {
      await onBulkReaffirm(request);
      setSelectedCombinations(new Set());
    } catch (error) {
      console.error('Bulk reaffirmation failed:', error);
    }
  };

  const toggleDropdown = (filterType: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filterType)) {
        newSet.delete(filterType);
      } else {
        newSet.add(filterType);
      }
      return newSet;
    });
  };

  const closeAllDropdowns = () => {
    setOpenDropdowns(new Set());
  };

  const totalCombinations = filteredEntityGroups.reduce((sum, group) => sum + group.combinations.length, 0);
  const currentCombinations = filteredEntityGroups.reduce((sum, group) => 
    sum + group.combinations.filter(c => c.reaffirmationStatus === 'CURRENT').length, 0);
  const dueCombinations = filteredEntityGroups.reduce((sum, group) => 
    sum + group.combinations.filter(c => c.reaffirmationStatus === 'DUE_SOON').length, 0);
  const overdueCombinations = filteredEntityGroups.reduce((sum, group) => 
    sum + group.combinations.filter(c => c.reaffirmationStatus === 'OVERDUE').length, 0);

  return (
    <Container onClick={closeAllDropdowns}>
      <Header>
        <StatsRow>
          <StatCard $variant="success">
            <StatValue>{currentCombinations}</StatValue>
            <StatLabel>Current</StatLabel>
          </StatCard>
          <StatCard $variant="warning">
            <StatValue>{dueCombinations}</StatValue>
            <StatLabel>Due Soon</StatLabel>
          </StatCard>
          <StatCard $variant="danger">
            <StatValue>{overdueCombinations}</StatValue>
            <StatLabel>Overdue</StatLabel>
          </StatCard>
        </StatsRow>
        <TotalCountText>
          Total: {totalCombinations} requirements
        </TotalCountText>
      </Header>

      <FilterSection>
        <FilterHeader>
          <FilterTitle>
            <FiFilter />
            Filters
          </FilterTitle>
          <ClearFiltersButton onClick={handleClearFilters}>
            <FiRefreshCw />
            Clear All
          </ClearFiltersButton>
        </FilterHeader>
        
        <FilterGrid>
          <FilterGroup>
            <FilterLabel>Entities</FilterLabel>
            <MultiSelect>
              <SelectButton onClick={(e) => {
                e.stopPropagation();
                toggleDropdown('entities');
              }}>
                {filters.entities.length === 0 ? 'All Entities' : `${filters.entities.length} selected`}
                <FiChevronDown />
              </SelectButton>
              <Dropdown $isOpen={openDropdowns.has('entities')} onClick={(e) => e.stopPropagation()}>
                {filterOptions.entities.map(entity => (
                  <DropdownItem key={entity} onClick={(e) => {
                    e.stopPropagation();
                    handleFilterChange('entities', entity);
                  }}>
                    <Checkbox
                      type="checkbox"
                      checked={filters.entities.includes(entity)}
                      onChange={() => {}}
                    />
                    {entity}
                  </DropdownItem>
                ))}
              </Dropdown>
            </MultiSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Data Subject Types</FilterLabel>
            <MultiSelect>
              <SelectButton onClick={(e) => {
                e.stopPropagation();
                toggleDropdown('dataSubjectTypes');
              }}>
                {filters.dataSubjectTypes.length === 0 ? 'All Types' : `${filters.dataSubjectTypes.length} selected`}
                <FiChevronDown />
              </SelectButton>
              <Dropdown $isOpen={openDropdowns.has('dataSubjectTypes')} onClick={(e) => e.stopPropagation()}>
                {filterOptions.dataSubjectTypes.map(type => (
                  <DropdownItem key={type} onClick={(e) => {
                    e.stopPropagation();
                    handleFilterChange('dataSubjectTypes', type);
                  }}>
                    <Checkbox
                      type="checkbox"
                      checked={filters.dataSubjectTypes.includes(type)}
                      onChange={() => {}}
                    />
                    {type}
                  </DropdownItem>
                ))}
              </Dropdown>
            </MultiSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Transfer Locations</FilterLabel>
            <MultiSelect>
              <SelectButton onClick={(e) => {
                e.stopPropagation();
                toggleDropdown('transferLocations');
              }}>
                {filters.transferLocations.length === 0 ? 'All Locations' : `${filters.transferLocations.length} selected`}
                <FiChevronDown />
              </SelectButton>
              <Dropdown $isOpen={openDropdowns.has('transferLocations')} onClick={(e) => e.stopPropagation()}>
                {filterOptions.transferLocations.map(location => (
                  <DropdownItem key={location} onClick={(e) => {
                    e.stopPropagation();
                    handleFilterChange('transferLocations', location);
                  }}>
                    <Checkbox
                      type="checkbox"
                      checked={filters.transferLocations.includes(location)}
                      onChange={() => {}}
                    />
                    {location}
                  </DropdownItem>
                ))}
              </Dropdown>
            </MultiSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Recipient Types</FilterLabel>
            <MultiSelect>
              <SelectButton onClick={(e) => {
                e.stopPropagation();
                toggleDropdown('recipientTypes');
              }}>
                {filters.recipientTypes.length === 0 ? 'All Recipients' : `${filters.recipientTypes.length} selected`}
                <FiChevronDown />
              </SelectButton>
              <Dropdown $isOpen={openDropdowns.has('recipientTypes')} onClick={(e) => e.stopPropagation()}>
                {filterOptions.recipientTypes.map(recipient => (
                  <DropdownItem key={recipient} onClick={(e) => {
                    e.stopPropagation();
                    handleFilterChange('recipientTypes', recipient);
                  }}>
                    <Checkbox
                      type="checkbox"
                      checked={filters.recipientTypes.includes(recipient)}
                      onChange={() => {}}
                    />
                    {recipient}
                  </DropdownItem>
                ))}
              </Dropdown>
            </MultiSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Review Data Transfer Purposes</FilterLabel>
            <MultiSelect>
              <SelectButton onClick={(e) => {
                e.stopPropagation();
                toggleDropdown('reviewDataTransferPurposes');
              }}>
                {filters.reviewDataTransferPurposes.length === 0 ? 'All Purposes' : `${filters.reviewDataTransferPurposes.length} selected`}
                <FiChevronDown />
              </SelectButton>
              <Dropdown $isOpen={openDropdowns.has('reviewDataTransferPurposes')} onClick={(e) => e.stopPropagation()}>
                {filterOptions.reviewDataTransferPurposes.map(purpose => (
                  <DropdownItem key={purpose} onClick={(e) => {
                    e.stopPropagation();
                    handleFilterChange('reviewDataTransferPurposes', purpose);
                  }}>
                    <Checkbox
                      type="checkbox"
                      checked={filters.reviewDataTransferPurposes.includes(purpose)}
                      onChange={() => {}}
                    />
                    {purpose}
                  </DropdownItem>
                ))}
              </Dropdown>
            </MultiSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Reaffirmation Status</FilterLabel>
            <MultiSelect>
              <SelectButton onClick={(e) => {
                e.stopPropagation();
                toggleDropdown('reaffirmationStatuses');
              }}>
                {filters.reaffirmationStatuses.length === 0 ? 'All Statuses' : `${filters.reaffirmationStatuses.length} selected`}
                <FiChevronDown />
              </SelectButton>
              <Dropdown $isOpen={openDropdowns.has('reaffirmationStatuses')} onClick={(e) => e.stopPropagation()}>
                {filterOptions.reaffirmationStatuses.map(status => (
                  <DropdownItem key={status} onClick={(e) => {
                    e.stopPropagation();
                    handleFilterChange('reaffirmationStatuses', status);
                  }}>
                    <Checkbox
                      type="checkbox"
                      checked={filters.reaffirmationStatuses.includes(status)}
                      onChange={() => {}}
                    />
                    {status}
                  </DropdownItem>
                ))}
              </Dropdown>
            </MultiSelect>
          </FilterGroup>
        </FilterGrid>
      </FilterSection>

      <ContentSection>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredEntityGroups.map(group => (
            <EntityGroupContainer key={group.entity}>
              <EntityHeader $isExpanded={expandedEntities.has(group.entity)}>
                <EntityInfo>
                  <Checkbox
                    type="checkbox"
                    checked={group.combinations.every(c => selectedCombinations.has(c.id))}
                    onChange={(e) => handleEntitySelect(group.entity, e.target.checked)}
                  />
                  <ExpandIcon $isExpanded={expandedEntities.has(group.entity)}>
                    <FiChevronRight />
                  </ExpandIcon>
                  <EntityName onClick={() => handleEntityToggle(group.entity)}>
                    {group.entity}
                  </EntityName>
                  <EntityStats>
                    <span>{group.totalRequirements} total</span>
                    <span>{group.dueRequirements} due</span>
                    <span>{group.overdueRequirements} overdue</span>
                  </EntityStats>
                </EntityInfo>
                <EntityActions>
                  <ActionButton onClick={() => handleEntityToggle(group.entity)}>
                    {expandedEntities.has(group.entity) ? 'Collapse' : 'Expand'}
                  </ActionButton>
                </EntityActions>
              </EntityHeader>
              
              <CombinationsList $isExpanded={expandedEntities.has(group.entity)}>
                {group.combinations.map(combo => (
                  <CombinationItem key={combo.id}>
                    <CombinationInfo>
                      <Checkbox
                        type="checkbox"
                        checked={selectedCombinations.has(combo.id)}
                        onChange={() => handleCombinationSelect(combo.id)}
                      />
                      <CombinationDetails>
                        <CombinationTitle>{combo.requirement.title}</CombinationTitle>
                        <CombinationMeta>
                          <span>{combo.dataSubjectType}</span>
                          <span>•</span>
                          <span>{combo.transferLocation}</span>
                          <span>•</span>
                          <span>{combo.recipientType}</span>
                          <span>•</span>
                          <span>{combo.reviewDataTransferPurpose}</span>
                        </CombinationMeta>
                      </CombinationDetails>
                    </CombinationInfo>
                    <EntityActions>
                      <StatusBadge $status={combo.reaffirmationStatus}>
                        {combo.reaffirmationStatus}
                      </StatusBadge>
                      <ActionButton onClick={() => onIndividualReaffirm(combo.id)}>
                        Reaffirm
                      </ActionButton>
                    </EntityActions>
                  </CombinationItem>
                ))}
              </CombinationsList>
            </EntityGroupContainer>
          ))}
        </div>

        {selectedCombinations.size > 0 && (
          <SelectionSummary>
            <SelectionInfo>
              {selectedCombinations.size} requirement{selectedCombinations.size !== 1 ? 's' : ''} selected
            </SelectionInfo>
            <SelectionActions>
              <ActionButton onClick={handleClearSelection}>
                <FiX />
                Clear Selection
              </ActionButton>
              <ActionButton $variant="primary" onClick={handleBulkReaffirm}>
                <FiCheck />
                Bulk Reaffirm ({selectedCombinations.size})
              </ActionButton>
            </SelectionActions>
          </SelectionSummary>
        )}
      </ContentSection>
    </Container>
  );
};

export default EnhancedBulkReaffirmation;
