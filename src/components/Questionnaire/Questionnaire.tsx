import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import Flag from 'react-world-flags';
import debounce from 'lodash/debounce';
import { RECIPIENT_TYPES } from '../../types';
import { fetchEntitiesForCountry, groupEntitiesByCategory, searchEntities } from '../../services/entityService';
import EntitySelection from '../../components/EntitySelection/index';
import ReviewDataTransferPurpose from '../../components/ReviewDataTransferPurpose';
import { INITIAL_FORM_DATA, FormData } from '../../App';
import type { Entity } from '../../types';

const Form = styled.form`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: white;
`;

const TabsContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 280px;
  min-width: 280px;
  background: #f8f8f8;
  border-right: 1px solid #eee;
  overflow-y: auto;
  flex-shrink: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 3px;
  }
`;

const TabGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const TabGroupHeader = styled.div<{ isExpanded: boolean }>`
  padding: 1rem 1.5rem;
  background: #f0f0f0;
  font-weight: 500;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s ease;

  &:hover {
    background: #e8e8e8;
  }
`;

const TabGroupContent = styled.div<{ isExpanded: boolean }>`
  display: ${props => props.isExpanded ? 'flex' : 'none'};
  flex-direction: column;
`;

const StepNumber = styled.span<{ status: 'completed' | 'current' | 'pending' }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.status === 'pending' ? '#999' : props.status === 'completed' ? '#fff' : '#000'};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
`;

const ProgressIndicator = styled.div<{ status: 'completed' | 'current' | 'pending' }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  position: relative;
  margin-right: 16px;
  flex-shrink: 0;
  background: ${props => {
    switch (props.status) {
      case 'completed':
        return '#000';
      case 'current':
        return '#fff';
      default:
        return '#fff';
    }
  }};
  border: ${props => {
    switch (props.status) {
      case 'completed':
        return '2px solid #000';
      case 'current':
        return '2px solid #000';
      default:
        return '2px solid #ddd';
    }
  }};
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    border: 2px solid transparent;
    transition: all 0.3s ease;
  }

  ${props => props.status === 'current' && `
    &::before {
      border-color: rgba(0, 0, 0, 0.1);
      transform: scale(1.2);
    }
  `}
`;

const Tab = styled.button.attrs<{ isActive: boolean; disabled: boolean; isNextEnabled: boolean }>(props => ({
  type: 'button',
  'aria-selected': props.isActive,
  'data-next-enabled': props.isNextEnabled,
}))`
  padding: 1.25rem 1.5rem;
  border: none;
  background: ${props => props.isActive ? 'white' : 'transparent'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-weight: ${props => props.isActive ? '600' : 'normal'};
  color: ${props => {
    if (props.disabled) return '#ccc';
    if (props.isNextEnabled) return '#000';
    return props.isActive ? '#000' : '#666';
  }};
  border-left: 4px solid ${props => {
    if (props.disabled) return 'transparent';
    if (props.isActive) return '#000';
    if (props.isNextEnabled) return 'rgba(0, 0, 0, 0.2)';
    return 'transparent';
  }};
  transition: all 0.3s ease;
  text-align: left;
  position: relative;
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  min-height: 56px;

  &:hover {
    background: ${props => props.disabled ? 'transparent' : 'white'};
    color: ${props => props.disabled ? '#ccc' : '#000'};
  }

  ${props => props.isActive && !props.disabled && `
    &:hover ${ProgressIndicator}::before {
      transform: scale(1.3);
    }
  `}
`;

const ContentContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
  width: calc(100% - 280px);
`;

const QuestionContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  overflow-y: auto;
  width: 100%;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 4px;
  }
`;

const QuestionText = styled.h3`
  color: black;
  margin: 0 0 2rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  flex-shrink: 0;
`;

const OptionsContainer = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1rem;
  width: 100%;
  padding: 0;
  margin: 0;

  @media (min-width: 1920px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const OptionPanel = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border: 2px solid ${props => props.selected ? '#000' : '#eee'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.selected ? '#f8f8f8' : 'white'};
  position: relative;
  height: auto;
  min-height: 80px;

  &:hover {
    border-color: #000;
    background-color: ${props => props.selected ? '#f8f8f8' : '#f9f9f9'};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const OptionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const OptionTitle = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #333;
`;

const OptionDescription = styled.span`
  font-size: 0.85rem;
  color: #666;
  line-height: 1.3;
`;

