import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FiX, FiSearch, FiCheck, FiChevronDown, FiChevronRight } from 'react-icons/fi';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #fff;
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

const EntityCard = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: ${props => props.selected ? '0.75rem' : '1rem'};
  background: white;
  border: 1px solid ${props => props.selected ? '#000' : '#e0e0e0'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;

  &:hover {
    border-color: #000;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

const SelectedEntitiesHeader = styled.div<{ isExpanded: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: ${props => props.isExpanded ? '#f0f0f0' : '#f8f8f8'};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #f0f0f0;
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

// Update the Entity interface
interface Entity {
  id: string;
  name: string;
  category: EntityCategory;
  countryCode: string;
  description?: string;
}

// Add a helper function to get category display name
const getCategoryDisplayName = (category: EntityCategory): string => {
  switch (category) {
    case 'IB GM':
      return 'Investment Banking Global Markets';
    case 'IB GB':
      return 'Investment Banking Global Banking';
    case 'IB':
      return 'Investment Banking';
    case 'GWM':
      return 'Global Wealth Management';
    case 'NCL':
      return 'Non-Core and Legacy';
    case 'AM':
      return 'Asset Management';
    case 'P&C':
      return 'Personal & Corporate Banking';
    case 'AM ICC/REPM':
      return 'Asset Management ICC/REPM';
    case 'AM WCC':
      return 'Asset Management WCC';
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

interface Props {
  selectedCountries: string[];
  informationCategory: string[];
  selectedEntities: string[];
  onEntitySelect: (entityId: string) => void;
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

const EntitySelection: React.FC<Props> = ({
  selectedCountries,
  selectedEntities,
  onEntitySelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSelectedExpanded, setIsSelectedExpanded] = useState(false);

  const entities: Entity[] = useMemo(() => {
    const mockEntities: Entity[] = [];
    selectedCountries.forEach(country => {
      ENTITY_CATEGORIES.forEach((category) => {
        const count = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < count; i++) {
          mockEntities.push({
            id: `${country}-${category}-${i}`,
            name: `${country} ${getCategoryDisplayName(category as EntityCategory)} Entity ${i + 1}`,
            category: category as EntityCategory,
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

  const categorizedEntities = useMemo(() => {
    const grouped = new Map<string, Entity[]>();
    filteredEntities.forEach(entity => {
      const existing = grouped.get(entity.category) || [];
      grouped.set(entity.category, [...existing, entity]);
    });
    return grouped;
  }, [filteredEntities]);

  const selectedEntitiesList = useMemo(() => {
    return entities.filter(entity => selectedEntities.includes(entity.id));
  }, [entities, selectedEntities]);

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
          onClick={() => setIsSelectedExpanded(!isSelectedExpanded)}
        >
          <SelectedEntitiesTitle>
            {isSelectedExpanded ? <FiChevronDown /> : <FiChevronRight />}
            Selected Entities ({selectedEntitiesList.length})
          </SelectedEntitiesTitle>
        </SelectedEntitiesHeader>
        <SelectedEntitiesContent isExpanded={isSelectedExpanded}>
          {selectedEntitiesList.length > 0 ? (
            <SelectedEntitiesGrid>
              {selectedEntitiesList.map(entity => (
                <EntityCard
                  key={entity.id}
                  selected={true}
                  onClick={() => onEntitySelect(entity.id)}
                >
                  <EntityInfo>
                    <EntityName>{entity.name}</EntityName>
                    <EntityCountry>{entity.countryCode}</EntityCountry>
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
      <TabsContainer>
        {Array.from(categorizedEntities.entries())
          .sort(([catA], [catB]) => 
            getCategorySortOrder(catA as EntityCategory) - getCategorySortOrder(catB as EntityCategory)
          )
          .map(([category, categoryEntities]) => (
            <Tab
              key={category}
              onClick={() => setSelectedCategory(category)}
              selected={selectedCategory === category}
            >
              {getCategoryDisplayName(category as EntityCategory)}
              <span>{categoryEntities.length}</span>
            </Tab>
          ))}
      </TabsContainer>

      {selectedCategory && (
        <Modal onClick={() => setSelectedCategory(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {getCategoryDisplayName(selectedCategory as EntityCategory)}
              </ModalTitle>
              <CloseButton onClick={() => setSelectedCategory(null)}>
                <FiX size={20} />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <EntityGrid>
                {categorizedEntities.get(selectedCategory)?.map(entity => (
                  <EntityCard
                    key={entity.id}
                    selected={selectedEntities.includes(entity.id)}
                    onClick={() => onEntitySelect(entity.id)}
                  >
                    <EntityInfo>
                      <EntityName>{entity.name}</EntityName>
                      <EntityCountry>{entity.countryCode}</EntityCountry>
                    </EntityInfo>
                    {selectedEntities.includes(entity.id) && (
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