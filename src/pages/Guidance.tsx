import styled from 'styled-components';
import { useState } from 'react';
import Questionnaire from '../components/Questionnaire/Questionnaire';
import { INITIAL_FORM_DATA, FormData } from '../App';
import OutputRedesign from './OutputRedesign';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  padding: 2rem;
  position: relative;
`;


const Guidance = () => {
  const [showResults, setShowResults] = useState<boolean>(false);
  const [_, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

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

  return (
    <Container>
      {!showResults ? (
        <Questionnaire onComplete={handleQuestionnaireComplete} />
      ) : (
        <OutputRedesign />
      )}
    </Container>
  );
};

export default Guidance; 