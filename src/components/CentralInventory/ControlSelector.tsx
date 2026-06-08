import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FiSearch, FiX } from 'react-icons/fi';
import { ControlMetadata, ControlType, getAllControls } from '../../services/controlService';
import { colors, spacing, borderRadius, shadows } from '../../styles/designTokens';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const SearchRow = styled.div`
  display: flex;
  gap: ${spacing.md};
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${colors.text.tertiary};
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${spacing.sm} ${spacing.md} ${spacing.sm} 2.4rem;
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.9rem;
  color: ${colors.text.primary};
  background: white;
  transition: all 0.2s ease;

  &::placeholder {
    color: ${colors.text.tertiary};
  }

  &:focus {
    outline: none;
    border-color: ${colors.status.underReview};
    box-shadow: 0 0 0 3px ${colors.status.underReview}15;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: ${spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${colors.text.tertiary};
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  display: flex;
  align-items: center;

  &:hover {
    color: ${colors.text.secondary};
    background: ${colors.neutral.gray100};
  }
`;

const FilterChips = styled.div`
  display: flex;
  gap: ${spacing.sm};
  flex-wrap: wrap;
`;

const FilterChip = styled.button<{ $active: boolean }>`
  padding: ${spacing.xs} ${spacing.md};
  border-radius: ${borderRadius.full};
  border: 1px solid ${props => (props.$active ? colors.neutral.black : colors.neutral.gray300)};
  background: ${props => (props.$active ? colors.neutral.black : 'white')};
  color: ${props => (props.$active ? 'white' : colors.text.secondary)};
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${colors.neutral.black};
  }

  &:focus-visible {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
  }
`;

const ResultCount = styled.div`
  font-size: 0.8rem;
  color: ${colors.text.tertiary};
`;

const ControlsGrid = styled.div`
  display: grid;
  width: 100%;
  /* auto-fit collapses empty tracks so few cards span the row; auto-fill leaves ghost columns */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: ${spacing.md};
`;

const ControlCard = styled.button<{ $selected: boolean }>`
  position: relative;
  text-align: left;
  padding: ${spacing.lg};
  border-radius: ${borderRadius.lg};
  border: 2px solid ${props => (props.$selected ? colors.status.underReview : colors.neutral.gray200)};
  background: ${props => (props.$selected ? `${colors.status.underReview}08` : 'white')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${colors.status.underReview};
    box-shadow: ${shadows.sm};
  }

  &:focus-visible {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
  }
`;

const SelectedIndicator = styled.span`
  position: absolute;
  top: ${spacing.sm};
  right: ${spacing.sm};
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${colors.status.underReview};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
`;

const ControlTypeBadge = styled.span<{ $type: ControlType }>`
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: ${borderRadius.base};
  margin-bottom: ${spacing.sm};
  ${props => {
    switch (props.$type) {
      case 'MER':
        return `background: ${colors.status.underReview}18; color: ${colors.status.underReview};`;
      case 'EUC':
        return `background: ${colors.status.approved}18; color: ${colors.status.approved};`;
      default:
        return `background: ${colors.neutral.gray200}; color: ${colors.text.secondary};`;
    }
  }}
`;

const ControlId = styled.div`
  font-size: 0.78rem;
  font-weight: 700;
  color: ${colors.text.secondary};
  margin-bottom: 2px;
`;

const ControlName = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.xs};
`;

const ControlManager = styled.div`
  font-size: 0.8rem;
  color: ${colors.text.tertiary};
`;

const EmptyState = styled.div`
  padding: ${spacing['2xl']};
  text-align: center;
  color: ${colors.text.tertiary};
  font-size: 0.9rem;
  background: ${colors.neutral.gray50};
  border-radius: ${borderRadius.lg};
  border: 1px dashed ${colors.neutral.gray300};
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
  align-items: center;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: 4px 10px;
  border-radius: ${borderRadius.full};
  background: ${colors.neutral.gray100};
  border: 1px solid ${colors.neutral.gray200};
  font-size: 0.78rem;
  font-weight: 600;
  color: ${colors.text.primary};
`;

const ChipRemove = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0 2px;
  color: ${colors.text.tertiary};
  line-height: 1;
  &:hover {
    color: ${colors.semantic.error};
  }
`;

const RecentRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
  align-items: center;
`;

const RecentLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${colors.text.tertiary};
`;

const RecentChip = styled.button`
  padding: 4px 10px;
  border-radius: ${borderRadius.full};
  border: 1px dashed ${colors.neutral.gray300};
  background: white;
  font-size: 0.78rem;
  cursor: pointer;
  color: ${colors.text.secondary};
  &:hover {
    border-color: ${colors.status.underReview};
    color: ${colors.status.underReview};
  }
`;

const TYPE_LABELS: Record<string, string> = {
  All: 'All',
  MER: 'MER',
  EUC: 'EUC',
  'Third Party Controls': 'Third Party',
};

