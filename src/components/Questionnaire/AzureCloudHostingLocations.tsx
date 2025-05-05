// Virtualized by hosting location, with virtualized table per location
// NOTE: Requires 'react-window' to be installed: npm install react-window
// @ts-ignore: If you see a module not found error, please install 'react-window'.
import React, { useState, useMemo, useRef, useCallback, forwardRef } from 'react';
import styled from 'styled-components';
import { FiChevronDown, FiChevronRight, FiSearch } from 'react-icons/fi';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';

// --- Entity and Category Logic (from EntitySelection/index.tsx) ---
const DATA_CENTERS = [
  { code: 'SAS', name: 'South East Asia (SAS) - Singapore' },
  { code: 'EAS', name: 'East Asia (EAS) - Hong Kong' },
  { code: 'NCH', name: 'Switzerland North (NCH) - Switzerland' }
];

const ENTITY_CATEGORIES = [
  'IB GM', 'IB GB', 'IB', 'GWM', 'NCL', 'AM', 'P&C', 'AM ICC/REPM', 'AM WCC', 'Employee'
] as const;

type EntityCategory = typeof ENTITY_CATEGORIES[number];

const getCategoryDisplayName = (category: EntityCategory): string => {
  switch (category) {
    case 'IB GM': return 'Investment Banking Global Markets';
    case 'IB GB': return 'Investment Banking Global Banking';
    case 'IB': return 'Investment Banking';
    case 'GWM': return 'Global Wealth Management';
    case 'NCL': return 'Non-Core and Legacy';
    case 'AM': return 'Asset Management';
    case 'P&C': return 'Personal & Corporate Banking';
    case 'AM ICC/REPM': return 'Asset Management ICC/REPM';
    case 'AM WCC': return 'Asset Management WCC';
    case 'Employee': return 'Employee';
    default: return category;
  }
};

interface Entity {
  id: string;
  name: string;
  category: EntityCategory;
  countryCode: string;
  description?: string;
}

interface HostingLocationRow {
  id: string;
  location: string;
  entity: string;
  businessDivision: EntityCategory;
  approvalStatus: string;
  conditions: string;
}

// Generate a large set of mock entities (simulate selectedCountries = ['US', 'DE'])
const generateEntities = (countries: string[]): Entity[] => {
  const entities: Entity[] = [];
  countries.forEach(country => {
    ENTITY_CATEGORIES.forEach(category => {
      const count = 20; // Large dataset for perf test
      for (let i = 0; i < count; i++) {
        entities.push({
          id: `${country}-${category}-${i}`,
          name: `${country} ${getCategoryDisplayName(category)} Entity ${i + 1}`,
          category,
          countryCode: country.toUpperCase(),
          description: `${getCategoryDisplayName(category)} services in ${country}`
        });
      }
    });
  });
  return entities;
};

// Generate mock hosting locations for each entity/division
const generateHostingLocations = (entity: Entity) => {
  // Assign each entity to all three data centers
  return DATA_CENTERS.map((dc, i) => {
    const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(4) + `Condition details for ${entity.name} ${entity.category} #${i+1}`;
    return {
      id: `${entity.id}-${entity.category}-loc${i+1}`,
      location: dc.name,
      entity: entity.name,
      businessDivision: entity.category,
      approvalStatus: i % 3 === 0 ? APPROVAL_STATUSES.Approved : i % 3 === 1 ? APPROVAL_STATUSES.Pending : APPROVAL_STATUSES.Rejected,
      conditions: longText,
    };
  });
};

enum APPROVAL_STATUSES {
    Approved = 'Approved',
    Pending = 'Approved with predefined conditions',
    Rejected = 'Not Approved'
};

