import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import Flag from 'react-world-flags';
import { RECIPIENT_TYPES } from '../../types';
import EntitySelection from '../../components/EntitySelection/index';
import ReviewDataTransferPurpose from '../../components/ReviewDataTransferPurpose';
import { INITIAL_FORM_DATA } from '../../App';
import QuestionnaireTabs from './QuestionnaireTabs';
import AzureCloudHostingLocations from './AzureCloudHostingLocations';
import AccessLocations from './AccessLocations';

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
  const [questions, setQuestions] = useState(baseQuestions);

  const [isQuestionsExpanded, setIsQuestionsExpanded] = useState(true);
  const [isSubsequentExpanded, setIsSubsequentExpanded] = useState(true);
  const [isOutputExpanded, setIsOutputExpanded] = useState(true);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [isAzureExpanded, setIsAzureExpanded] = useState(false);
  const [activeAzureTab, setActiveAzureTab] = useState<'cloud' | 'access' | null>(null);

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
      setActiveAzureTab(null); // Reset Azure tab when switching to main questionnaire
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
      const isRegionFullySelected = regionCountryNames.every(
        countryName => selectedOptions.includes(countryName)
      );
      if (isRegionFullySelected) {
        const remainingSelected = selectedOptions.filter(
          (country: string) => !regionCountryNames.includes(country)
        );
        setValue(currentQuestion.id, remainingSelected);
      } else {
        const newSelected = Array.from(
          new Set([...selectedOptions, ...regionCountryNames])
        );
        setValue(currentQuestion.id, newSelected);
      }
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
      <QuestionnaireTabs
        currentStep={currentStep}
        enabledSteps={enabledSteps}
        completedSteps={completedSteps}
        handleTabClick={handleTabClick}
        questions={questions}
        isQuestionsExpanded={isQuestionsExpanded}
        setIsQuestionsExpanded={setIsQuestionsExpanded}
        isSubsequentExpanded={isSubsequentExpanded}
        setIsSubsequentExpanded={setIsSubsequentExpanded}
        isOutputExpanded={isOutputExpanded}
        setIsOutputExpanded={setIsOutputExpanded}
        isAllStepsCompleted={isAllStepsCompleted}
        isAzureExpanded={isAzureExpanded}
        setIsAzureExpanded={setIsAzureExpanded}
        onAzureCloudTabClick={() => setActiveAzureTab('cloud')}
        onAzureAccessTabClick={() => setActiveAzureTab('access')}
      />
      <ContentContainer>
        {activeAzureTab === 'cloud' ? (
          <AzureCloudHostingLocations />
        ) : activeAzureTab === 'access' ? (
          <AccessLocations />
        ) : (
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
        )}
        {activeAzureTab === null && currentStep === questions.length - 1 && (
          <SubmitButton type="submit">View Output</SubmitButton>
        )}
      </ContentContainer>
    </Form>
  );
} 