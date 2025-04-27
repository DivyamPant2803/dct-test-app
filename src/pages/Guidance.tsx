import styled from 'styled-components';
import { useState } from 'react';
import Questionnaire from '../components/Questionnaire/Questionnaire';
import ResultsTable from '../components/ResultsTable';
import { INITIAL_FORM_DATA, FormData } from '../App';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  padding: 2rem;
`;

const Title = styled.h2`
  color: #222;
  margin-bottom: 1rem;
`;

const BackButton = styled.button`
  margin-bottom: 1rem;
  background: none;
  border: none;
  color: #ff0000;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
  &:hover {
    background-color: #fff5f5;
  }
`;

const Guidance = () => {
  const [showResults, setShowResults] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  const handleQuestionnaireComplete = (data: Partial<FormData>) => {
    const processedData = {
      ...INITIAL_FORM_DATA,
      ...data,
      entities: {
        ...INITIAL_FORM_DATA.entities,
        ...(data.entities || {})
      }
    };
    setFormData(processedData);
    setShowResults(true);
  };

  const transformFormDataForTable = (data: FormData) => {
    const allEntities = data.countries.reduce((acc: string[], country: string) => {
      const countryEntities = data.entities[country] || [];
      return [...acc, ...countryEntities];
    }, []);
    return {
      informationCategory: data.informationCategory || [],
      dataSubjectType: data.dataSubjectType || [],
      countries: data.countries || [],
      entities: allEntities,
      recipientType: data.recipientType || []
    };
  };

  return (
    <Container>
      {showResults && (
        <BackButton onClick={() => setShowResults(false)}>
          ← Back to Questionnaire
        </BackButton>
      )}
      {!showResults ? (
        <Questionnaire onComplete={handleQuestionnaireComplete} />
      ) : (
        <ResultsTable formData={transformFormDataForTable(formData)} />
      )}
    </Container>
  );
};

export default Guidance; 