import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FiChevronDown, FiChevronRight, FiSearch } from 'react-icons/fi';

// --- Mock Data Types ---
interface AccessLocationRecord {
  id: string;
  country: string;
  countryCode: string;
  businessDivision: string;
  entity: string;
  exposureAllowedTo: string[];
}

// --- Mock Data ---
const MOCK_ACCESS_LOCATIONS: AccessLocationRecord[] = [
  {
    id: '1',
    country: 'Germany',
    countryCode: 'DE',
    businessDivision: 'Wealth',
    entity: 'DE Wealth Entity 1',
    exposureAllowedTo: ['France', 'United Kingdom', 'United States'],
  },
  {
    id: '2',
    country: 'Germany',
    countryCode: 'DE',
    businessDivision: 'Banking',
    entity: 'DE Banking Entity 2',
    exposureAllowedTo: ['Switzerland', 'United States'],
  },
  {
    id: '3',
    country: 'France',
    countryCode: 'FR',
    businessDivision: 'Wealth',
    entity: 'FR Wealth Entity 1',
    exposureAllowedTo: ['Germany', 'United Kingdom'],
  },
  {
    id: '4',
    country: 'United Kingdom',
    countryCode: 'GB',
    businessDivision: 'Insurance',
    entity: 'UK Insurance Entity 1',
    exposureAllowedTo: ['France', 'Germany'],
  },
  // ...add more mock records for demonstration
];

// --- Styled Components ---
const Container = styled.div`
  padding: 2rem;
  background: #fff;
  min-height: 100vh;
`;
const FilterBar = styled.div`
  display: flex;
  gap: 1.25rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
  background: #f6f8fa;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
`;
const FilterSelect = styled.select`
  padding: 0.6rem 2.2rem 0.6rem 1.2rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: border 0.2s, box-shadow 0.2s;
  outline: none;
  color: #222;
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg fill="%23666" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 0.8rem center;
  background-size: 1.1rem;
  &:hover, &:focus {
    border-color: #0070f3;
    box-shadow: 0 2px 8px rgba(0,112,243,0.08);
  }
`;
const SearchBar = styled.div`
  position: relative;
  width: 260px;
  min-width: 200px;
  display: flex;
  align-items: center;
`;
const SearchInput = styled.input`
  width: 100%;
  padding: 0.6rem 2.5rem 0.6rem 2.5rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: border 0.2s, box-shadow 0.2s;
  outline: none;
  &:hover, &:focus {
    border-color: #0070f3;
    box-shadow: 0 2px 8px rgba(0,112,243,0.08);
  }
`;
const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 1.2rem;
`;
const ClearButton = styled.button`
  position: absolute;
  right: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0;
  &:hover {
    color: #0070f3;
  }
`;
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
`;
const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 900px;
`;
const Th = styled.th`
  position: sticky;
  top: 0;
  background: #f6f8fa;
  z-index: 2;
  padding: 1rem 0.7rem;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #eee;
  text-align: left;
`;
const Td = styled.td`
  padding: 0.9rem 0.7rem;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
  vertical-align: top;
  font-size: 1rem;
`;
const Tr = styled.tr`
  transition: background 0.15s;
  &:hover {
    background: #f6f8fa;
  }
`;
const ExpandTd = styled.td`
  width: 48px;
  text-align: center;
  cursor: pointer;
  background: #fff;
`;
const Badge = styled.span`
  display: inline-block;
  background:rgb(246, 210, 210);
  color:rgb(6, 3, 3);
  border-radius: 12px;
  padding: 0.2rem 0.7rem;
  font-size: 0.95rem;
  margin-right: 0.4rem;
  margin-bottom: 0.2rem;
`;
const BadgeScrollContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 0.4rem;
  max-width: 340px;
  padding-bottom: 2px;
  scrollbar-width: thin;
  scrollbar-color: #e0e0e0 #fff;
  &::-webkit-scrollbar {
    height: 6px;
    background: #fff;
  }
  &::-webkit-scrollbar-thumb {
    background: #e0e0e0;
    border-radius: 4px;
  }
`;
const Flag = styled.span<{ code: string }>`
  display: inline-block;
  width: 24px;
  height: 16px;
  background: url('https://purecatamphetamine.github.io/country-flag-icons/3x2/{code}.svg') no-repeat center center/cover;
  margin-right: 0.5rem;
  vertical-align: middle;
`;

// --- Helper to get all unique options ---
const getUnique = (arr: string[]) => Array.from(new Set(arr));

const AccessLocations: React.FC = () => {
  // --- Filter State ---
  const [country, setCountry] = useState('');
  const [division, setDivision] = useState('');
  const [entity, setEntity] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  // --- Filtered Data ---
  const filtered = useMemo(() => {
    let data = MOCK_ACCESS_LOCATIONS;
    if (country) data = data.filter(r => r.country === country);
    if (division) data = data.filter(r => r.businessDivision === division);
    if (entity) data = data.filter(r => r.entity === entity);
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(r =>
        r.country.toLowerCase().includes(s) ||
        r.businessDivision.toLowerCase().includes(s) ||
        r.entity.toLowerCase().includes(s) ||
        r.id.toLowerCase().includes(s) ||
        r.exposureAllowedTo.some(e => e.toLowerCase().includes(s))
      );
    }
    return data;
  }, [country, division, entity, search]);

  // --- Unique Filter Options ---
  const countryOptions = useMemo(() => getUnique(MOCK_ACCESS_LOCATIONS.map(r => r.country)), []);
  const divisionOptions = useMemo(() => getUnique(MOCK_ACCESS_LOCATIONS.map(r => r.businessDivision)), []);
  const entityOptions = useMemo(() => getUnique(MOCK_ACCESS_LOCATIONS.map(r => r.entity)), []);

  // --- Render ---
  return (
    <Container>
      <FilterBar>
        <FilterSelect value={country} onChange={e => setCountry(e.target.value)}>
          <option value="">All Countries</option>
          {countryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </FilterSelect>
        <FilterSelect value={division} onChange={e => setDivision(e.target.value)}>
          <option value="">All Divisions</option>
          {divisionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </FilterSelect>
        <FilterSelect value={entity} onChange={e => setEntity(e.target.value)}>
          <option value="">All Entities</option>
          {entityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </FilterSelect>
        <SearchBar>
          <SearchIcon />
          <SearchInput
            placeholder="Quick search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <ClearButton onClick={() => setSearch('')} title="Clear search">&times;</ClearButton>
          )}
        </SearchBar>
      </FilterBar>
      <TableContainer>
        <StyledTable>
          <thead>
            <tr>
              <Th>Country</Th>
              <Th>Business Division</Th>
              <Th>ID</Th>
              <Th>Entity</Th>
              <Th>Exposure Allowed To</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <Tr key={row.id}>
                <Td><Flag code={row.countryCode} />{row.country}</Td>
                <Td>{row.businessDivision}</Td>
                <Td>{row.id}</Td>
                <Td>{row.entity}</Td>
                <Td>
                  {row.exposureAllowedTo.length > 0 && (
                    <span>{row.exposureAllowedTo.join(', ')}</span>
                  )}
                </Td>
                <ExpandTd />
              </Tr>
            ))}
            {filtered.length === 0 && (
              <Tr>
                <Td colSpan={6} style={{ color: '#888', padding: '2rem' }}>
                  No records found.
                </Td>
              </Tr>
            )}
          </tbody>
        </StyledTable>
      </TableContainer>
    </Container>
  );
};

export default AccessLocations; 