const ApprovalStatuses = [APPROVAL_STATUSES.Approved, APPROVAL_STATUSES.Pending, APPROVAL_STATUSES.Rejected];

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
  -webkit-appearance: none;
  -moz-appearance: none;
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
const Accordion = styled.div`
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 1px solid #eee;
`;
const AccordionHeader = styled.div<{ expanded: boolean }>`
  background: #f8f8f8;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  border-bottom: 1px solid #eee;
  color: #222;
  transition: background 0.2s;
  &:hover {
    background: #f0f0f0;
  }
`;
const AccordionIcon = styled.span`
  margin-right: 1rem;
  display: flex;
  align-items: center;
`;
const AccordionContent = styled.div`
  background: #fff;
  padding: 1.5rem;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  table-layout: fixed;
`;
const Th = styled.th`
  padding: 0.75rem 1rem;
  background: #f8f8f8;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const Td = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f3f3;
  font-size: 0.95rem;
  vertical-align: top;
  word-break: break-word;
  overflow-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  &.entity {
    width: 38%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 0;
  }
  &.division { width: 12%; text-align: center; }
  &.status { width: 24%; text-align: center; }
  &.conditions { width: 26%; }
`;
const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  background: ${({ status }) =>
    status === APPROVAL_STATUSES.Approved ? '#d1fae5' : status === APPROVAL_STATUSES.Pending ? '#fef3c7' : '#fee2e2'};
  color: ${({ status }) =>
    status === APPROVAL_STATUSES.Approved ? '#065f46' : status === APPROVAL_STATUSES.Pending ? '#92400e' : '#991b1b'};
  font-weight: 500;
  white-space: normal;
  word-break: break-word;
  text-align: center;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: #fff;
  border-radius: 10px;
  max-width: 600px;
  width: 90vw;
  max-height: 80vh;
  padding: 2rem;
  box-shadow: 0 4px 32px rgba(0,0,0,0.15);
  overflow-y: auto;
  position: relative;
`;
const ModalClose = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #888;
  cursor: pointer;
`;

// --- Debounce Hook ---
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const COLLAPSED_ROW_HEIGHT = 64;
const TABLE_HEADER_HEIGHT = 48;
const TABLE_ROW_HEIGHT = 56;
const MAX_VISIBLE_ROWS = 8;

// Helper for react-window to render tbody
const TBody = forwardRef<HTMLTableSectionElement, React.HTMLProps<HTMLTableSectionElement>>((props, ref) => (
  <tbody ref={ref} {...props} />
));
TBody.displayName = 'TBody';