export type ControlSelectorMode = 'mer-multi' | 'mixed-multi';

interface ControlSelectorProps {
  mode: ControlSelectorMode;
  selectedControls: ControlMetadata[];
  onSelectionChange: (controls: ControlMetadata[]) => void;
  recentControls?: ControlMetadata[];
}

const ControlSelector: React.FC<ControlSelectorProps> = ({
  mode,
  selectedControls,
  onSelectionChange,
  recentControls = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<ControlType | 'All'>('All');

  const controls = getAllControls();
  const allTypes: Array<ControlType | 'All'> = ['All', 'MER', 'EUC', 'Third Party Controls'];

  const filteredControls = useMemo(() => {
    return controls.filter(control => {
      if (mode === 'mer-multi' && control.controlType !== 'MER') return false;
      const matchesType = activeTypeFilter === 'All' || control.controlType === activeTypeFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        control.controlId.toLowerCase().includes(query) ||
        control.applicationName.toLowerCase().includes(query) ||
        control.applicationManager.toLowerCase().includes(query) ||
        control.controlType.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  }, [controls, searchQuery, activeTypeFilter, mode]);

  const isSelected = (c: ControlMetadata) => selectedControls.some(x => x.controlId === c.controlId);

  const toggleControl = (control: ControlMetadata) => {
    if (mode === 'mer-multi') {
      if (isSelected(control)) {
        onSelectionChange(selectedControls.filter(x => x.controlId !== control.controlId));
      } else {
        onSelectionChange([...selectedControls, control]);
      }
      return;
    }
    if (control.controlType !== 'MER') {
      onSelectionChange([control]);
      return;
    }
    const onlyMer = selectedControls.length > 0 && selectedControls.every(c => c.controlType === 'MER');
    if (selectedControls.length === 0 || onlyMer) {
      if (isSelected(control)) {
        onSelectionChange(selectedControls.filter(x => x.controlId !== control.controlId));
      } else {
        onSelectionChange([...selectedControls, control]);
      }
    } else {
      onSelectionChange([control]);
    }
  };

  const removeChip = (controlId: string) => {
    onSelectionChange(selectedControls.filter(c => c.controlId !== controlId));
  };

  return (
    <Container>
      {selectedControls.length > 0 && (
        <ChipRow aria-label="Selected controls">
          {selectedControls.map(c => (
            <Chip key={c.controlId}>
              {c.controlId}
              <ChipRemove
                type="button"
                aria-label={`Remove ${c.controlId}`}
                onClick={() => removeChip(c.controlId)}
              >
                <FiX size={14} />
              </ChipRemove>
            </Chip>
          ))}
        </ChipRow>
      )}

      {recentControls.length > 0 && (
        <RecentRow>
          <RecentLabel>Recently used</RecentLabel>
          {recentControls.map(c => (
            <RecentChip key={c.controlId} type="button" onClick={() => toggleControl(c)}>
              {c.controlId}
            </RecentChip>
          ))}
        </RecentRow>
      )}

      <SearchRow>
        <SearchInputWrapper>
          <SearchIcon>
            <FiSearch size={15} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search by ID, application name, or manager..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search controls"
          />
          {searchQuery && (
            <ClearButton onClick={() => setSearchQuery('')} aria-label="Clear search">
              <FiX size={14} />
            </ClearButton>
          )}
        </SearchInputWrapper>

        <FilterChips role="group" aria-label="Filter by type">
          {allTypes.map(type => (
            <FilterChip
              key={type}
              $active={activeTypeFilter === type}
              onClick={() => setActiveTypeFilter(type)}
              aria-pressed={activeTypeFilter === type}
            >
              {TYPE_LABELS[type] || type}
            </FilterChip>
          ))}
        </FilterChips>
      </SearchRow>

      <ResultCount aria-live="polite">
        {filteredControls.length === controls.length
          ? `${filteredControls.length} controls available`
          : `Showing ${filteredControls.length} matching controls`}
      </ResultCount>

      {filteredControls.length === 0 ? (
        <EmptyState>
          No controls match your search. Try adjusting the filters.
        </EmptyState>
      ) : (
        <ControlsGrid role="list">
          {filteredControls.map(control => (
            <ControlCard
              key={control.controlId}
              $selected={isSelected(control)}
              onClick={() => toggleControl(control)}
              type="button"
              role="listitem"
              aria-pressed={isSelected(control)}
            >
              {isSelected(control) && <SelectedIndicator aria-hidden="true">✓</SelectedIndicator>}
              <ControlTypeBadge $type={control.controlType}>{control.controlType}</ControlTypeBadge>
              <ControlId>{control.controlId}</ControlId>
              <ControlName>{control.applicationName}</ControlName>
              <ControlManager>Manager: {control.applicationManager}</ControlManager>
            </ControlCard>
          ))}
        </ControlsGrid>
      )}
    </Container>
  );
};

export default ControlSelector;
