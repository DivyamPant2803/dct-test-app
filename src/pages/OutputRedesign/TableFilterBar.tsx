import React from 'react';
import Select from 'react-select';

const filterBarStyle = {
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'center',
  padding: '1.25rem 1.5rem 0.5rem 1.5rem',
  background: '#fafafa',
  borderBottom: '1px solid #f0f0f0',
  zIndex: 2,
};

const filterSelectStyle = {
  minWidth: 180,
  fontSize: '0.95rem',
  borderRadius: 8,
  background: 'white',
  border: '1px solid #e5e5e5',
};

export interface FilterOption {
  value: string;
  label: string;
}

export interface TableFilterBarProps {
  entityNameOptions: FilterOption[];
  countryOptions: FilterOption[];
  outputOptions: FilterOption[];
  entityNameFilter: FilterOption[];
  countryFilter: FilterOption[];
  outputFilter: FilterOption[];
  onEntityNameFilterChange: (value: FilterOption[]) => void;
  onCountryFilterChange: (value: FilterOption[]) => void;
  onOutputFilterChange: (value: FilterOption[]) => void;
}

const TableFilterBar: React.FC<TableFilterBarProps> = ({
  entityNameOptions,
  countryOptions,
  outputOptions,
  entityNameFilter,
  countryFilter,
  outputFilter,
  onEntityNameFilterChange,
  onCountryFilterChange,
  onOutputFilterChange,
}) => {
  return (
    <div style={filterBarStyle}>
      <div style={{ minWidth: 220 }}>
        <Select
          isMulti
          options={entityNameOptions}
          value={entityNameFilter}
          onChange={value => onEntityNameFilterChange(value as FilterOption[])}
          placeholder="Filter Entity Name"
          styles={{
            control: (base) => ({ ...base, ...filterSelectStyle }),
            menu: (base) => ({ ...base, zIndex: 10 }),
          }}
        />
      </div>
      <div style={{ minWidth: 180 }}>
        <Select
          isMulti
          options={countryOptions}
          value={countryFilter}
          onChange={value => onCountryFilterChange(value as FilterOption[])}
          placeholder="Filter Country"
          styles={{
            control: (base) => ({ ...base, ...filterSelectStyle }),
            menu: (base) => ({ ...base, zIndex: 10 }),
          }}
        />
      </div>
      <div style={{ minWidth: 140 }}>
        <Select
          isMulti
          options={outputOptions}
          value={outputFilter}
          onChange={value => onOutputFilterChange(value as FilterOption[])}
          placeholder="Filter Output"
          styles={{
            control: (base) => ({ ...base, ...filterSelectStyle }),
            menu: (base) => ({ ...base, zIndex: 10 }),
          }}
        />
      </div>
    </div>
  );
};

export default TableFilterBar; 