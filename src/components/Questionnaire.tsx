import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import Flag from 'react-world-flags';
import debounce from 'lodash/debounce';
import { DATA_SUBJECT_TYPES, RECIPIENT_TYPES } from '../types';
import { fetchEntitiesForCountry, groupEntitiesByCategory, searchEntities } from '../services/entityService';

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
    if (props.isNextEnabled) return '#ff0000';
    return props.isActive ? '#ff0000' : '#666';
  }};
  border-left: 4px solid ${props => {
    if (props.disabled) return 'transparent';
    if (props.isActive) return '#ff0000';
    if (props.isNextEnabled) return '#ff9999';
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
    color: ${props => props.disabled ? '#ccc' : '#ff0000'};
  }

  &::after {
    content: '✓';
    position: absolute;
    right: 1rem;
    opacity: ${props => props.disabled ? 0 : props.isActive ? 0 : 1};
    color: #4CAF50;
  }
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
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 1.5rem;
  width: 100%;
  padding: 0;
  margin: 0;

  @media (min-width: 1920px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const OptionPanel = styled.label<{ selected: boolean }>`
  display: flex;
  align-items: flex-start;
  padding: 1.5rem;
  border: 2px solid ${props => props.selected ? '#ff0000' : '#eee'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => props.selected ? '#fff5f5' : 'white'};
  position: relative;
  height: 140px;

  &:hover {
    border-color: #ff0000;
    background-color: ${props => props.selected ? '#fff5f5' : '#f9f9f9'};
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &::after {
    content: '✓';
    position: absolute;
    right: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: #4CAF50;
    opacity: ${props => props.selected ? 1 : 0};
    transition: opacity 0.3s ease;
  }
`;

const OptionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
`;

const OptionTitle = styled.span`
  font-size: 1.1rem;
  font-weight: 500;
`;

const OptionDescription = styled.span`
  font-size: 0.95rem;
  color: #666;
  line-height: 1.4;
`;

const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
`;

const SubmitButton = styled.button`
  background-color: #ff0000;
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
    background-color: #cc0000;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ErrorMessage = styled.p`
  color: #ff0000;
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
  background: #fff5f5;
  color: #ff0000;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.85rem;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  color: #ff0000;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background: #fff5f5;
  }
`;

const RegionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  flex-shrink: 0;

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
  border: 2px solid ${props => props.selected ? '#ff0000' : '#eee'};
  border-radius: 20px;
  background: ${props => props.selected ? '#fff5f5' : 'white'};
  color: ${props => props.selected ? '#ff0000' : '#666'};
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff0000;
    background: #fff5f5;
    color: #ff0000;
  }
`;

const CountryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  width: 100%;
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 0.5rem;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

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

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const CountryOption = styled(OptionPanel)<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  min-height: 60px;
  transition: all 0.2s ease;

  &:hover {
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
`;

const CountryName = styled.span`
  font-weight: 500;
  font-size: 0.95rem;
`;

const CountryRegion = styled.span`
  font-size: 0.8rem;
  color: #666;
`;

const CountBadge = styled.span`
  background: #ff0000;
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
  gap: 2rem;
  height: 100%;
  width: 100%;
`;

const EntitySelectionColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; // Prevents flex item from overflowing
`;

const SelectedEntitiesColumn = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  background: #f8f8f8;
  border-left: 1px solid #eee;
  padding: 1rem;
`;

const CategoryTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 2px solid #eee;
`;

const CategoryTab = styled.button.attrs<{ selected: boolean }>(props => ({
  type: 'button',
  'aria-selected': props.selected,
}))`
  padding: 0.5rem 1rem;
  border: none;
  background: ${props => props.selected ? '#ff0000' : '#f0f0f0'};
  color: ${props => props.selected ? 'white' : '#666'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.selected ? '#ff0000' : '#e0e0e0'};
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

  &:focus {
    border-color: #ff0000;
    outline: none;
  }
`;

const EntityList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  overflow-y: auto;
  padding-right: 0.5rem;
  height: 100%;
  
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

const SelectedEntitiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  flex: 1;

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
    color: #ff0000;
    cursor: pointer;
    padding: 0.25rem;
    
    &:hover {
      opacity: 0.8;
    }
  }
`;

const SelectedEntitiesHeader = styled.div`
  font-weight: 500;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SelectedCount = styled.span`
  background: #ff0000;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
`;

const EntityCard = styled.div<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border: 2px solid ${props => props.selected ? '#ff0000' : '#eee'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => props.selected ? '#fff5f5' : 'white'};
  position: relative;

  &:hover {
    border-color: #ff0000;
    background-color: ${props => props.selected ? '#fff5f5' : '#f9f9f9'};
  }

  &::after {
    content: '✓';
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #4CAF50;
    opacity: ${props => props.selected ? 1 : 0};
    transition: opacity 0.3s ease;
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  width: 90vw;
  height: 90vh;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: #333;
`;

const ModalBody = styled.div`
  flex: 1;
  overflow: hidden;
  padding: 1.5rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #eee;
  background: white;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'primary' ? `
    background: #ff0000;
    color: white;
    border: none;
    
    &:hover {
      background: #cc0000;
    }
  ` : `
    background: white;
    color: #666;
    border: 1px solid #ddd;
    
    &:hover {
      background: #f5f5f5;
    }
  `}
`;

const SelectedEntitiesPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #f8f8f8;
  border-radius: 8px;
  margin-top: 1rem;
`;

const SelectedEntityChip = styled.div`
  display: inline-flex;
  align-items: center;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid #eee;
  margin: 0.25rem;
  font-size: 0.9rem;
  
  button {
    background: none;
    border: none;
    color: #ff0000;
    margin-left: 0.5rem;
    cursor: pointer;
    padding: 0.25rem;
    
    &:hover {
      opacity: 0.8;
    }
  }
`;

const SelectEntitiesButton = styled(Button)`
  margin-top: 1rem;
`;

interface Question {
  id: string;
  text: string;
  type: 'multiple' | 'review';
  options: string[];
  dependsOn?: {
    questionId: string;
    value: string;
  };
}

interface Entity {
  id: string;
  name: string;
  category: string;
  countryCode: string;
  description?: string;
}

// Updated country data organized by business regions
const REGIONS = {
  EMEA: 'Europe, Middle East & Africa',
  APAC: 'Asia Pacific',
  AMER: 'Americas',
} as const;

const COUNTRIES_DATA = {
  EMEA: [
    { name: 'United Kingdom', code: 'GB', region: 'Europe' },
    { name: 'Germany', code: 'DE', region: 'Europe' },
    { name: 'France', code: 'FR', region: 'Europe' },
    { name: 'Spain', code: 'ES', region: 'Europe' },
    { name: 'Italy', code: 'IT', region: 'Europe' },
    { name: 'Netherlands', code: 'NL', region: 'Europe' },
    { name: 'Switzerland', code: 'CH', region: 'Europe' },
    { name: 'United Arab Emirates', code: 'AE', region: 'Middle East' },
    { name: 'South Africa', code: 'ZA', region: 'Africa' },
  ],
  APAC: [
    { name: 'Japan', code: 'JP', region: 'Asia' },
    { name: 'South Korea', code: 'KR', region: 'Asia' },
    { name: 'Singapore', code: 'SG', region: 'Asia' },
    { name: 'India', code: 'IN', region: 'Asia' },
    { name: 'China', code: 'CN', region: 'Asia' },
    { name: 'Australia', code: 'AU', region: 'Oceania' },
  ],
  AMER: [
    { name: 'United States', code: 'US', region: 'North America' },
    { name: 'Canada', code: 'CA', region: 'North America' },
    { name: 'Mexico', code: 'MX', region: 'North America' },
    { name: 'Brazil', code: 'BR', region: 'South America' },
  ],
};

const baseQuestions = [
  {
    id: 'informationCategory',
    text: 'Please select Information Category',
    type: 'multiple',
    options: ['Client', 'Employee'],
  },
  {
    id: 'dataSubjectType',
    text: 'Please select Data subject type',
    type: 'multiple',
    options: [] as string[],
    dependsOn: {
      questionId: 'informationCategory',
      value: '',
    },
  },
  {
    id: 'countries',
    text: 'Please select the countries',
    type: 'multiple',
    options: Object.values(COUNTRIES_DATA).flat().map(country => country.name),
  },
  {
    id: 'entities',
    text: 'Please select the entities',
    type: 'multiple',
    options: [], // Will be populated dynamically
    dependsOn: {
      questionId: 'countries',
      value: '',
    },
  },
  {
    id: 'recipientType',
    text: 'Please select Recipient Type',
    type: 'multiple',
    options: [...RECIPIENT_TYPES],
  },
  {
    id: 'review',
    text: 'Review Selections',
    type: 'review',
    options: [],
  },
] as const as Question[];

export default function Questionnaire({ onComplete }: { onComplete: (data: any) => void }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [enabledSteps, setEnabledSteps] = useState<number[]>([0]); // Start with first step enabled
  //const [selectedEntities, setSelectedEntities] = useState<Record<string, string[]>>({});
  const selectedEntities = {};
  const [questions, setQuestions] = useState(baseQuestions);
  const [selectedRegions, setSelectedRegions] = useState<Set<keyof typeof REGIONS>>(new Set());
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formValues = watch();
  const currentQuestion = questions[currentStep];
  
  const currentSelections = {
    informationCategory: formValues.informationCategory || [],
    dataSubjectType: formValues.dataSubjectType || [],
    countries: formValues.countries || [],
    recipientType: formValues.recipientType || [],
  };

  // Check if all required steps are completed - moved up before usage
  const isAllStepsCompleted = useCallback(() => {
    const requiredStepIndices = [0, 1, 2, 3, 4]; // All steps except review
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
      const dataSubjectOptions = category.includes('Employee')
        ? [...DATA_SUBJECT_TYPES.PERSON]
        : [...DATA_SUBJECT_TYPES.CLIENT];
      
      setQuestions(prevQuestions => 
        prevQuestions.map(q => 
          q.id === 'dataSubjectType' 
            ? { ...q, options: dataSubjectOptions }
            : q
        )
      );
      
      // Enable the next step (Data Subject Type)
      setEnabledSteps(prev => [...new Set([...prev, 1])]);
      
      // Mark Information Category as completed
      setCompletedSteps(prev => [...new Set([...prev, 0])]);

      // Reset data subject type when category changes
      setValue('dataSubjectType', []);
    }
  }, [formValues.informationCategory, setValue]);

  // Handle tab click with more permissive logic
  const handleTabClick = useCallback((index: number) => {
    const isReviewTab = index === questions.length - 1;
    const canAccessReviewTab = isReviewTab && isAllStepsCompleted();
    const canAccessStep = enabledSteps.includes(index) || 
                         completedSteps.includes(index) || 
                         canAccessReviewTab ||
                         index <= currentStep + 1; // Allow accessing next step
    
    if (canAccessStep) {
      setCurrentStep(index);
    }
  }, [enabledSteps, completedSteps, questions.length, isAllStepsCompleted, currentStep]);

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

  // Enable review tab when all steps are completed
  useEffect(() => {
    if (isAllStepsCompleted()) {
      setEnabledSteps(prev => [...new Set([...prev, questions.length - 1])]);
    }
  }, [isAllStepsCompleted]);


  const onSubmit = (data: any) => {
    const formData = {
      ...data,
      entities: selectedEntities,
    };
    onComplete(formData);
  };

  const selectedOptions = formValues[currentQuestion.id] || [];

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
      case 'recipientType':
        return 'Select the type of recipient';
      default:
        return '';
    }
  };

  const renderReviewSection = () => {
    const allSelections = {
      'Information Category': currentSelections.informationCategory,
      'Data Subject Type': currentSelections.dataSubjectType,
      'Countries': currentSelections.countries,
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

  const handleRegionClick = (region: keyof typeof REGIONS) => {
    setSelectedRegions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(region)) {
        newSet.delete(region);
      } else {
        newSet.add(region);
      }
      return newSet;
    });
  };

  const getSelectedRegionsCountries = () => {
    return Array.from(selectedRegions).flatMap(region => COUNTRIES_DATA[region]);
  };

  const renderCountryOptions = () => (
    <>
      <RegionsContainer>
        {Object.entries(REGIONS).map(([key, label]) => (
          <RegionChip
            key={key}
            selected={selectedRegions.has(key as keyof typeof REGIONS)}
            onClick={() => handleRegionClick(key as keyof typeof REGIONS)}
            type="button"
          >
            {label}
            {selectedRegions.has(key as keyof typeof REGIONS) && (
              <CountBadge>
                {COUNTRIES_DATA[key as keyof typeof REGIONS].length}
              </CountBadge>
            )}
          </RegionChip>
        ))}
      </RegionsContainer>
      
      {selectedRegions.size > 0 && (
        <>
          <RegionHeader>
            {selectedRegions.size === 1 
              ? REGIONS[Array.from(selectedRegions)[0]]
              : `Selected Regions (${Array.from(selectedRegions).length})`}
            <CountryCount>
              {getSelectedRegionsCountries().length} countries available
            </CountryCount>
          </RegionHeader>
          <CountryGrid>
            {getSelectedRegionsCountries().map(country => (
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
        </>
      )}
    </>
  );

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

    const handleEntitySelect = (entityId: string, isSelected: boolean) => {
      const newValues = isSelected
        ? selectedValues.filter((id: string) => id !== entityId)
        : [...selectedValues, entityId];
      setValue(currentQuestion.id, newValues);

      if (newValues.length > 0) {
        updateStepStatus(3, ['entities']);
        setEnabledSteps(prev => [...new Set([...prev, 4])]);
      }
    };

    const closeModal = () => {
      setIsModalOpen(false);
    };

    const renderSelectedEntities = () => (
      <SelectedEntitiesPreview>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Selected Entities ({selectedValues.length})</h3>
          <SelectEntitiesButton 
            type="button"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            {selectedValues.length === 0 ? 'Select Entities' : 'Modify Selection'}
          </SelectEntitiesButton>
        </div>
        {selectedValues.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {selectedValues.map((entityId: string) => {
              const entity = entities.find(e => e.id === entityId);
              if (!entity) return null;
              
              return (
                <SelectedEntityChip key={entityId}>
                  {entity.name}
                  <small style={{ color: '#666', marginLeft: '0.5rem' }}>
                    {entity.category}
                  </small>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEntitySelect(entityId, true);
                    }}
                  >
                    ×
                  </button>
                </SelectedEntityChip>
              );
            })}
          </div>
        )}
      </SelectedEntitiesPreview>
    );

    return (
      <>
        {renderSelectedEntities()}
        
        {isModalOpen && (
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Select Entities</ModalTitle>
                <Button 
                  type="button"
                  variant="secondary" 
                  onClick={(e) => {
                    e.preventDefault();
                    closeModal();
                  }}
                >
                  ×
                </Button>
              </ModalHeader>
              
              <ModalBody>
                <EntityContainer>
                  <EntitySelectionColumn>
                    <SearchBar
                      type="text"
                      placeholder="Search entities..."
                      onChange={e => handleSearch(e.target.value)}
                    />
                    
                    <CategoryTabs>
                      <CategoryTab
                        selected={selectedCategories.size === 0}
                        onClick={() => setSelectedCategories(new Set())}
                      >
                        All Categories
                      </CategoryTab>
                      {filteredAndGroupedEntities.map(group => (
                        <CategoryTab
                          key={group.category}
                          selected={selectedCategories.has(group.category)}
                          onClick={() => {
                            setSelectedCategories(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(group.category)) {
                                newSet.delete(group.category);
                              } else {
                                newSet.add(group.category);
                              }
                              return newSet;
                            });
                          }}
                        >
                          {group.category} ({group.entities.length})
                        </CategoryTab>
                      ))}
                    </CategoryTabs>

                    {loading ? (
                      <LoadingSpinner>Loading entities...</LoadingSpinner>
                    ) : (
                      <EntityList>
                        {(selectedCategories.size > 0
                          ? filteredAndGroupedEntities
                              .filter(g => selectedCategories.has(g.category))
                              .flatMap(g => g.entities)
                          : filteredAndGroupedEntities.flatMap(g => g.entities)
                        ).map(entity => {
                          const isSelected = selectedValues.includes(entity.id);
                          
                          return (
                            <EntityCard
                              key={entity.id}
                              selected={isSelected}
                              onClick={() => handleEntitySelect(entity.id, isSelected)}
                            >
                              <HiddenCheckbox
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleEntitySelect(entity.id, isSelected)}
                                onClick={e => e.stopPropagation()}
                              />
                              <EntityName>{entity.name}</EntityName>
                              <EntityCategoryLabel>{entity.category}</EntityCategoryLabel>
                              {entity.description && (
                                <EntityDescription>{entity.description}</EntityDescription>
                              )}
                            </EntityCard>
                          );
                        })}
                      </EntityList>
                    )}
                  </EntitySelectionColumn>

                  <SelectedEntitiesColumn>
                    <SelectedEntitiesHeader>
                      Selected Entities
                      <SelectedCount>{selectedValues.length}</SelectedCount>
                    </SelectedEntitiesHeader>
                    <SelectedEntitiesList>
                      {selectedValues.map((entityId: string) => {
                        const entity = entities.find(e => e.id === entityId);
                        if (!entity) return null;
                        
                        return (
                          <SelectedEntityCard key={entityId}>
                            <div>
                              <div>{entity.name}</div>
                              <small style={{ color: '#666' }}>{entity.category}</small>
                            </div>
                            <button onClick={() => handleEntitySelect(entityId, true)}>×</button>
                          </SelectedEntityCard>
                        );
                      })}
                    </SelectedEntitiesList>
                  </SelectedEntitiesColumn>
                </EntityContainer>
              </ModalBody>
              
              <ModalFooter>
                <Button 
                  type="button"
                  variant="secondary" 
                  onClick={(e) => {
                    e.preventDefault();
                    closeModal();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  variant="primary" 
                  onClick={(e) => {
                    e.preventDefault();
                    closeModal();
                  }}
                >
                  Done
                </Button>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}
      </>
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
      updateStepStatus(4, recipientTypes);
      setEnabledSteps(prev => [...new Set([...prev, 5])]); // Enable review step
    }
  }, [watch('recipientType'), updateStepStatus]);

  const renderOptionPanel = (option: string) => (
    <OptionPanel
      key={option}
      selected={selectedOptions.includes(option)}
    >
      <HiddenCheckbox
        type="checkbox"
        value={option}
        {...register(currentQuestion.id)}
      />
      <OptionContent>
        <OptionTitle>{option}</OptionTitle>
        <OptionDescription>{getOptionDescription(option)}</OptionDescription>
      </OptionContent>
    </OptionPanel>
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <TabsContainer>
        {questions.map((question, index) => {
          const isReviewTab = index === questions.length - 1;
          const isDisabled = !enabledSteps.includes(index) && 
                           !completedSteps.includes(index) && 
                           !(isReviewTab && isAllStepsCompleted());
          
          return (
            <Tab
              key={question.id}
              isActive={currentStep === index}
              disabled={isDisabled}
              isNextEnabled={enabledSteps.includes(index) && !completedSteps.includes(index)}
              onClick={() => handleTabClick(index)}
            >
              {question.text}
            </Tab>
          );
        })}
      </TabsContainer>

      <ContentContainer>
        <QuestionContainer>
          {currentStep === questions.length - 1 ? (
            renderReviewSection()
          ) : (
            <>
              <QuestionText>{currentQuestion.text}</QuestionText>
              {currentQuestion.id === 'countries' ? (
                renderCountryOptions()
              ) : currentQuestion.id === 'entities' ? (
                renderEntitySelection()
              ) : (
                <OptionsContainer>
                  {currentQuestion.options.map(option => renderOptionPanel(option))}
                </OptionsContainer>
              )}
              {errors[currentQuestion.id] && (
                <ErrorMessage>Please select at least one option</ErrorMessage>
              )}
            </>
          )}
        </QuestionContainer>

        {currentStep === questions.length - 1 && (
          <SubmitButton type="submit">Submit Assessment</SubmitButton>
        )}
      </ContentContainer>
    </Form>
  );
} 