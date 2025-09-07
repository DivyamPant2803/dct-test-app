import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { RECIPIENT_TYPES } from '../../types';
import EntitySelection from '../../components/EntitySelection/index';
import ReviewDataTransferPurpose from '../../components/ReviewDataTransferPurpose';
import { INITIAL_FORM_DATA } from '../../App';
import QuestionnaireTabs from './QuestionnaireTabs';
import AzureCloudHostingLocations from './AzureCloudHostingLocations';
import AccessLocations from './AccessLocations';
import CountrySelector from './CountrySelector';
import OptionPanel from './OptionPanel';
import TooltipWrapper from '../common/TooltipWrapper';
import NavigationButtons from '../common/NavigationButtons';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import {
  setCurrentStep,
  addCompletedStep,
  addEnabledStep,
  setInformationCategory,
  setDataSubjectType,
  setCountries,
  setTransferLocation,
  setRecipientType,
  setReviewDataTransferPurpose,
} from './questionnaireSlice';
import { RootState } from '../../store';

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

const SubmitButton = styled.button<{ disabled?: boolean }>`
  background-color: ${props => props.disabled ? '#ccc' : '#000'};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
  margin: 1.5rem 2rem;
  align-self: flex-end;
  flex-shrink: 0;

  &:hover {
    background-color: ${props => props.disabled ? '#ccc' : '#333'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  }
`;

const ErrorMessage = styled.p`
  color: #000;
  margin-top: 0.5rem;
`;

const InfoBubble = styled.div`
  background: #f0f8ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const InfoIcon = styled.div`
  color: #0066cc;
  font-size: 1.2rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  color: #333;