const AzureCloudHostingLocations: React.FC = () => {
  // Simulate selected countries (could be from context/props)
  const selectedCountries = ['US', 'DE'];
  const allEntities = useMemo(() => generateEntities(selectedCountries), [selectedCountries]);

  // Flatten all hosting locations
  const allHostingRows: HostingLocationRow[] = useMemo(() => {
    return allEntities.flatMap(entity => generateHostingLocations(entity));
  }, [allEntities]);

  // Filters
  const [locationFilter, setLocationFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modalCondition, setModalCondition] = useState<string | null>(null);

  // Unique options for filters
  const locationOptions = useMemo(() => Array.from(new Set(allHostingRows.map(r => r.location))), [allHostingRows]);
  const entityOptions = useMemo(() => Array.from(new Set(allHostingRows.map(r => r.entity))), [allHostingRows]);

  // Group by unique hosting location string
  const groupedByLocation = useMemo(() => {
    // Apply filters and search
    let filtered = allHostingRows.filter(row =>
      (!locationFilter || row.location === locationFilter) &&
      (!entityFilter || row.entity === entityFilter) &&
      (!divisionFilter || row.businessDivision === divisionFilter) &&
      (!statusFilter || row.approvalStatus === statusFilter) &&
      (!debouncedSearch ||
        row.location.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        row.entity.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        getCategoryDisplayName(row.businessDivision).toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        row.conditions.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    );
    // Group by location
    const map = new Map<string, HostingLocationRow[]>();
    filtered.forEach(row => {
      if (!map.has(row.location)) map.set(row.location, []);
      map.get(row.location)!.push(row);
    });
    return Array.from(map.entries());
  }, [allHostingRows, locationFilter, entityFilter, divisionFilter, statusFilter, debouncedSearch]);

  // --- VariableSizeList for dynamic row heights ---
  const listRef = useRef<List>(null);
  const getItemSize = useCallback((index: number) => {
    const [location, rows] = groupedByLocation[index];
    if (expanded === location) {
      // Expanded: header + min(visible, total) rows + padding
      const visibleRows = Math.min(MAX_VISIBLE_ROWS, rows.length);
      return COLLAPSED_ROW_HEIGHT + TABLE_HEADER_HEIGHT + visibleRows * TABLE_ROW_HEIGHT + 24;
    }
    return COLLAPSED_ROW_HEIGHT;
  }, [groupedByLocation, expanded]);

  // Calculate total height so all data centers are visible when one is expanded
  const totalListHeight = useMemo(() => {
    return groupedByLocation.reduce((sum, _, idx) => sum + getItemSize(idx), 0);
  }, [groupedByLocation, getItemSize]);

  // --- Render ---
  return (
    <Container>
      <h2 style={{ marginBottom: '1.5rem' }}>Azure Cloud Hosting Locations</h2>
      <FilterBar>
        <FilterSelect
          value={locationFilter}
          onChange={e => setLocationFilter(e.target.value)}
        >
          <option value="">All Locations</option>
          {locationOptions.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </FilterSelect>
        <FilterSelect
          value={entityFilter}
          onChange={e => setEntityFilter(e.target.value)}
        >
          <option value="">All Entities</option>
          {entityOptions.map(entity => (
            <option key={entity} value={entity}>{entity}</option>
          ))}
        </FilterSelect>
        <FilterSelect
          value={divisionFilter}
          onChange={e => setDivisionFilter(e.target.value as EntityCategory)}
        >
          <option value="">All Business Divisions</option>
          {ENTITY_CATEGORIES.map(div => (
            <option key={div} value={div}>{getCategoryDisplayName(div)}</option>
          ))}
        </FilterSelect>
        <FilterSelect
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Approval Statuses</option>
          {ApprovalStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </FilterSelect>
        <SearchBar>
          <SearchIcon />
          <SearchInput
            placeholder="Search locations, entities, conditions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <ClearButton onClick={() => setSearch(' ')} title="Clear search">&times;</ClearButton>
          )}
        </SearchBar>
      </FilterBar>
      {groupedByLocation.length === 0 && (
        <div style={{ padding: '2rem', color: '#888' }}>No results found.</div>
      )}
      <List
        ref={listRef}
        height={totalListHeight}
        itemCount={groupedByLocation.length}
        itemSize={getItemSize}
        width={"100%"}
        style={{ border: 'none', background: 'transparent' }}
      >
        {({ index, style }: ListChildComponentProps) => {
          const [location, rows] = groupedByLocation[index];
          const isOpen = expanded === location;
          const visibleRows = Math.min(MAX_VISIBLE_ROWS, rows.length);
          return (
            <div style={{ ...style, zIndex: isOpen ? 1 : 0 }} key={location}>
              <Accordion>
                <AccordionHeader
                  expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : location)}
                >
                  <AccordionIcon>
                    {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                  </AccordionIcon>
                  {location}
                </AccordionHeader>
                {isOpen && (
                  <AccordionContent>
                    <Table>
                      <thead>
                        <tr>
                          <Th style={{ width: '28%' }}>Entity</Th>
                          <Th style={{ width: '12%' }}>Division</Th>
                          <Th style={{ width: '24%' }}>Approval Status</Th>
                          <Th style={{ width: '36%' }}>Conditions</Th>
                        </tr>
                      </thead>
                      <List
                        height={visibleRows * TABLE_ROW_HEIGHT + 2}
                        itemCount={rows.length}
                        itemSize={() => TABLE_ROW_HEIGHT}
                        width={"100%"}
                        outerElementType={TBody}
                        innerElementType={React.Fragment}
                        style={{ border: 'none', background: 'transparent' }}
                      >
                        {({ index }: ListChildComponentProps) => {
                          const row = rows[index];
                          return (
                            <tr key={row.id}>
                              <Td className="entity" title={row.entity}>{row.entity}</Td>
                              <Td className="division">{row.businessDivision}</Td>
                              <Td className="status">
                                <StatusBadge status={row.approvalStatus}>{row.approvalStatus}</StatusBadge>
                              </Td>
                              <Td className="conditions">
                                {row.approvalStatus === APPROVAL_STATUSES.Pending ? (
                                  <span style={{ color: '#0070f3', cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={() => setModalCondition(row.conditions)}>
                                    View
                                  </span>
                                ) : (
                                  <span style={{ color: '#bbb' }}>—</span>
                                )}
                              </Td>
                            </tr>
                          );
                        }}
                      </List>
                    </Table>
                    {modalCondition && (
                      <ModalOverlay onClick={() => setModalCondition(null)}>
                        <ModalContent onClick={e => e.stopPropagation()}>
                          <ModalClose onClick={() => setModalCondition(null)}>&times;</ModalClose>
                          <h3>Conditions</h3>
                          <div style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{modalCondition}</div>
                        </ModalContent>
                      </ModalOverlay>
                    )}
                  </AccordionContent>
                )}
              </Accordion>
            </div>
          );
        }}
      </List>
    </Container>
  );
};

export default AzureCloudHostingLocations; 