import { useState } from 'react'
import styled from 'styled-components'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Questionnaire from './components/Questionnaire'
import ResultsTable from './components/ResultsTable'
import './App.css'
import { createGlobalStyle } from 'styled-components'

const queryClient = new QueryClient()

// Add type definitions
type CountryEntities = {
  'United States': string[];
  'Germany': string[];
  'Singapore': string[];
  'United Kingdom': string[];
  [key: string]: string[]; // Allow additional countries
};

type FormData = {
  informationCategory: string[];
  dataSubjectType: string[];
  countries: string[];
  entities: CountryEntities;
  recipientType: string[];
};

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    width: 100vw;
    height: 100vh;
  }

  #root {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
`

const AppContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: white;
  color: black;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Header = styled.header`
  width: 100%;
  height: 60px;
  padding: 0.75rem 2rem;
  border-bottom: 2px solid #ff0000;
  text-align: center;
  position: relative;
  flex-shrink: 0;
  background: white;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Main = styled.main`
  flex: 1;
  display: flex;
  width: 100%;
  height: calc(100vh - 60px);
  position: relative;
  background: #f5f5f5;
  overflow: hidden;
`

const Title = styled.h1`
  color: black;
  margin: 0;
  font-size: 1.5rem;
`

const Subtitle = styled.p`
  color: #666;
  margin-top: 0.25rem;
  font-size: 0.85rem;
`

const BackButton = styled.button`
  position: absolute;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #ff0000;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #fff5f5;
  }
`

const INITIAL_FORM_DATA: FormData = {
  informationCategory: ['Employee'],
  dataSubjectType: ['Current Employee'],
  countries: ['United States', 'Germany', 'Singapore', 'United Kingdom'],
  entities: {
    'United States': ['US Corp', 'US Tech Solutions', 'US Data Services'],
    'Germany': ['German GmbH', 'Deutsche Tech AG'],
    'Singapore': ['SG Pte Ltd', 'APAC Services'],
    'United Kingdom': ['UK Ltd', 'British Services']
  },
  recipientType: ['Group Entity']
}

function App() {
  const [showResults, setShowResults] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)

  const handleQuestionnaireComplete = (data: Partial<FormData>) => {
    console.log('Questionnaire completed with data:', data);
    
    // Initialize with default structure
    const entitiesMap: CountryEntities = {
      'United States': [],
      'Germany': [],
      'Singapore': [],
      'United Kingdom': []
    };

    // Only add entities for selected countries
    const selectedCountries = Array.isArray(data.countries) ? data.countries : [];
    selectedCountries.forEach(country => {
      if (INITIAL_FORM_DATA.entities[country]) {
        entitiesMap[country] = [...INITIAL_FORM_DATA.entities[country]];
      }
    });

    // Process and validate all fields
    const processedData: FormData = {
      informationCategory: data.informationCategory?.filter((item): item is string => Boolean(item)) || INITIAL_FORM_DATA.informationCategory,
      dataSubjectType: data.dataSubjectType?.filter((item): item is string => Boolean(item)) || INITIAL_FORM_DATA.dataSubjectType,
      countries: data.countries?.filter((item): item is string => Boolean(item)) || INITIAL_FORM_DATA.countries,
      entities: entitiesMap,
      recipientType: data.recipientType?.filter((item): item is string => Boolean(item)) || INITIAL_FORM_DATA.recipientType
    };

    console.log('Processed form data:', processedData);
    setFormData(processedData);
    setShowResults(true);
  }

  // Transform entities data structure for ResultsTable
  const transformFormDataForTable = (data: FormData) => {
    // Get all entities for selected countries
    const allEntities = data.countries.reduce((acc: string[], country: string) => {
      const countryEntities = data.entities[country] || [];
      return [...acc, ...countryEntities];
    }, []);

    // Create the transformed data structure
    const transformedData = {
      informationCategory: data.informationCategory,
      dataSubjectType: data.dataSubjectType,
      countries: data.countries,
      entities: Array.from(new Set(allEntities)), // Remove duplicates
      recipientType: data.recipientType
    };

    console.log('Transformed data for table:', transformedData);
    return transformedData;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStyle />
      <AppContainer>
        <Header>
          {showResults && (
            <BackButton onClick={() => setShowResults(false)}>
              ← Back to Questionnaire
            </BackButton>
          )}
          <Title>Data Transfer Compliance Assessment</Title>
          <Subtitle>Evaluate your data transfer requirements</Subtitle>
        </Header>
        <Main>
          {!showResults ? (
            <Questionnaire onComplete={handleQuestionnaireComplete} />
          ) : (
            <ResultsTable formData={transformFormDataForTable(formData)} />
          )}
        </Main>
      </AppContainer>
    </QueryClientProvider>
  )
}

export default App