const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
`;

const SubmitButton = styled.button`
  background-color: #000;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
  margin: 1.5rem 2rem;
  align-self: flex-end;
  flex-shrink: 0;

  &:hover {
    background-color: #333;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ErrorMessage = styled.p`
  color: #000;
  margin-top: 0.5rem;
`;

const ReviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ReviewSection = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #eee;
`;

const ReviewSectionTitle = styled.h4`
  color: #666;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ReviewContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SelectedItem = styled.span`
  background: #f8f8f8;
  color: #000;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.85rem;
  border: 1px solid #eee;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  color: #000;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background: #f8f8f8;
  }
`;

const RegionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  flex: 1;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 2px;
  }
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

const CountryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  width: 100%;
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  align-content: start;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
`;

const CountryOption = styled.label<{ selected: boolean }>`
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
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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

const CountBadge = styled.span`
  background: #000;
  color: white;
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  margin-left: 0.5rem;
`;

const RegionHeader = styled.div`
  margin-bottom: 1rem;
  color: #333;
  font-weight: 500;
  font-size: 1rem;
`;

const CountryCount = styled.div`
  color: #666;
  font-size: 0.85rem;
  font-weight: normal;
  margin-top: 0.25rem;
`;

const EntityContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const SelectedEntitiesSection = styled.div<{ isExpanded: boolean }>`
  width: 100%;
  background: white;
  border-radius: 8px;
  border: 1px solid #eee;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const SelectedEntitiesHeader = styled.div<{ isExpanded: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  cursor: pointer;
  border-bottom: ${props => props.isExpanded ? '1px solid #eee' : 'none'};
  transition: background-color 0.2s ease;

  &:hover {
    background: #f9f9f9;
  }
`;

const SelectedEntitiesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f8f8;
  max-height: 300px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 3px;
  }
`;

const EntitySelectionArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #eee;
  padding: 1.5rem;
`;

const EntitySelectionColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: white;
  border-radius: 8px;
  border: 1px solid #eee;
  padding: 1rem;
`;

const EntityList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  overflow-y: auto;
  padding-right: 0.5rem;
  flex: 1;
  
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 4px;
  }
`;

const SelectedEntityCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #eee;
  font-size: 0.9rem;

  button {
    background: none;
    border: none;
    color: #000;
    cursor: pointer;
    padding: 0.25rem;
    
    &:hover {
      opacity: 0.8;
    }
  }
`;

