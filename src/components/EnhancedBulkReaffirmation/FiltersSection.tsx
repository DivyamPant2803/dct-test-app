import React, { useState } from 'react';
import styled from 'styled-components';
import { FiChevronDown, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { FilterCriteria, ReaffirmationStatus } from '../../types/index';

const FilterContainer = styled.div`
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

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
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

interface FilterOptions {
  entities: string[];
  dataSubjectTypes: string[];
  transferLocations: string[];
  recipientTypes: string[];
  reviewDataTransferPurposes: string[];
  reaffirmationStatuses: ReaffirmationStatus[];
}

interface FiltersSectionProps {
  filters: FilterCriteria;
  filterOptions: FilterOptions;
  onFilterChange: (filterType: keyof FilterCriteria, value: string) => void;
  onClearFilters: () => void;
}

const FiltersSection: React.FC<FiltersSectionProps> = ({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters
}) => {
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

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

  const handleFilterChange = (filterType: keyof FilterCriteria, value: string) => {
    onFilterChange(filterType, value);
  };

  const renderFilterDropdown = (
    filterType: keyof FilterCriteria,
    label: string,
    options: string[],
    selectedValues: string[]
  ) => (
    <FilterGroup>
      <FilterLabel>{label}</FilterLabel>
      <MultiSelect>
        <SelectButton onClick={(e) => {
          e.stopPropagation();
          toggleDropdown(filterType);
        }}>
          {selectedValues.length === 0 ? `All ${label}` : `${selectedValues.length} selected`}
          <FiChevronDown />
        </SelectButton>
        <Dropdown $isOpen={openDropdowns.has(filterType)} onClick={(e) => e.stopPropagation()}>
          {options.map(option => (
            <DropdownItem key={option} onClick={(e) => {
              e.stopPropagation();
              handleFilterChange(filterType, option);
            }}>
              <Checkbox
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={() => {}}
              />
              {option}
            </DropdownItem>
          ))}
        </Dropdown>
      </MultiSelect>
    </FilterGroup>
  );

  return (
    <FilterContainer onClick={closeAllDropdowns}>
      <FilterHeader>
        <FilterTitle>
          <FiFilter />
          Filters
        </FilterTitle>
        <ClearFiltersButton onClick={onClearFilters}>
          <FiRefreshCw />
          Clear All
        </ClearFiltersButton>
      </FilterHeader>
      
      <FilterGrid>
        {renderFilterDropdown('entities', 'Entities', filterOptions.entities, filters.entities)}
        {renderFilterDropdown('dataSubjectTypes', 'Data Subject Types', filterOptions.dataSubjectTypes, filters.dataSubjectTypes)}
        {renderFilterDropdown('transferLocations', 'Transfer Locations', filterOptions.transferLocations, filters.transferLocations)}
        {renderFilterDropdown('recipientTypes', 'Recipient Types', filterOptions.recipientTypes, filters.recipientTypes)}
        {renderFilterDropdown('reviewDataTransferPurposes', 'Review Data Transfer Purposes', filterOptions.reviewDataTransferPurposes, filters.reviewDataTransferPurposes)}
        {renderFilterDropdown('reaffirmationStatuses', 'Reaffirmation Status', filterOptions.reaffirmationStatuses, filters.reaffirmationStatuses)}
      </FilterGrid>
    </FilterContainer>
  );
};

export default FiltersSection;
