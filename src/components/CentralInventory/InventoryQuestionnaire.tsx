import React from 'react';
import styled from 'styled-components';
import Questionnaire from '../Questionnaire/Questionnaire';
import { FormData } from '../../App';

const QuestionnaireWrapper = styled.div`
  position: relative;
  min-height: 600px;
  width: 100%;
`;

interface InventoryQuestionnaireProps {
  onComplete: (data: Partial<FormData>) => void;
  questionnaireData: Partial<FormData> | null;
}

const InventoryQuestionnaire: React.FC<InventoryQuestionnaireProps> = ({ 
  onComplete
}) => {
  const handleQuestionnaireComplete = (data: Partial<FormData>) => {
    onComplete(data);
  };

  return (
    <QuestionnaireWrapper>
      <Questionnaire onComplete={handleQuestionnaireComplete} />
    </QuestionnaireWrapper>
  );
};

export default InventoryQuestionnaire;

