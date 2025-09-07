import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiSearch, FiCheck, FiChevronDown, FiChevronRight, FiInfo } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { addEntityToCategory, removeEntityFromCategory, addEntityToCountry, removeEntityFromCountry, setCidInfoMessageShown } from '../Questionnaire/questionnaireSlice';
import TooltipWrapper from '../common/TooltipWrapper';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #fff;
  position: relative; // Add this to make absolute positioning work
`;

const SearchBar = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-left: 2.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  background: #f8f8f8;

  &:focus {
    outline: none;
    border-color: #000;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
    background: white;
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const TabsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.0rem;
  padding: 0.5rem;
  background: #f8f8f8;
  border-radius: 8px;
`;

const Tab = styled.button<{ selected?: boolean }>`
  padding: 0.75rem 1rem;
  background: ${props => props.selected ? '#000' : 'white'};
  color: ${props => props.selected ? 'white' : '#333'};
  border: 1px solid ${props => props.selected ? '#000' : '#e0e0e0'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    border-color: #000;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  span {
    background: ${props => props.selected ? 'rgba(255, 255, 255, 0.2)' : '#f0f0f0'};
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f8f8;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #666;
  transition: color 0.2s;

  &:hover {
    color: #000;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(90vh - 150px);
`;

const EntityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const EntityCard = styled.div<{ selected?: boolean; disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: ${props => {
    if (props.disabled) return '#f5f5f5';
    if (props.selected) return '#000';
    return 'white';
  }};
  color: ${props => {
    if (props.disabled) return '#999';
    if (props.selected) return 'white';
    return '#333';
  }};
  border: 2px solid ${props => {
    if (props.disabled) return '#ddd';
    if (props.selected) return '#000';
    return '#e0e0e0';
  }};
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover {
    ${props => !props.disabled && `
      border-color: #000;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    `}
  }
`;

const EntityInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const EntityName = styled.div`
  font-weight: 500;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EntityCountry = styled.div`
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.15rem;
`;

const SelectedEntitiesSection = styled.div`
  margin-top: 1rem;
  background: #f8f8f8;
  border-radius: 12px;
  overflow:
`;

const SelectedEntitiesHeader = styled.div<{ isExpanded: boolean; isNearLimit?: boolean; isAtLimit?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: ${props => {
    if (props.isAtLimit) return '#fee';
    if (props.isNearLimit) return '#fff3cd';
    return '#f8f8f8';
  }};
  border: 1px solid ${props => {
    if (props.isAtLimit) return '#f5c6cb';
    if (props.isNearLimit) return '#ffeaa7';
    return '#e0e0e0';
  }};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.5rem;

  &:hover {
    background: ${props => {
      if (props.isAtLimit) return '#fdd';
      if (props.isNearLimit) return '#ffeaa7';
      return '#f0f0f0';
    }};
  }
`;

const SelectedEntitiesTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
`;

const SelectedEntitiesContent = styled.div<{ isExpanded: boolean }>`
  padding: ${props => props.isExpanded ? '0.75rem' : '0'};
  max-height: ${props => props.isExpanded ? '250px' : '0'};
  overflow: auto;
  transition: all 0.3s ease-in-out;
`;

const SelectedEntitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
`;

const NoEntities = styled.div`
  text-align: center;
  color: #666;
  padding: 2rem;
  background: white;
  border-radius: 8px;
`;

const SectionGroup = styled.div`
  background: #f8f8f8;
  border-radius: 10px;
  margin-bottom: 1rem;
  padding: 1rem 1.5rem 1.2rem 1.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
`;

const CompactTabsContainer = styled(TabsContainer)`
  gap: 0.5rem;
  padding: 0.25rem 0;
  background: none;
`;

const CompactTab = styled(Tab)<{ hasSelected?: boolean }>`
  padding: 0.5rem 0.8rem;
  font-size: 0.88rem;
  border: 2px solid ${props => props.hasSelected ? '#000' : props.selected ? '#000' : '#e0e0e0'};
  box-shadow: ${props => props.hasSelected ? '0 0 0 2px rgba(0, 0, 0, 0.1)' : 'none'};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin: 0.5rem 0;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number; isNearLimit: boolean; isAtLimit: boolean }>`
  height: 100%;
  width: ${props => Math.min(props.percentage, 100)}%;
  background: ${props => {
    if (props.isAtLimit) return '#dc3545';
    if (props.isNearLimit) return '#ffc107';
    return '#28a745';
  }};
  transition: all 0.3s ease;
  border-radius: 3px;
`;

// Add a type for the specific categories
type EntityCategory = 
  | 'IB GM'
  | 'IB GB'
  | 'IB'
  | 'GWM'
  | 'NCL'
  | 'AM'
  | 'P&C'
  | 'AM ICC/REPM'
  | 'AM WCC'
  | 'Employee'  // Add Employee type for existing logic
  | 'Client';   // Add Client type for existing logic

// Update the Entity interface to support multiple categories
interface Entity {
  id: string;
  name: string;
  categories: EntityCategory[]; // Changed from single category to array of categories
  countryCode: string;
  description?: string;
}

// Add a helper function to get category display name
const getCategoryDisplayName = (category: EntityCategory): string => {
  switch (category) {
    case 'IB GM':
      return 'Investment Banking Global Markets (IB GM)';
    case 'IB GB':
      return 'Investment Banking Global Banking (IB GB)';
    case 'IB':
      return 'Investment Banking (IB)';
    case 'GWM':
      return 'Global Wealth Management (GWM)';
    case 'NCL':
      return 'Non-Core and Legacy (NCL)';
    case 'AM':
      return 'Asset Management (AM)';
    case 'P&C':
      return 'Personal & Corporate Banking (PNC)';
    case 'AM ICC/REPM':
      return 'Asset Management ICC/REPM (AM ICC/REPM)';
    case 'AM WCC':
      return 'Asset Management WCC (AM WCC)';
    case 'Employee':
      return 'Employee';
    case 'Client':
      return 'Client';
    default:
      return category;
  }
};

// Add a helper function to get category sort order
const getCategorySortOrder = (category: EntityCategory): number => {
  const order: EntityCategory[] = [
    'IB GM',
    'IB GB',
    'IB',
    'GWM',
    'NCL',
    'AM',
    'P&C',
    'AM ICC/REPM',
    'AM WCC'
  ];
  return order.indexOf(category);
};

const InfoMessageBox = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
`;

const InfoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const InfoTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
`;

const InfoContent = styled.div`
  color: #6c757d;
  font-size: 0.85rem;
  line-height: 1.4;
`;

const CloseInfoButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #6c757d;
  transition: color 0.2s;
  
  &:hover {
    color: #495057;
  }
`;

interface Props {
  selectedCountries: string[];
  informationCategory: string[];
  selectedEntities: string[]; // Now composite keys: entityId|category
  onEntitySelect: (entityId: string, category: string) => void;
  maxEntities?: number;
  entityLimitWarning?: number;
}

// Update categories to include Employee
const ENTITY_CATEGORIES = [
  'IB GM',
  'IB GB',
  'IB',
  'GWM',
  'NCL',
  'AM',
  'P&C',
  'AM ICC/REPM',
  'AM WCC',
  'Employee'
] as const;

const EMPLOYEE_CATEGORY = 'Employee';

// Helper to create composite key
const getEntityCategoryKey = (entityId: string, category: string) => `${entityId}|${category}`;

const EntitySelection: React.FC<Props> = ({
  selectedCountries,
  informationCategory,
  selectedEntities,
  onEntitySelect,
  maxEntities = 100,
  entityLimitWarning = 90
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSelectedExpanded, setIsSelectedExpanded] = useState(false);
  const [showInfoMessage, setShowInfoMessage] = useState(false);
  const dispatch = useAppDispatch();
  
  // Get the CID info message state from Redux
  const cidInfoMessageShown = useAppSelector(state => state.questionnaire.cidInfoMessageShown);

  console.log(selectedEntities);

  // Check if we're approaching or exceeding entity limits
  const isNearLimit = selectedEntities.length >= entityLimitWarning;
  const isAtLimit = selectedEntities.length >= maxEntities;
  const canSelectMore = selectedEntities.length < maxEntities;

  // Check if CID is selected and show info message
  useEffect(() => {
    const isCIDSelected = informationCategory.includes('CID');
    
    // Only show message if CID is selected and we haven't shown it yet
    if (isCIDSelected && !cidInfoMessageShown) {
      setShowInfoMessage(true);
      dispatch(setCidInfoMessageShown(true));
    }
  }, [informationCategory, cidInfoMessageShown, dispatch]);

  // Handle clicking outside the info message to dismiss it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showInfoMessage && !target.closest('.info-message-box')) {
        setShowInfoMessage(false);
      }
    };

    if (showInfoMessage) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInfoMessage]);

  const entities: Entity[] = useMemo(() => {
    const mockEntities: Entity[] = [];
    selectedCountries.forEach(country => {
      ENTITY_CATEGORIES.forEach((category) => {
        const count = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < count; i++) {
          // Create entity with multiple categories - some entities can belong to multiple divisions
          const entityId = `${country}-${category}-${i}`;
          const entityName = `${country} ${getCategoryDisplayName(category as EntityCategory)} Entity ${i + 1}`;
          
          // Determine categories for this entity
          let categories: EntityCategory[] = [category as EntityCategory];
          
          // Some entities can belong to multiple categories (e.g., IB entities can belong to both IB GM and IB GB)
          if (category === 'IB GM' || category === 'IB GB') {
            // 30% chance of belonging to both IB GM and IB GB
            if (Math.random() < 0.3) {
              categories = ['IB GM', 'IB GB'];
            }
          } else if (category === 'AM ICC/REPM' || category === 'AM WCC') {
            // 20% chance of belonging to both AM ICC/REPM and AM WCC
            if (Math.random() < 0.2) {
              categories = ['AM ICC/REPM', 'AM WCC'];
            }
          }
          
          mockEntities.push({
            id: entityId,
            name: entityName,
            categories: categories,
            countryCode: country.toUpperCase(),
            description: `${getCategoryDisplayName(category as EntityCategory)} services in ${country}`
          });
        }
      });
    });
    return mockEntities;
  }, [selectedCountries]);

  const filteredEntities = useMemo(() => {
    return entities.filter(entity => 
      entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [entities, searchTerm]);

  const categorizedBusinessEntities = useMemo(() => {
    const grouped = new Map<string, Entity[]>();
    filteredEntities.forEach(entity => {
      // Add entity to each of its categories
      entity.categories.forEach(category => {
        if (category !== EMPLOYEE_CATEGORY) {
          const existing = grouped.get(category) || [];
          // Only add if not already present (avoid duplicates)
          if (!existing.find(e => e.id === entity.id)) {
            grouped.set(category, [...existing, entity]);
          }
        }
      });
    });
    return grouped;
  }, [filteredEntities]);

  const categorizedEmployeeEntities = useMemo(() => {
    return filteredEntities.filter(entity => entity.categories.includes(EMPLOYEE_CATEGORY as EntityCategory));
  }, [filteredEntities]);

  const selectedEntitiesList = useMemo(() => {
    return entities.filter(entity => selectedEntities.includes(getEntityCategoryKey(entity.id, entity.categories[0])));
  }, [entities, selectedEntities]);

  // Helper function to check if an entity is selected in a specific category
  const isEntitySelectedInCategory = (entityId: string, category: string): boolean => {
    return selectedEntities.includes(getEntityCategoryKey(entityId, category));
  };

  // Helper function to get all unique selected entities across all categories
  const getAllSelectedEntities = (): string[] => {
    // Return all composite keys
    return selectedEntities;
  };

  // Handle selection for a specific entity-category pair
  const handleEntitySelect = (entityId: string, category: string) => {
    const key = getEntityCategoryKey(entityId, category);
    const isCurrentlySelected = selectedEntities.includes(key);
    
    // If trying to add a new entity and we're at the limit, prevent selection
    if (!isCurrentlySelected && isAtLimit) {
      return; // Don't allow selection when at limit
    }
    
    onEntitySelect(entityId, category);
    const entity = entities.find(e => e.id === entityId);
    if (!entity) return;
    
    if (isCurrentlySelected) {
      dispatch(removeEntityFromCategory({ category, entityId }));
      dispatch(removeEntityFromCountry({ country: entity.countryCode, entityId }));
    } else {
      dispatch(addEntityToCategory({ category, entityId, name: entity.name }));
      dispatch(addEntityToCountry({ country: entity.countryCode, entityId, name: entity.name }));
    }
  };

  return (
    <Container>
      <SearchBar>
        <SearchIcon />
        <SearchInput
          placeholder="Search entities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>
      
      <SelectedEntitiesSection>
        <SelectedEntitiesHeader 
          isExpanded={isSelectedExpanded}
          isNearLimit={isNearLimit}
          isAtLimit={isAtLimit}
          onClick={() => setIsSelectedExpanded(!isSelectedExpanded)}
        >
          <SelectedEntitiesTitle>
            {isSelectedExpanded ? <FiChevronDown /> : <FiChevronRight />}
            Selected Entities ({selectedEntities.length}/{maxEntities})
            <span style={{ 
              marginLeft: '0.5rem',
              padding: '2px',
              borderRadius: '50%',
              backgroundColor: selectedEntities.length > 0 ? 'rgba(0, 102, 204, 0.1)' : 'transparent',
              border: selectedEntities.length > 0 ? '1px solid rgba(0, 102, 204, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}>
              <TooltipWrapper tooltipText={
                selectedEntities.length > 0 
                  ? `Entity Selection Limit: You have selected ${selectedEntities.length} of ${maxEntities} entities (${maxEntities - selectedEntities.length} remaining). If you need to work with more than ${maxEntities} entities, please download the comprehensive report instead.`
                  : `Entity Selection Limit: You can select up to ${maxEntities} entities. If you need to work with more than ${maxEntities} entities, please download the comprehensive report instead.`
              }>
                <FiInfo 
                  size={16} 
                  style={{ 
                    color: selectedEntities.length > 0 ? '#0066cc' : '#666', 
                    cursor: 'help',
                    verticalAlign: 'middle',
                    transition: 'color 0.2s ease'
                  }} 
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#0066cc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = selectedEntities.length > 0 ? '#0066cc' : '#666';
                  }}
                />
              </TooltipWrapper>
            </span>
            {isNearLimit && !isAtLimit && (
              <span style={{ 
                fontSize: '0.8rem', 
                color: '#856404', 
                marginLeft: '0.5rem',
                fontWeight: 'normal'
              }}>
                ⚠️ Approaching limit
              </span>
            )}
            {isAtLimit && (
              <span style={{ 
                fontSize: '0.8rem', 
                color: '#721c24', 
                marginLeft: '0.5rem',
                fontWeight: 'normal'
              }}>
                🚫 Limit reached
              </span>
            )}
          </SelectedEntitiesTitle>
        </SelectedEntitiesHeader>
        
        {/* Progress Bar */}
        <ProgressBar>
          <ProgressFill 
            percentage={(selectedEntities.length / maxEntities) * 100}
            isNearLimit={isNearLimit}
            isAtLimit={isAtLimit}
          />
        </ProgressBar>
        
        <SelectedEntitiesContent isExpanded={isSelectedExpanded}>
          {selectedEntitiesList.length > 0 ? (
            <SelectedEntitiesGrid>
              {selectedEntitiesList.map(entity => (
                <EntityCard
                  key={entity.id}
                  selected={true}
                  disabled={false}
                  onClick={() => handleEntitySelect(entity.id, entity.categories[0])}
                >
                  <EntityInfo>
                    <EntityName>{entity.name}</EntityName>
                    <EntityCountry>{entity.countryCode}</EntityCountry>
                    {/* Show all categories this entity belongs to */}
                    {entity.categories.length > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.25rem' }}>
                        Categories: {entity.categories.map(cat => getCategoryDisplayName(cat)).join(', ')}
                      </div>
                    )}
                  </EntityInfo>
                  <FiX />
                </EntityCard>
              ))}
            </SelectedEntitiesGrid>
          ) : (
            <NoEntities>No entities selected</NoEntities>
          )}
        </SelectedEntitiesContent>
      </SelectedEntitiesSection>
      
      {/* Business Divisions Section */}
      <SectionGroup>
        <SectionHeader>Business Divisions</SectionHeader>
        <CompactTabsContainer>
          {Array.from(categorizedBusinessEntities.entries())
            .sort(([catA], [catB]) => 
              getCategorySortOrder(catA as EntityCategory) - getCategorySortOrder(catB as EntityCategory)
            )
            .map(([category, categoryEntities]) => {
              // Count selected entities in this category
              const selectedCount = categoryEntities.filter(entity => 
                selectedEntities.includes(getEntityCategoryKey(entity.id, category))
              ).length;
              
              return (
                <CompactTab
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  selected={selectedCategory === category}
                  hasSelected={selectedCount > 0}
                >
                  {getCategoryDisplayName(category as EntityCategory)}
                  <span>{categoryEntities.length}</span>
                  {selectedCount > 0 && (
                    <span style={{ 
                      background: '#000', 
                      color: 'white',
                      marginLeft: '0.25rem'
                    }}>
                      {selectedCount}
                    </span>
                  )}
                </CompactTab>
              );
            })}
        </CompactTabsContainer>
      </SectionGroup>

      {/* Employee Section (only if present) */}
      {categorizedEmployeeEntities.length > 0 && (
        <SectionGroup>
          <SectionHeader>Employee Data</SectionHeader>
          <CompactTabsContainer>
            <CompactTab
              key={EMPLOYEE_CATEGORY}
              onClick={() => setSelectedCategory(EMPLOYEE_CATEGORY)}
              selected={selectedCategory === EMPLOYEE_CATEGORY}
              hasSelected={categorizedEmployeeEntities.filter(entity => 
                selectedEntities.includes(getEntityCategoryKey(entity.id, EMPLOYEE_CATEGORY))
              ).length > 0}
            >
              {getCategoryDisplayName(EMPLOYEE_CATEGORY as EntityCategory)}
              <span>{categorizedEmployeeEntities.length}</span>
              {(() => {
                const selectedCount = categorizedEmployeeEntities.filter(entity => 
                  selectedEntities.includes(getEntityCategoryKey(entity.id, EMPLOYEE_CATEGORY))
                ).length;
                return selectedCount > 0 ? (
                  <span style={{ 
                    background: '#000', 
                    color: 'white',
                    marginLeft: '0.25rem'
                  }}>
                    {selectedCount}
                  </span>
                ) : null;
              })()}
            </CompactTab>
          </CompactTabsContainer>
        </SectionGroup>
      )}

      {/* Information Message Box - positioned as overlay */}
      {showInfoMessage && (
        <InfoMessageBox className="info-message-box">
          <InfoHeader>
            <InfoTitle>
              <FiInfo size={16} />
              Information
            </InfoTitle>
            <CloseInfoButton onClick={() => setShowInfoMessage(false)}>
              <FiX size={16} />
            </CloseInfoButton>
          </InfoHeader>
          <InfoContent>
            You have selected "CID" (Client Information Data) as your information category. 
            This means you will be working with data related to clients and their employees. 
            Please ensure you have the necessary permissions and follow all data protection guidelines.
          </InfoContent>
        </InfoMessageBox>
      )}

      {selectedCategory && (
        <Modal onClick={() => setSelectedCategory(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {getCategoryDisplayName(selectedCategory as EntityCategory)}
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#666', 
                  marginTop: '0.25rem',
                  fontWeight: 'normal'
                }}>
                  {selectedEntities.length} of {maxEntities} entities selected
                </div>
                {isNearLimit && !isAtLimit && (
                  <span style={{ 
                    fontSize: '0.8rem', 
                    color: '#856404', 
                    marginLeft: '1rem',
                    fontWeight: 'normal'
                  }}>
                    ⚠️ Approaching limit
                  </span>
                )}
                {isAtLimit && (
                  <span style={{ 
                    fontSize: '0.8rem', 
                    color: '#721c24', 
                    marginLeft: '1rem',
                    fontWeight: 'normal'
                  }}>
                    🚫 Limit reached
                  </span>
                )}
              </ModalTitle>
              <CloseButton onClick={() => setSelectedCategory(null)}>
                <FiX size={20} />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              {isAtLimit && (
                <div style={{
                  background: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  color: '#721c24',
                  fontSize: '0.9rem',
                  textAlign: 'center'
                }}>
                  🚫 <strong>Entity Selection Limit Reached</strong><br />
                  You have selected the maximum {maxEntities} entities. 
                  To work with more entities, please deselect some current selections or download the comprehensive report.
                </div>
              )}
              <EntityGrid>
                {(selectedCategory === EMPLOYEE_CATEGORY
                  ? categorizedEmployeeEntities
                  : categorizedBusinessEntities.get(selectedCategory) || [])
                  .map(entity => (
                    <EntityCard
                      key={entity.id}
                      selected={selectedEntities.includes(getEntityCategoryKey(entity.id, selectedCategory))}
                      disabled={!selectedEntities.includes(getEntityCategoryKey(entity.id, selectedCategory)) && isAtLimit}
                      onClick={() => handleEntitySelect(entity.id, selectedCategory)}
                    >
                      <EntityInfo>
                        <EntityName>{entity.name}</EntityName>
                        <EntityCountry>{entity.countryCode}</EntityCountry>
                        {/* Show all categories this entity belongs to */}
                        {entity.categories.length > 1 && (
                          <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.25rem' }}>
                            Also in: {entity.categories.filter(cat => cat !== selectedCategory).join(', ')}
                          </div>
                        )}
                        {/* Show limit message when disabled */}
                        {!selectedEntities.includes(getEntityCategoryKey(entity.id, selectedCategory)) && isAtLimit && (
                          <div style={{ 
                            fontSize: '0.7rem', 
                            color: '#721c24', 
                            marginTop: '0.25rem',
                            fontStyle: 'italic'
                          }}>
                            Cannot select - limit reached
                          </div>
                        )}
                      </EntityInfo>
                      {selectedEntities.includes(getEntityCategoryKey(entity.id, selectedCategory)) && (
                        <FiCheck size={18} />
                      )}
                    </EntityCard>
                  ))}
              </EntityGrid>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default EntitySelection; 