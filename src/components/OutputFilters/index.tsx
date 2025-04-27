import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiFilter, FiX, FiCheck, FiChevronDown, FiChevronRight } from 'react-icons/fi';

const FilterOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const FilterHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
`;

const FilterTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #eee;
    color: #000;
  }
`;

const FilterContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 3px;
  }
`;

const FilterSection = styled.div`
  border-bottom: 1px solid #eee;
`;

const SectionHeader = styled.div`
  padding: 16px 20px;
  background: white;
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: #f8f9fa;
  }
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const ChipGrid = styled.div<{ isExpanded: boolean }>`
  display: ${props => props.isExpanded ? 'grid' : 'none'};
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
  padding: 12px 20px;
  background: #f8f9fa;
`;

const Chip = styled.button<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  background: ${props => props.isSelected ? '#000' : 'white'};
  color: ${props => props.isSelected ? 'white' : '#666'};
  border: 1px solid ${props => props.isSelected ? '#000' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    border-color: #000;
    color: ${props => props.isSelected ? 'white' : '#000'};
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #000;
    color: #000;
  }
`;

const ActiveFiltersBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #eee;
  overflow-x: auto;
  white-space: nowrap;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 2px;
  }
`;

const ActiveChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  color: #333;

  button {
    background: none;
    border: none;
    padding: 2px;
    cursor: pointer;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin-left: 4px;

    &:hover {
      background: #eee;
      color: #000;
    }
  }
`;

interface FilterOption {
  id: string;
  label: string;
  group: string;
}

interface OutputFiltersProps {
  informationCategory: string[];
  onFilterChange: (filters: Record<string, string[]>) => void;
}

const OutputFilters: React.FC<OutputFiltersProps> = ({
  informationCategory,
  onFilterChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['informationCategory']));
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    informationCategory: [],
    purposeTypes: [],
    countryScope: [],
    recipientTypes: [],
    clientPurposes: [],
    scopeOfTransfer: []
  });

  const filterOptions: Record<string, { title: string; options: FilterOption[] }> = {
    informationCategory: {
      title: 'Information Category',
      options: [
        { id: 'client', label: 'Client', group: 'informationCategory' },
        { id: 'employee', label: 'Employee', group: 'informationCategory' }
      ]
    },
    purposeTypes: {
      title: 'Purpose Types',
      options: [
        { id: 'employee-employee', label: 'Employee-Employee', group: 'purposeTypes' },
        { id: 'employee-candidate', label: 'Employee-Candidate', group: 'purposeTypes' },
        { id: 'employee-cs', label: 'Employee-CS Employee', group: 'purposeTypes' }
      ]
    },
    countryScope: {
      title: 'Country Scope',
      options: [
        { id: 'inside', label: 'Inside Country', group: 'countryScope' },
        { id: 'outside', label: 'Outside Country', group: 'countryScope' }
      ]
    },
    recipientTypes: {
      title: 'Recipient Types',
      options: [
        { id: 'entity', label: 'Entity', group: 'recipientTypes' },
        { id: 'service-provider', label: 'Service Provider', group: 'recipientTypes' },
        { id: 'third-party', label: 'Third Party', group: 'recipientTypes' },
        { id: 'external-authorities', label: 'External Authorities', group: 'recipientTypes' }
      ]
    },
    clientPurposes: {
      title: 'Client Purposes',
      options: [
        { id: 'outsourcing', label: 'Outsourcing/Nearshoring/Offshoring', group: 'clientPurposes' },
        { id: 'employment', label: 'Employment Contract Administration', group: 'clientPurposes' },
        { id: 'monitoring', label: 'Monitoring', group: 'clientPurposes' }
      ]
    }
  };

  const handleFilterToggle = (option: FilterOption) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      const group = option.group;
      
      if (newFilters[group].includes(option.id)) {
        newFilters[group] = newFilters[group].filter(id => id !== option.id);
      } else {
        newFilters[group] = [...newFilters[group], option.id];
      }
      
      return newFilters;
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    onFilterChange(selectedFilters);
  }, [selectedFilters, onFilterChange]);

  const getActiveFiltersCount = () => {
    return Object.values(selectedFilters).reduce((count, filters) => count + filters.length, 0);
  };

  return (
    <>
      <FilterButton onClick={() => setIsOpen(true)}>
        <FiFilter size={16} />
        Filters
        {getActiveFiltersCount() > 0 && (
          <span style={{ 
            background: '#000', 
            color: 'white', 
            borderRadius: '50%', 
            width: '20px', 
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}>
            {getActiveFiltersCount()}
          </span>
        )}
      </FilterButton>

      <FilterOverlay $isOpen={isOpen}>
        <FilterHeader>
          <FilterTitle>Filters</FilterTitle>
          <CloseButton onClick={() => setIsOpen(false)}>
            <FiX size={20} />
          </CloseButton>
        </FilterHeader>

        {getActiveFiltersCount() > 0 && (
          <ActiveFiltersBar>
            {Object.entries(selectedFilters).map(([group, filters]) =>
              filters.map(filterId => {
                const option = filterOptions[group].options.find(opt => opt.id === filterId);
                if (!option) return null;
                return (
                  <ActiveChip key={filterId}>
                    {option.label}
                    <button onClick={() => handleFilterToggle(option)}>
                      <FiX size={14} />
                    </button>
                  </ActiveChip>
                );
              })
            )}
          </ActiveFiltersBar>
        )}

        <FilterContent>
          {Object.entries(filterOptions).map(([sectionId, section]) => (
            <FilterSection key={sectionId}>
              <SectionHeader onClick={() => toggleSection(sectionId)}>
                <SectionTitle>{section.title}</SectionTitle>
                {expandedSections.has(sectionId) ? (
                  <FiChevronDown size={20} />
                ) : (
                  <FiChevronRight size={20} />
                )}
              </SectionHeader>
              <ChipGrid isExpanded={expandedSections.has(sectionId)}>
                {section.options.map(option => (
                  <Chip
                    key={option.id}
                    isSelected={selectedFilters[option.group].includes(option.id)}
                    onClick={() => handleFilterToggle(option)}
                  >
                    {option.label}
                    {selectedFilters[option.group].includes(option.id) && (
                      <FiCheck size={14} />
                    )}
                  </Chip>
                ))}
              </ChipGrid>
            </FilterSection>
          ))}
        </FilterContent>
      </FilterOverlay>
    </>
  );
};

export default OutputFilters; 