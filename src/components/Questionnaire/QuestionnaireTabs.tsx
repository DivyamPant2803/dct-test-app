import React from 'react';
import {
  TabsContainer,
  TabGroup,
  TabGroupHeader,
  TabGroupContent,
  Tab,
  ProgressIndicator,
  StepNumber,
  ExpandButton
} from './Questionnaire.styles';
import type { Question } from './Questionnaire.types';

interface QuestionnaireTabsProps {
  currentStep: number;
  enabledSteps: number[];
  completedSteps: number[];
  handleTabClick: (index: number) => void;
  questions: Question[];
  isQuestionsExpanded: boolean;
  setIsQuestionsExpanded: (v: boolean) => void;
  isSubsequentExpanded: boolean;
  setIsSubsequentExpanded: (v: boolean) => void;
  isOutputExpanded: boolean;
  setIsOutputExpanded: (v: boolean) => void;
  isAllStepsCompleted: () => boolean;
}

const QuestionnaireTabs: React.FC<QuestionnaireTabsProps> = ({
  currentStep,
  enabledSteps,
  completedSteps,
  handleTabClick,
  questions,
  isQuestionsExpanded,
  setIsQuestionsExpanded,
  isSubsequentExpanded,
  setIsSubsequentExpanded,
  isOutputExpanded,
  setIsOutputExpanded,
  isAllStepsCompleted
}) => (
  <TabsContainer>
    <TabGroup>
      <TabGroupHeader 
        isExpanded={isQuestionsExpanded}
        onClick={e => {
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
          const isDisabled = !enabledSteps.includes(index) && !completedSteps.includes(index);
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
        onClick={e => {
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
        onClick={e => {
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
);

export default QuestionnaireTabs; 