import React, { useState } from 'react';
import styled from 'styled-components';
import Flag from 'react-world-flags';
import { REGIONS, COUNTRIES_DATA } from './Questionnaire.data';
import { FiChevronDown, FiChevronRight, FiX } from 'react-icons/fi';

const RegionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  flex: 1;
  overflow-x: auto;
  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-track { background: #f1f1f1; }
  &::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
`;
const RegionChip = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 2px solid ${props => props.selected ? '#000' : '#eee'};
  border-radius: 20px;
  background: ${props => props.selected ? '#f8f8f8' : 'white'};
  color: ${props => props.selected ? '#000' : '#666'};
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  &:hover {
    border-color: #000;
    background: #f8f8f8;
    color: #000;
  }
`;
const CountBadge = styled.span`
  background: #000;
  color: white;
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  margin-left: 0.5rem;
`;
const SearchContainer = styled.div`
  flex-shrink: 0;
  width: 300px;
  margin-left: 1rem;
`;
const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  height: 36px;
  &:focus { outline: none; border-color: #000; }
  &::placeholder { color: #999; }
`;
const CountryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  width: 100%;
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  align-content: start;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
  &::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
`;
const CountryOption = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: 2px solid ${props => props.selected ? '#000' : '#eee'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.selected ? '#f8f8f8' : 'white'};
  height: 60px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  &:hover {
    border-color: #000;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;
const FlagContainer = styled.div`
  width: 30px;
  height: 20px;
  overflow: hidden;
  border-radius: 2px;
  flex-shrink: 0;
  img { width: 100%; height: 100%; object-fit: cover; }
`;
const CountryInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  flex: 1;
`;
const CountryName = styled.span`
  font-weight: 500;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const CountryRegion = styled.span`
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const ErrorMessage = styled.p`
  color: #000;
  margin-top: 0.5rem;
`;

const SelectedCountriesSection = styled.div`
  margin-bottom: 1.5rem;
  background: #f8f8f8;
  border-radius: 12px;
  overflow: hidden;
`;
const SelectedCountriesHeader = styled.div<{ isExpanded: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: ${props => props.isExpanded ? '#f0f0f0' : '#f8f8f8'};
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover { background: #f0f0f0; }
`;
const SelectedCountriesTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
`;
const SelectedCountriesContent = styled.div<{ isExpanded: boolean }>`
  padding: ${props => props.isExpanded ? '0.75rem' : '0'};
  max-height: ${props => props.isExpanded ? '250px' : '0'};
  overflow: auto;
  transition: all 0.3s ease-in-out;
`;
const SelectedCountriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
`;
const SelectedCountryCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1.5px solid #000;
  border-radius: 8px;
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #222;
  cursor: pointer;
  transition: background 0.2s, border 0.2s;
  &:hover {
    background: #ffeaea;
    border-color: #d00;
    color: #d00;
  }
`;
const NoCountries = styled.div`
  text-align: center;
  color: #666;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
`;
const CardFlag = styled.span`
  display: inline-block;
  width: 22px;
  height: 15px;
  margin-right: 0.5rem;
  border-radius: 3px;
  overflow: hidden;
`;
const CardSpacer = styled.span`
  flex: 1;
`;

interface CountrySelectorProps {
  selectedCountries: string[];
  onChange: (selected: string[]) => void;
  error?: boolean;
  disabled?: boolean;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ selectedCountries, onChange, error, disabled }) => {
  const regionKeys = Object.keys(REGIONS) as (keyof typeof REGIONS)[];
  const [selectedRegion, setSelectedRegion] = useState<keyof typeof REGIONS>(regionKeys[0]);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [isSelectedExpanded, setIsSelectedExpanded] = useState(false);

  const regionCountries = COUNTRIES_DATA[selectedRegion];
  const filteredCountries = regionCountries.filter(country =>
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );
  const sortedCountries = [...filteredCountries].sort((a, b) => {
    const aSelected = selectedCountries.includes(a.name);
    const bSelected = selectedCountries.includes(b.name);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  const handleCountryToggle = (countryName: string) => {
    if (disabled) return;
    if (selectedCountries.includes(countryName)) {
      onChange(selectedCountries.filter(name => name !== countryName));
    } else {
      onChange([...selectedCountries, countryName]);
    }
  };

  // Gather all selected country objects from all regions
  const allCountries = Object.values(COUNTRIES_DATA).flat();
  const selectedCountryObjs = allCountries.filter(c => selectedCountries.includes(c.name));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Expandable selected countries section */}
      <SelectedCountriesSection>
        <SelectedCountriesHeader
          isExpanded={isSelectedExpanded}
          onClick={() => setIsSelectedExpanded(exp => !exp)}
        >
          <SelectedCountriesTitle>
            {isSelectedExpanded ? <FiChevronDown /> : <FiChevronRight />}
            Selected Countries ({selectedCountryObjs.length})
          </SelectedCountriesTitle>
        </SelectedCountriesHeader>
        <SelectedCountriesContent isExpanded={isSelectedExpanded}>
          {selectedCountryObjs.length > 0 ? (
            <SelectedCountriesGrid>
              {selectedCountryObjs.map(country => (
                <SelectedCountryCard
                  key={country.code}
                  title={`Remove ${country.name}`}
                >
                  <CardFlag><Flag code={country.code} /></CardFlag>
                  {country.name}
                  <CardSpacer />
                  <FiX style={{ marginLeft: 8, cursor: 'pointer' }} onClick={() => handleCountryToggle(country.name)} />
                </SelectedCountryCard>
              ))}
            </SelectedCountriesGrid>
          ) : (
            <NoCountries>No countries selected</NoCountries>
          )}
        </SelectedCountriesContent>
      </SelectedCountriesSection>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <RegionsContainer>
          {regionKeys.map((key) => (
            <RegionChip
              key={key}
              selected={selectedRegion === key}
              onClick={() => setSelectedRegion(key)}
              type="button"
              disabled={disabled}
            >
              {REGIONS[key]}
              <CountBadge>
                {COUNTRIES_DATA[key].length}
              </CountBadge>
            </RegionChip>
          ))}
        </RegionsContainer>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search countries..."
            value={countrySearchTerm}
            onChange={(e) => setCountrySearchTerm(e.target.value)}
            disabled={disabled}
          />
        </SearchContainer>
      </div>
      <CountryGrid>
        {sortedCountries.map(country => (
          <CountryOption
            key={country.code}
            selected={selectedCountries.includes(country.name)}
            onClick={() => handleCountryToggle(country.name)}
            style={disabled ? { pointerEvents: 'none', opacity: 0.6 } : {}}
            tabIndex={0}
            role="button"
            aria-pressed={selectedCountries.includes(country.name)}
          >
            <FlagContainer>
              <Flag code={country.code} />
            </FlagContainer>
            <CountryInfo>
              <CountryName>{country.name}</CountryName>
              <CountryRegion>{country.region}</CountryRegion>
            </CountryInfo>
          </CountryOption>
        ))}
      </CountryGrid>
      {error && <ErrorMessage>Please select at least one country</ErrorMessage>}
    </div>
  );
};

export default CountrySelector; 