`;

const InfoLink = styled.a`
  color: #0066cc;
  text-decoration: underline;
  font-weight: 500;
  
  &:hover {
    color: #004499;
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
    options: ['CID', 'ED'],
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

const clientSet = new Set(["Client", "Prospect", "CS Client"]);
const employeeSet = new Set(["Employee", "Candidate", "CS Employee"]);

export default function Questionnaire({ onComplete }: { onComplete: (data: any) => void }) {
  const { handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector((state: RootState) => state.questionnaire.currentStep);
  const completedSteps = useAppSelector((state: RootState) => state.questionnaire.completedSteps);
  const enabledSteps = useAppSelector((state: RootState) => state.questionnaire.enabledSteps);
  const [questions, setQuestions] = useState(baseQuestions);

  const [isQuestionsExpanded, setIsQuestionsExpanded] = useState(true);
  const [isSubsequentExpanded, setIsSubsequentExpanded] = useState(true);
  const [isOutputExpanded, setIsOutputExpanded] = useState(true);
  const [isAzureExpanded, setIsAzureExpanded] = useState(false);
  const [activeAzureTab, setActiveAzureTab] = useState<'cloud' | 'access' | null>(null);
  const [isReviewDataTransferPurposeValid, setIsReviewDataTransferPurposeValid] = useState(false);
  const [entitySelectionError, setEntitySelectionError] = useState<string | null>(null);

  const formValues = watch();
  const currentQuestion = questions[currentStep];
  console.log(currentQuestion);
  
  const currentSelections = {
    informationCategory: formValues.informationCategory || [],
    dataSubjectType: formValues.dataSubjectType || [],
    countries: formValues.countries || [],
    transferLocation: formValues.transferLocation || [],
    recipientType: formValues.recipientType || [],
  };

  // Entity validation constants
  const MAX_ENTITIES = 100;
  const ENTITY_LIMIT_WARNING = 90; // Show warning when approaching limit

  // Validate entity selection count
  const validateEntitySelection = useCallback((entityCount: number) => {
    if (entityCount > MAX_ENTITIES) {
      setEntitySelectionError(`Maximum ${MAX_ENTITIES} entities allowed. Please reduce your selection.`);
      return false;
    } else if (entityCount > ENTITY_LIMIT_WARNING) {
      setEntitySelectionError(`Warning: You have selected ${entityCount} entities. Maximum allowed is ${MAX_ENTITIES}.`);
      return true;
    } else {
      setEntitySelectionError(null);
      return true;
    }
  }, []);

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
      
      if (category.includes('CID')) {
        dataSubjectOptions.push({
          category: DATA_SUBJECT_TYPES.CLIENT.category,
          options: [...DATA_SUBJECT_TYPES.CLIENT.options]
        });
      }
      if (category.includes('ED')) {
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
      
      dispatch(addEnabledStep(1));
      dispatch(addCompletedStep(0));
      setValue('dataSubjectType', []);
    }
  }, [formValues.informationCategory, setValue, dispatch]);

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
      dispatch(setCurrentStep(index));
    }
  }, [enabledSteps, completedSteps, questions.length, isAllStepsCompleted, currentStep, dispatch]);

  // Navigation handlers for Back and Next buttons
  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  }, [currentStep, dispatch]);

  const handleNext = useCallback(() => {
    if (currentStep < questions.length - 1) {
      dispatch(setCurrentStep(currentStep + 1));
    }
  }, [currentStep, questions.length, dispatch]);

  // Check if current step is completed to enable Next button
  const isCurrentStepCompleted = useCallback(() => {
    const currentValues = watch(questions[currentStep]?.id) || [];
    
    // Special handling for review data transfer purpose step
    if (questions[currentStep]?.id === 'reviewDataTransferPurpose') {
      return isReviewDataTransferPurposeValid;
    }
    
    // Special handling for entities step - check if within limit
    if (questions[currentStep]?.id === 'entities') {
      return currentValues.length > 0 && currentValues.length <= MAX_ENTITIES;
    }
    
    return currentValues.length > 0;
  }, [currentStep, questions, watch, isReviewDataTransferPurposeValid]);

  // Step completion and enabling logic
  const updateStepStatus = useCallback((stepIndex: number, values: string[]) => {
    if (values.length > 0) {
      dispatch(addCompletedStep(stepIndex));
      dispatch(addEnabledStep(stepIndex));
      dispatch(addEnabledStep(stepIndex + 1));
    }
  }, [dispatch]);

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
    if (currentQuestion.id === 'entities' && (watch(currentQuestion.id) || []).length > 0) {
      updateStepStatus(3, watch(currentQuestion.id));
      dispatch(addEnabledStep(4));
    }
  }, [currentQuestion.id, watch, updateStepStatus, dispatch]);

  // Update the step enabling logic for transfer location
  useEffect(() => {
    if (currentSelections.transferLocation.length > 0) {
      updateStepStatus(4, currentSelections.transferLocation);
      dispatch(addEnabledStep(5));
    }
  }, [currentSelections.transferLocation.toString(), updateStepStatus, dispatch]);

  // Update the step enabling logic for recipient type
  useEffect(() => {
    if (currentSelections.recipientType.length > 0) {
      updateStepStatus(5, currentSelections.recipientType);
      dispatch(addEnabledStep(6));
    }
  }, [currentSelections.recipientType.toString(), updateStepStatus, dispatch]);

  // Ensure the review data transfer purpose step is enabled when all previous steps are completed
  useEffect(() => {
    if (isAllStepsCompleted()) {
      dispatch(addEnabledStep(6));
    }
  }, [isAllStepsCompleted, dispatch]);

  const onSubmit = (data: any) => {
    console.log('Raw form data:', data);
    
    // data.entities is an array of composite keys: entityId|category
    const selectedEntities = (data.entities || []).map((key: string) => {
      const [entityId, category] = key.split('|');
      return { entityId, category };
    });
    console.log('Selected Entities');
    console.log(selectedEntities);

    // Optionally, group by category or country if needed
    // Example: group by category
    const entitiesByCategory: { [category: string]: string[] } = {};
    selectedEntities.forEach(({ entityId, category }: { entityId: string; category: string }) => {
      if (!entitiesByCategory[category]) entitiesByCategory[category] = [];
      entitiesByCategory[category].push(entityId);
    });

    // Example: group by country (if you have a mapping entityId -> country)
    // const entitiesByCountry: { [country: string]: string[] } = {};
    // ...

    const formData = {
      ...data,
      selectedEntities, // array of { entityId, category }
      entitiesByCategory, // grouped by category
      // entitiesByCountry, // grouped by country if needed
    };

    console.log('Processed form data:', formData);
    onComplete(formData);
  };

  const selectedOptions = formValues[currentQuestion.id] || [];

  // Update the getOptionDescription function to include the new question
  const getOptionDescription = (option: string) => {
    switch (currentQuestion.id) {
      case 'informationCategory':
        return option === 'ED' 
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

  const renderEntitySelection = () => {
    const selectedValues = watch(currentQuestion.id) || [];
    const selectedCountries = watch('countries') || [];
    const informationCategories = watch('informationCategory') || [];

    // selectedValues is now an array of composite keys: entityId|category
    const handleEntitySelect = (entityId: string, category: string) => {
      const key = `${entityId}|${category}`;
      const newValues = selectedValues.includes(key)
        ? selectedValues.filter((id: string) => id !== key)
        : [...selectedValues, key];
      
      // Validate entity selection count
      if (!selectedValues.includes(key)) { // Only validate when adding new entities
        const isValid = validateEntitySelection(newValues.length);
        if (!isValid) {
          return; // Don't proceed if validation fails
        }
      }
      
      setValue(currentQuestion.id, newValues);

      if (newValues.length > 0) {
        updateStepStatus(3, ['entities']);
        dispatch(addEnabledStep(4));
      }
    };

    return (
      <>
        <EntitySelection
          selectedCountries={selectedCountries}
          informationCategory={informationCategories}
          selectedEntities={selectedValues}
          onEntitySelect={handleEntitySelect}
          maxEntities={MAX_ENTITIES}
          entityLimitWarning={ENTITY_LIMIT_WARNING}
        />
        
        {/* Info Bubble */}
        <InfoBubble>
          <InfoIcon>ℹ️</InfoIcon>
          <InfoContent>
            <strong>Entity Selection Limit:</strong> You can select up to {MAX_ENTITIES} entities. 
            {selectedValues.length > 0 && (
              <span style={{ display: 'block', marginTop: '0.5rem' }}>
                <strong>Current selection:</strong> {selectedValues.length} entities selected
                {selectedValues.length > ENTITY_LIMIT_WARNING && (
                  <span style={{ color: '#856404', fontWeight: 'bold' }}>
                    {' '}({MAX_ENTITIES - selectedValues.length} remaining)
                  </span>
                )}
              </span>
            )}
            <br />
            If you need to work with more than {MAX_ENTITIES} entities, please{' '}
            <InfoLink href="#" onClick={(e) => {
              e.preventDefault();
              // TODO: Implement download report functionality
              alert('Download report functionality will be implemented here.');
            }}>
              download the comprehensive report
            </InfoLink>{' '}
            instead.
          </InfoContent>
        </InfoBubble>
        
        {/* Entity Selection Error */}
        {entitySelectionError && (
          <ErrorMessage style={{ 
            color: entitySelectionError.includes('Warning') ? '#856404' : '#721c24',
            backgroundColor: entitySelectionError.includes('Warning') ? '#fff3cd' : '#f8d7da',
            border: `1px solid ${entitySelectionError.includes('Warning') ? '#ffeaa7' : '#f5c6cb'}`,
            borderRadius: '4px',
            padding: '0.75rem',
            marginTop: '1rem'
          }}>
            {entitySelectionError}
          </ErrorMessage>
        )}
      </>
    );
  };

  // Watch for entity selections
  useEffect(() => {
    const entitySelections = watch('entities') || [];
    if (entitySelections.length > 0) {
      updateStepStatus(3, ['entities']);
      dispatch(addEnabledStep(4));
    }
    
    // Clear error when entity count is reduced below limit
    if (entitySelections.length <= MAX_ENTITIES) {
      setEntitySelectionError(null);
    }
  }, [watch('entities'), updateStepStatus, dispatch]);

  // Handle recipient type selection
  useEffect(() => {
    const recipientTypes = watch('recipientType') || [];
    if (recipientTypes.length > 0) {
      updateStepStatus(5, recipientTypes);
      dispatch(addEnabledStep(6));
    }
  }, [watch('recipientType'), updateStepStatus, dispatch]);

  const handleOptionSelect = (e: React.MouseEvent, option: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentValues = watch(currentQuestion.id) || [];
    const newValues = currentValues.includes(option)
      ? currentValues.filter((value: string) => value !== option)
      : [...currentValues, option];
    setValue(currentQuestion.id, newValues);
    
    switch (currentQuestion.id) {
      case 'informationCategory':
        dispatch(setInformationCategory(newValues));
        break;
      case 'dataSubjectType': {
        // Categorize before dispatching
        const categorized = {
          CID: newValues.filter((t: string) => clientSet.has(t)),
          ED: newValues.filter((t: string) => employeeSet.has(t))
        };
        dispatch(setDataSubjectType(categorized));
        break;
      }
      case 'countries':
        dispatch(setCountries(newValues));
        break;
      case 'transferLocation':
        dispatch(setTransferLocation(newValues));
        break;
      case 'recipientType':
        dispatch(setRecipientType(newValues));
        break;
      case 'reviewDataTransferPurpose':
        // Only dispatch if newValues is already the correct object structure
        if (typeof newValues === 'object' && !Array.isArray(newValues)) {
          dispatch(setReviewDataTransferPurpose(newValues));
        }
        // else, ignore or handle conversion if needed
        break;
    }
    
    // Update step status and enable next step if needed
    if (newValues.length > 0) {
      updateStepStatus(currentStep, newValues);
      dispatch(addEnabledStep(currentStep + 1));
    }
  };

  const renderDataSubjectOptionPanel = (option: DataSubjectCategory) => {
    return (
      <CategorySection key={option.category}>
        <CategoryTitle>{option.category}</CategoryTitle>
        <OptionsContainer>
          {option.options.map(subOption => (
            <TooltipWrapper key={subOption} tooltipText={subOption}>
              <OptionPanel
                option={subOption}
                isSelected={selectedOptions.includes(subOption)}
                description={getOptionDescription(subOption)}
                onClick={(e) => handleOptionSelect(e, subOption)}
              />
            </TooltipWrapper>
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
      case 'dataSubjectType': {
        // Categorize before dispatching
        const categorized = {
          Client: currentValues.filter((t: string) => clientSet.has(t)),
          Employee: currentValues.filter((t: string) => employeeSet.has(t))
        };
        newValues = currentValues.length === Object.keys(categorized).length
          ? []
          : Object.values(categorized).flat();
        break;
      }
      case 'countries':
        const allCountryNames = getAllCountries().map((country: Country) => country.name);
        newValues = currentValues.length === allCountryNames.length
          ? []
          : [...allCountryNames];
        break;
      case 'recipientType':
        newValues = currentValues.length === RECIPIENT_TYPES.length
          ? []
          : [...RECIPIENT_TYPES];
        break;
    }
    setValue(currentQuestion.id, newValues);
    switch (currentQuestion.id) {
      case 'informationCategory':
        dispatch(setInformationCategory(newValues));
        break;
      case 'dataSubjectType': {
        // Categorize before dispatching
        const categorized = {
          CID: newValues.filter((t: string) => clientSet.has(t)),
          ED: newValues.filter((t: string) => employeeSet.has(t))
        };
        dispatch(setDataSubjectType(categorized));
        break;
      }
      case 'countries':
        dispatch(setCountries(newValues));
        break;
      case 'transferLocation':
        dispatch(setTransferLocation(newValues));
        break;
      case 'recipientType':
        dispatch(setRecipientType(newValues));
        break;
      case 'reviewDataTransferPurpose':
        // Only dispatch if newValues is already the correct object structure
        if (typeof newValues === 'object' && !Array.isArray(newValues)) {
          dispatch(setReviewDataTransferPurpose(newValues));
        }
        // else, ignore or handle conversion if needed
        break;
    }
    if (newValues.length > 0) {
      updateStepStatus(currentStep, newValues);
      dispatch(addEnabledStep(currentStep + 1));
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
        const allCountryNames = getAllCountries().map((country: Country) => country.name);
        return currentValues.length === allCountryNames.length;

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
        onValidationChange={setIsReviewDataTransferPurposeValid}
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
          <>
            <AzureCloudHostingLocations />
            {/* Navigation Buttons for Azure Cloud */}
            <NavigationButtons
              onBack={handleBack}
              onNext={handleNext}
              canGoBack={true}
              canGoNext={false}
              showBack={true}
              showNext={false}
            />
          </>
        ) : activeAzureTab === 'access' ? (
          <>
            <AccessLocations />
            {/* Navigation Buttons for Azure Access */}
            <NavigationButtons
              onBack={handleBack}
              onNext={handleNext}
              canGoBack={true}
              canGoNext={false}
              showBack={true}
              showNext={false}
            />
          </>
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
                <CountrySelector
                  selectedCountries={watch('countries') || []}
                  onChange={selected => {
                    setValue('countries', selected);
                    dispatch(setCountries(selected));
                  }}
                  error={!!errors.countries}
                />
              ) : currentQuestion.id === 'entities' ? (
                renderEntitySelection()
              ) : currentQuestion.id === 'dataSubjectType' ? (
                (currentQuestion.options as DataSubjectCategory[]).map(option => renderDataSubjectOptionPanel(option))
              ) : currentQuestion.id === 'recipientType' ? (
                <OptionsContainer>
                  {RECIPIENT_TYPES.map(option => (
                    <TooltipWrapper key={option} tooltipText={option}>
                      <OptionPanel
                        option={option}
                        isSelected={(watch(currentQuestion.id) || []).includes(option)}
                        description={getOptionDescription(option)}
                        onClick={(e) => handleOptionSelect(e, option)}
                      />
                    </TooltipWrapper>
                  ))}
                </OptionsContainer>
              ) : currentQuestion.id === 'reviewDataTransferPurpose' ? (
                renderReviewDataTransferPurpose()
              ) : (
                <OptionsContainer>
                  {(currentQuestion.options as string[]).map(option => (
                    <TooltipWrapper key={option} tooltipText={option}>
                      <OptionPanel
                        option={option}
                        isSelected={(watch(currentQuestion.id) || []).includes(option)}
                        description={getOptionDescription(option)}
                        onClick={(e) => handleOptionSelect(e, option)}
                      />
                    </TooltipWrapper>
                  ))}
                </OptionsContainer>
              )}
              {errors[currentQuestion.id] && (
                <ErrorMessage>Please select at least one option</ErrorMessage>
              )}
              
              {/* Navigation Buttons */}
              <NavigationButtons
                onBack={handleBack}
                onNext={handleNext}
                canGoBack={currentStep > 0}
                canGoNext={isCurrentStepCompleted() && currentStep < questions.length - 1}
                showBack={currentStep > 0}
                showNext={currentStep < questions.length - 1}
                nextText={currentStep === questions.length - 2 ? 'Review' : 'Next'}
              />
            </>
          </QuestionContainer>
        )}
        {activeAzureTab === null && currentStep === questions.length - 1 && (
          <>
            <SubmitButton 
              type="submit" 
              disabled={
                !isAllStepsCompleted() || 
                (currentQuestion.id === 'reviewDataTransferPurpose' && !isReviewDataTransferPurposeValid) ||
                (watch('entities') || []).length > MAX_ENTITIES
              }
            >
              View Output
            </SubmitButton>
            {currentQuestion.id === 'reviewDataTransferPurpose' && !isReviewDataTransferPurposeValid && (
              <ErrorMessage style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
                Please select at least one item for each recipient type to proceed.
              </ErrorMessage>
            )}
            {(watch('entities') || []).length > MAX_ENTITIES && (
              <ErrorMessage style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
                Cannot proceed: You have selected {(watch('entities') || []).length} entities, which exceeds the maximum limit of {MAX_ENTITIES}.
              </ErrorMessage>
            )}
            {/* Navigation Buttons for final step */}
            <NavigationButtons
              onBack={handleBack}
              onNext={() => {}} // No next action on final step
              canGoBack={true}
              canGoNext={false}
              showBack={true}
              showNext={false}
            />
          </>
        )}
      </ContentContainer>
    </Form>
  );
} 