const ExpandButton = styled.button<{ isExpanded: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #666;
  transform: rotate(${props => props.isExpanded ? '180deg' : '0deg'});
  transition: transform 0.3s ease;
  
  &:hover {
    color: #333;
  }
`;

const SelectedCount = styled.span`
  background: #000;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
`;

const EntityCard = styled.div<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border: 2px solid ${props => props.selected ? '#000' : '#eee'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => props.selected ? '#f8f8f8' : 'white'};
  position: relative;

  &:hover {
    border-color: #000;
    background-color: ${props => props.selected ? '#f8f8f8' : '#f9f9f9'};
  }
`;

const EntityName = styled.div`
  font-weight: 500;
  font-size: 0.95rem;
`;

const EntityDescription = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #666;
`;

const EntityCategoryLabel = styled.span`
  font-size: 0.8rem;
  color: #666;
  background: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-top: 0.25rem;
`;

const CategoryTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 2px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
`;

const CategoryTab = styled.button.attrs<{ selected: boolean }>(props => ({
  type: 'button',
  'aria-selected': props.selected,
}))`
  padding: 0.5rem 1rem;
  border: none;
  background: ${props => props.selected ? '#000' : '#f0f0f0'};
  color: ${props => props.selected ? 'white' : '#666'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.selected ? '#000' : '#e0e0e0'};
    color: ${props => props.selected ? 'white' : '#333'};
  }
`;

const SearchBar = styled.input`
  padding: 0.75rem;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 0.9rem;
  width: 100%;
  margin-bottom: 1rem;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;

  &:focus {
    border-color: #000;
    outline: none;
  }
`;

const SectionHeader = styled.div`
  padding: 1rem 1.5rem;
  background: #f0f0f0;
  font-weight: 500;
  color: #333;
  border-bottom: 1px solid #eee;
`;

const SelectedCountriesHeader = styled.div`
  padding: 1rem 0;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
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

  &:focus {
    outline: none;
    border-color: #000;
  }

  &::placeholder {
    color: #999;
  }
`;

const CategorySection = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryTitle = styled.h4`
  color: #666;
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 500;
`;

const SelectAllButton = styled.button<{ selected: boolean }>`
  padding: 0.5rem 1rem;
  border: 2px solid ${props => props.selected ? '#000' : '#eee'};
  border-radius: 6px;
  background: ${props => props.selected ? '#000' : 'white'};
  color: ${props => props.selected ? 'white' : '#666'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    border-color: #000;
    color: ${props => props.selected ? 'white' : '#000'};
  }
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
`;

const QuestionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
`;

interface DataSubjectCategory {
  category: string;
  options: string[];
}

interface Question {
  id: string;
  text: string;
  type: 'multiple';
  options: string[] | DataSubjectCategory[];
  dependsOn?: {
    questionId: string;
    value: string;
  };
}

const DATA_SUBJECT_TYPES = {
  CLIENT: {
    category: 'Client',
    options: ['Client', 'Prospect', 'CS Client'] as string[]
  },
  PERSON: {
    category: 'Person',
    options: ['Employee', 'Candidate', 'CS Employee'] as string[]
  }
} as const;

// Updated country data organized by business regions
const REGIONS = {
  APAC: 'APAC',
  EMEA: 'EMEA',
  CH: 'CH',
  US: 'United States',
} as const;

const COUNTRIES_DATA = {
  APAC: [
    { name: 'Japan', code: 'JP', region: 'APAC' },
    { name: 'South Korea', code: 'KR', region: 'APAC' },
    { name: 'Singapore', code: 'SG', region: 'APAC' },
    { name: 'India', code: 'IN', region: 'APAC' },
    { name: 'China', code: 'CN', region: 'APAC' },
    { name: 'Australia', code: 'AU', region: 'APAC' },
    { name: 'New Zealand', code: 'NZ', region: 'APAC' },
  ],
  EMEA: [
    { name: 'United Kingdom', code: 'GB', region: 'EMEA' },
    { name: 'Germany', code: 'DE', region: 'EMEA' },
    { name: 'France', code: 'FR', region: 'EMEA' },
    { name: 'Spain', code: 'ES', region: 'EMEA' },
    { name: 'Italy', code: 'IT', region: 'EMEA' },
    { name: 'Netherlands', code: 'NL', region: 'EMEA' },
    { name: 'Belgium', code: 'BE', region: 'EMEA' },
    { name: 'Austria', code: 'AT', region: 'EMEA' },
    { name: 'Ireland', code: 'IE', region: 'EMEA' },
    { name: 'Sweden', code: 'SE', region: 'EMEA' },
    { name: 'Norway', code: 'NO', region: 'EMEA' },
    { name: 'Denmark', code: 'DK', region: 'EMEA' },
    { name: 'Finland', code: 'FI', region: 'EMEA' },
    { name: 'Portugal', code: 'PT', region: 'EMEA' },
    { name: 'United Arab Emirates', code: 'AE', region: 'EMEA' },
    { name: 'Saudi Arabia', code: 'SA', region: 'EMEA' },
  ],
  CH: [
    { name: 'Switzerland', code: 'CH', region: 'Switzerland' },
  ],
  US: [
    { name: 'United States', code: 'US', region: 'United States' },
  ],
};

const baseQuestions = [
  // Preliminary Questions
  {
    id: 'informationCategory',
    text: 'Select Information Category',
    type: 'multiple',
    options: ['Client', 'Employee'],
  },
  {
    id: 'dataSubjectType',
    text: 'Select Data Subject Type',
    type: 'multiple',
    options: [] as string[],
    dependsOn: {
      questionId: 'informationCategory',
      value: '',
    },
  },
  {
    id: 'countries',
    text: 'Select the countries',
    type: 'multiple',
    options: Object.values(COUNTRIES_DATA).flat().map(country => country.name),
  },
  {
    id: 'entities',
    text: 'Select the entities',
    type: 'multiple',
    options: [], // Will be populated dynamically
    dependsOn: {
      questionId: 'countries',
      value: '',
    },
  },
  {
    id: 'transferLocation',
    text: 'Select Transfer Location',
    type: 'multiple',
    options: ['Inside Country', 'Outside Country'],
  },
  {
    id: 'recipientType',
    text: 'Select Recipient Types',
    type: 'multiple',
    options: [...RECIPIENT_TYPES],
  },
  {
    id: 'reviewDataTransferPurpose',
    text: 'Review Data Transfer Purpose',
    type: 'multiple',
    options: [],
  },
] as const as Question[];

interface Country {
  name: string;
  code: string;
  region: string;
}

export default function Questionnaire({ onComplete }: { onComplete: (data: any) => void }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [enabledSteps, setEnabledSteps] = useState<number[]>([0]); // Start with first step enabled
  const selectedEntities = {};
  const [questions, setQuestions] = useState(baseQuestions);
  const [selectedRegions, setSelectedRegions] = useState<Set<keyof typeof REGIONS>>(new Set());
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [isEntitiesExpanded, setIsEntitiesExpanded] = useState(false);
  const [isQuestionsExpanded, setIsQuestionsExpanded] = useState(true);
  const [isSubsequentExpanded, setIsSubsequentExpanded] = useState(true);
  const [isOutputExpanded, setIsOutputExpanded] = useState(true);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');

  const formValues = watch();
  const currentQuestion = questions[currentStep];
  
  const currentSelections = {
    informationCategory: formValues.informationCategory || [],
    dataSubjectType: formValues.dataSubjectType || [],
    countries: formValues.countries || [],
    transferLocation: formValues.transferLocation || [],
    recipientType: formValues.recipientType || [],
  };

  // Update isAllStepsCompleted to include all steps
  const isAllStepsCompleted = useCallback(() => {
    const requiredStepIndices = [0, 1, 2, 3, 4, 5]; // All steps except review
    return requiredStepIndices.every(index => completedSteps.includes(index));
  }, [completedSteps]);

  // Update the useEffect hook to prevent infinite updates
  useEffect(() => {
    const fetchEntities = async () => {
      if (formValues.countries?.length > 0 && !loading) {
        setLoading(true);
        try {
          const promises = formValues.countries.map((country: string) => {
            const countryCode = Object.values(COUNTRIES_DATA)
              .flat()
              .find(c => c.name === country)?.code;
            return countryCode ? fetchEntitiesForCountry(countryCode) : Promise.resolve([]);
          });
          
          const results = await Promise.all(promises);
          setEntities(results.flat());
        } catch (error) {
          console.error('Error fetching entities:', error);
        } finally {
          setLoading(false);
        }
      } else if (!formValues.countries?.length) {
        setEntities([]);
      }
    };

    fetchEntities();
  }, [formValues.countries, loading]);

  // Update data subject type options when information category changes
  useEffect(() => {
    const category = formValues.informationCategory || [];
    if (category.length > 0) {
      const dataSubjectOptions: DataSubjectCategory[] = [];
      
      if (category.includes('Client')) {
        dataSubjectOptions.push({
          category: DATA_SUBJECT_TYPES.CLIENT.category,
          options: [...DATA_SUBJECT_TYPES.CLIENT.options]
        });
      }
      if (category.includes('Employee')) {
        dataSubjectOptions.push({
          category: DATA_SUBJECT_TYPES.PERSON.category,
          options: [...DATA_SUBJECT_TYPES.PERSON.options]
        });
      }
      
      setQuestions(prevQuestions => 
        prevQuestions.map(q => 
          q.id === 'dataSubjectType' 
            ? { ...q, options: dataSubjectOptions }
            : q
        ) as Question[]
      );
      
      setEnabledSteps(prev => [...new Set([...prev, 1])]);
      setCompletedSteps(prev => [...new Set([...prev, 0])]);
      setValue('dataSubjectType', []);
    }
  }, [formValues.informationCategory, setValue]);

  // Debug log for tab click
  const handleTabClick = useCallback((index: number) => {
    console.log('Tab clicked:', index);
    const isReviewTab = index === questions.length - 2; // Adjusted for review data transfer purpose
    const canAccessReviewTab = isReviewTab && isAllStepsCompleted();
    const canAccessStep = enabledSteps.includes(index) || 
                         completedSteps.includes(index) || 
                         canAccessReviewTab ||
                         index <= currentStep + 1; // Allow accessing next step
    
    if (canAccessStep) {
      console.log('Navigating to step:', index);
      setCurrentStep(index);
    }
  }, [enabledSteps, completedSteps, questions.length, isAllStepsCompleted, currentStep]);

  // Debug log for rendering
  useEffect(() => {
    console.log('Current step:', currentStep);
    console.log('Current question ID:', currentQuestion.id);
  }, [currentStep, currentQuestion.id]);

  // Step completion and enabling logic
  const updateStepStatus = useCallback((stepIndex: number, values: string[]) => {
    if (values.length > 0) {
      setCompletedSteps(prev => {
        const newCompleted = [...new Set([...prev, stepIndex])];
        console.log('Completed steps updated:', newCompleted);
        return newCompleted;
      });
      
      setEnabledSteps(prev => {
        const newEnabled = [...new Set([...prev, stepIndex, stepIndex + 1])];
        console.log('Enabled steps updated:', newEnabled);
        return newEnabled;
      });
    }
  }, []);

  // Watch for changes in form values and update step status
  useEffect(() => {
    if (currentSelections.informationCategory.length > 0) {
      updateStepStatus(0, currentSelections.informationCategory);
    }
  }, [currentSelections.informationCategory.toString(), updateStepStatus]);

  useEffect(() => {
    if (currentSelections.dataSubjectType.length > 0) {
      updateStepStatus(1, currentSelections.dataSubjectType);
    }
  }, [currentSelections.dataSubjectType.toString(), updateStepStatus]);

  useEffect(() => {
    if (currentSelections.countries.length > 0) {
      updateStepStatus(2, currentSelections.countries);
    }
  }, [currentSelections.countries.toString(), updateStepStatus]);


  // Update entity selection effect
  useEffect(() => {
    const selectedValues = watch(currentQuestion.id) || [];
    if (currentQuestion.id === 'entities' && selectedValues.length > 0) {
      updateStepStatus(3, selectedValues);
      setEnabledSteps(prev => [...new Set([...prev, 4])]);
    }
  }, [currentQuestion.id, watch, updateStepStatus]);

  // Debug log for step state changes
  useEffect(() => {
    console.log('Current step:', currentStep);
    console.log('Enabled steps:', enabledSteps);
    console.log('Completed steps:', completedSteps);
  }, [currentStep, enabledSteps, completedSteps]);

  // Update the step enabling logic for transfer location
  useEffect(() => {
    if (currentSelections.transferLocation.length > 0) {
      updateStepStatus(4, currentSelections.transferLocation);
      setEnabledSteps(prev => [...new Set([...prev, 5])]); // Enable recipient type step
    }
  }, [currentSelections.transferLocation.toString(), updateStepStatus]);

  // Update the step enabling logic for recipient type
  useEffect(() => {
    if (currentSelections.recipientType.length > 0) {
      updateStepStatus(5, currentSelections.recipientType);
      setEnabledSteps(prev => [...new Set([...prev, 6])]); // Enable review data transfer purpose step
    }
  }, [currentSelections.recipientType.toString(), updateStepStatus]);

  // Ensure the review data transfer purpose step is enabled when all previous steps are completed
  useEffect(() => {
    if (isAllStepsCompleted()) {
      setEnabledSteps(prev => [...new Set([...prev, 6])]);
    }
  }, [isAllStepsCompleted]);

  const onSubmit = (data: any) => {
    console.log('Raw form data:', data);
    
    // Get selected entities for each country
    const selectedEntities: { [key: string]: string[] } = {};
    data.countries.forEach((country: string) => {
      const countryEntities = INITIAL_FORM_DATA.entities[country] || [];
      selectedEntities[country] = countryEntities;
    });

    const formData = {
      ...data,
      entities: selectedEntities
    };

    console.log('Processed form data:', formData);
    onComplete(formData);
  };

  const selectedOptions = formValues[currentQuestion.id] || [];

  // Update the getOptionDescription function to include the new question
  const getOptionDescription = (option: string) => {
    switch (currentQuestion.id) {
      case 'informationCategory':
        return option === 'Employee' 
          ? 'Data related to employees, candidates, or contractors'
          : 'Data related to clients and their employees';
      case 'dataSubjectType':
        return 'Select the type of data subject';
      case 'countries':
        return 'Select the countries involved in the data transfer';
      case 'transferLocation':
        return option === 'Inside Country'
          ? 'Data will be transferred within the same country'
          : 'Data will be transferred to other countries';
      case 'recipientType':
        return 'Select the type of recipient';
      case 'reviewDataTransferPurpose':
        return 'Review the data transfer purpose';
      default:
        return '';
    }
  };

  // Update the review section to show all questions in order
  const renderReviewSection = () => {
    const allSelections = {
      'Information Category': currentSelections.informationCategory,
      'Data Subject Type': currentSelections.dataSubjectType,
      'Countries': currentSelections.countries,
      'Transfer Location': formValues.transferLocation || [],
      'Recipient Type': currentSelections.recipientType,
    };

    return (
      <ReviewContainer>
        {Object.entries(allSelections).map(([section, selections], index) => (
          <ReviewSection key={section}>
            <ReviewSectionTitle>
              {section}
              <EditButton onClick={() => setCurrentStep(index)}>
                Edit
              </EditButton>
            </ReviewSectionTitle>
            <ReviewContent>
              {selections.map((item: string) => (
                <SelectedItem key={item}>{item}</SelectedItem>
              ))}
            </ReviewContent>
          </ReviewSection>
        ))}
      </ReviewContainer>
    );
  };

  const getAllCountries = () => {
    return Object.values(COUNTRIES_DATA).flat();
  };

  const getCountriesForRegion = (region: keyof typeof REGIONS) => {
    return COUNTRIES_DATA[region];
  };

  const renderCountryOptions = () => {
    const allCountries = getAllCountries();
    const selectedOptions = watch(currentQuestion.id) || [];

    // Filter countries based on search term
    const filteredCountries = allCountries.filter(country =>
      country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
    );

    // Sort countries to show selected ones at the top
    const sortedCountries = [...filteredCountries].sort((a, b) => {
      const aSelected = selectedOptions.includes(a.name);
      const bSelected = selectedOptions.includes(b.name);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });

    const handleRegionClick = (region: keyof typeof REGIONS) => {
      const regionCountries = getCountriesForRegion(region);
      const regionCountryNames = regionCountries.map(country => country.name);
      
      setSelectedRegions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(region)) {
          newSet.delete(region);
          const remainingSelected = selectedOptions.filter(
            (country: string) => !regionCountryNames.includes(country)
          );
          setValue(currentQuestion.id, remainingSelected);
        } else {
          newSet.add(region);
          const newSelected = Array.from(
            new Set([...selectedOptions, ...regionCountryNames])
          );
          setValue(currentQuestion.id, newSelected);
        }
        return newSet;
      });
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <RegionsContainer>
            {Object.entries(REGIONS).map(([key, label]) => {
              const regionCountries = COUNTRIES_DATA[key as keyof typeof REGIONS];
              const regionCountryNames = regionCountries.map(country => country.name);
              const isRegionFullySelected = regionCountryNames.every(
                countryName => selectedOptions.includes(countryName)
              );
              
              return (
                <RegionChip
                  key={key}
                  selected={isRegionFullySelected}
                  onClick={() => handleRegionClick(key as keyof typeof REGIONS)}
                  type="button"
                >
                  {label}
                  <CountBadge>
                    {regionCountries.length}
                  </CountBadge>
                </RegionChip>
              );
            })}
          </RegionsContainer>

          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Search countries..."
              value={countrySearchTerm}
              onChange={(e) => setCountrySearchTerm(e.target.value)}
            />
          </SearchContainer>
        </div>

        <CountryGrid>
          {sortedCountries.map(country => (
            <CountryOption
              key={country.code}
              selected={selectedOptions.includes(country.name)}
            >
              <HiddenCheckbox
                type="checkbox"
                value={country.name}
                {...register(currentQuestion.id)}
              />
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
      </div>
    );
  };

  // Memoize filtered and grouped entities
  const filteredAndGroupedEntities = useMemo(() => {
    let filtered = entities;
    
    if (searchTerm) {
      filtered = searchEntities(filtered, searchTerm);
    }
    
    const grouped = groupEntitiesByCategory(filtered);
    return grouped;
  }, [entities, searchTerm]);

  // Debounced search handler
  const handleSearch = debounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  const renderEntitySelection = () => {
    const selectedValues = watch(currentQuestion.id) || [];
    const selectedCountries = watch('countries') || [];
    const informationCategories = watch('informationCategory') || [];

    const handleEntitySelect = (entityId: string) => {
      const newValues = selectedValues.includes(entityId)
        ? selectedValues.filter((id: string) => id !== entityId)
        : [...selectedValues, entityId];
      setValue(currentQuestion.id, newValues);

      if (newValues.length > 0) {
        updateStepStatus(3, ['entities']);
        setEnabledSteps(prev => [...new Set([...prev, 4])]);
      }
    };

    return (
      <EntitySelection
        selectedCountries={selectedCountries}
        informationCategory={informationCategories}
        selectedEntities={selectedValues}
        onEntitySelect={handleEntitySelect}
      />
    );
  };

  // Watch for entity selections
  useEffect(() => {
    const entitySelections = watch('entities') || [];
    if (entitySelections.length > 0) {
      updateStepStatus(3, ['entities']);
      setEnabledSteps(prev => [...new Set([...prev, 4])]);
    }
  }, [watch('entities'), updateStepStatus]);

  // Handle recipient type selection
  useEffect(() => {
    const recipientTypes = watch('recipientType') || [];
    if (recipientTypes.length > 0) {
      updateStepStatus(5, recipientTypes);
      setEnabledSteps(prev => [...new Set([...prev, 6])]); // Enable review step
    }
  }, [watch('recipientType'), updateStepStatus]);

  const handleOptionSelect = (e: React.MouseEvent, option: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentValues = watch(currentQuestion.id) || [];
    const newValues = currentValues.includes(option)
      ? currentValues.filter((value: string) => value !== option)
      : [...currentValues, option];
    setValue(currentQuestion.id, newValues);

    // Update step status and enable next step if needed
    if (newValues.length > 0) {
      updateStepStatus(currentStep, newValues);
      setEnabledSteps(prev => [...new Set([...prev, currentStep + 1])]);
    }
  };

  const renderBasicOptionPanel = (option: string) => {
    const selectedValues = watch(currentQuestion.id) || [];
    const isSelected = selectedValues.includes(option);

    return (
      <OptionPanel
        key={option}
        selected={isSelected}
        onClick={(e) => handleOptionSelect(e, option)}
      >
        <OptionContent>
          <OptionTitle>{option}</OptionTitle>
          <OptionDescription>{getOptionDescription(option)}</OptionDescription>
        </OptionContent>
      </OptionPanel>
    );
  };

  const renderDataSubjectOptionPanel = (option: DataSubjectCategory) => {
    return (
      <CategorySection key={option.category}>
        <CategoryTitle>{option.category}</CategoryTitle>
        <OptionsContainer>
          {option.options.map(subOption => (
            <OptionPanel
              key={subOption}
              selected={selectedOptions.includes(subOption)}
              onClick={(e) => handleOptionSelect(e, subOption)}
            >
              <OptionContent>
                <OptionTitle>{subOption}</OptionTitle>
                <OptionDescription>{getOptionDescription(subOption)}</OptionDescription>
              </OptionContent>
            </OptionPanel>
          ))}
        </OptionsContainer>
      </CategorySection>
    );
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentValues = watch(currentQuestion.id) || [];
    let newValues: string[] = [];

    switch (currentQuestion.id) {
      case 'informationCategory':
      case 'transferLocation':
        newValues = currentValues.length === currentQuestion.options.length
          ? []
          : [...currentQuestion.options as string[]];
        break;

      case 'dataSubjectType':
        const allOptions = (currentQuestion.options as DataSubjectCategory[])
          .flatMap(category => category.options);
        newValues = currentValues.length === allOptions.length
          ? []
          : allOptions;
        break;

      case 'countries':
        const filteredCountries = getAllCountries()
          .filter((country: Country) => 
            country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
          )
          .map((country: Country) => country.name);
        newValues = currentValues.length === filteredCountries.length
          ? currentValues.filter((country: string) => !filteredCountries.includes(country))
          : [...new Set([...currentValues, ...filteredCountries])];
        break;

      case 'recipientType':
        newValues = currentValues.length === RECIPIENT_TYPES.length
          ? []
          : [...RECIPIENT_TYPES];
        break;
    }

    setValue(currentQuestion.id, newValues);
    if (newValues.length > 0) {
      updateStepStatus(currentStep, newValues);
      setEnabledSteps(prev => [...new Set([...prev, currentStep + 1])]);
    }
  };

  const isAllSelected = () => {
    const currentValues = watch(currentQuestion.id) || [];
    
    switch (currentQuestion.id) {
      case 'informationCategory':
      case 'transferLocation':
        return currentValues.length === currentQuestion.options.length;

      case 'dataSubjectType':
        const allOptions = (currentQuestion.options as DataSubjectCategory[])
          .flatMap(category => category.options);
        return currentValues.length === allOptions.length;

      case 'countries':
        const filteredCountries = getAllCountries()
          .filter((country: Country) => 
            country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
          )
          .map((country: Country) => country.name);
        return currentValues.length === filteredCountries.length;

      case 'recipientType':
        return currentValues.length === RECIPIENT_TYPES.length;

      default:
        return false;
    }
  };

  const renderReviewDataTransferPurpose = () => {
    const selectedValues = watch(currentQuestion.id) || [];
    const informationCategories = watch('informationCategory') || [];
    const dataSubjectTypes = watch('dataSubjectType') || [];
    const recipientTypes = watch('recipientType') || [];

    return (
      <ReviewDataTransferPurpose
        informationCategory={informationCategories}
        dataSubjectType={dataSubjectTypes}
        recipientType={recipientTypes}
      />
    );
  };

  return (
    <Form onSubmit={(e) => {
      if (currentStep !== questions.length - 1) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      handleSubmit(onSubmit)(e);
    }}>
      <TabsContainer>
        <TabGroup>
          <TabGroupHeader 
            isExpanded={isQuestionsExpanded}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsQuestionsExpanded(!isQuestionsExpanded);
            }}
          >
            <span>Preliminary Questions</span>
            <ExpandButton isExpanded={isQuestionsExpanded}>▼</ExpandButton>
          </TabGroupHeader>
          <TabGroupContent isExpanded={isQuestionsExpanded}>
            {questions.slice(0, 6).map((question, index) => {
              const isDisabled = !enabledSteps.includes(index) && 
                               !completedSteps.includes(index);
              
              return (
                <Tab
                  key={question.id}
                  isActive={currentStep === index}
                  disabled={isDisabled}
                  isNextEnabled={enabledSteps.includes(index) && !completedSteps.includes(index)}
                  onClick={() => handleTabClick(index)}
                >
                  <ProgressIndicator 
                    status={
                      completedSteps.includes(index) 
                        ? 'completed' 
                        : currentStep === index 
                          ? 'current' 
                          : 'pending'
                    }
                  >
                    <StepNumber
                      status={
                        completedSteps.includes(index) 
                          ? 'completed' 
                          : currentStep === index 
                            ? 'current' 
                            : 'pending'
                      }
                    >
                      {index + 1}
                    </StepNumber>
                  </ProgressIndicator>
                  {question.text}
                </Tab>
              );
            })}
          </TabGroupContent>
        </TabGroup>

        <TabGroup>
          <TabGroupHeader 
            isExpanded={isSubsequentExpanded}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsSubsequentExpanded(!isSubsequentExpanded);
            }}
          >
            <span>Subsequent Questions</span>
            <ExpandButton isExpanded={isSubsequentExpanded}>▼</ExpandButton>
          </TabGroupHeader>
          <TabGroupContent isExpanded={isSubsequentExpanded}>
            <Tab
              isActive={currentStep === 6}
              disabled={!isAllStepsCompleted()}
              isNextEnabled={isAllStepsCompleted()}
              onClick={() => {
                console.log('Review Data Transfer Purpose clicked');
                if (isAllStepsCompleted()) {
                  handleTabClick(6);
                }
              }}
            >
              <ProgressIndicator 
                status={isAllStepsCompleted() ? 'completed' : 'pending'}
              >
                <StepNumber
                  status={isAllStepsCompleted() ? 'completed' : 'pending'}
                >
                  6
                </StepNumber>
              </ProgressIndicator>
              Review Data Transfer Purpose
            </Tab>
          </TabGroupContent>
        </TabGroup>

        <TabGroup>
          <TabGroupHeader 
            isExpanded={isOutputExpanded}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOutputExpanded(!isOutputExpanded);
            }}
          >
            <span>Output</span>
            <ExpandButton isExpanded={isOutputExpanded}>▼</ExpandButton>
          </TabGroupHeader>
          <TabGroupContent isExpanded={isOutputExpanded}>
            <Tab
              isActive={false}
              disabled={!isAllStepsCompleted()}
              isNextEnabled={false}
              onClick={() => {}}
            >
              <ProgressIndicator 
                status={isAllStepsCompleted() ? 'completed' : 'pending'}
              >
                <StepNumber
                  status={isAllStepsCompleted() ? 'completed' : 'pending'}
                >
                  7
                </StepNumber>
              </ProgressIndicator>
              Results 
            </Tab>
          </TabGroupContent>
        </TabGroup>
      </TabsContainer>

      <ContentContainer>
        <QuestionContainer>
          <>
            <ContentHeader>
              {currentQuestion.id !== 'entities' && (
                <SelectAllButton
                  selected={isAllSelected()}
                  onClick={handleSelectAll}
                >
                  {isAllSelected() ? 'Deselect All' : 'Select All'}
                </SelectAllButton>
              )}
            </ContentHeader>

            {currentQuestion.id === 'countries' ? (
              renderCountryOptions()
            ) : currentQuestion.id === 'entities' ? (
              renderEntitySelection()
            ) : currentQuestion.id === 'dataSubjectType' ? (
              (currentQuestion.options as DataSubjectCategory[]).map(option => renderDataSubjectOptionPanel(option))
            ) : currentQuestion.id === 'recipientType' ? (
              <OptionsContainer>
                {RECIPIENT_TYPES.map(option => renderBasicOptionPanel(option))}
              </OptionsContainer>
            ) : currentQuestion.id === 'reviewDataTransferPurpose' ? (
              renderReviewDataTransferPurpose()
            ) : (
              <OptionsContainer>
                {(currentQuestion.options as string[]).map(option => renderBasicOptionPanel(option))}
              </OptionsContainer>
            )}
            {errors[currentQuestion.id] && (
              <ErrorMessage>Please select at least one option</ErrorMessage>
            )}
          </>
        </QuestionContainer>

        {currentStep === questions.length - 1 && (
          <SubmitButton type="submit">View Output</SubmitButton>
        )}
      </ContentContainer>
    </Form>
  );
} 