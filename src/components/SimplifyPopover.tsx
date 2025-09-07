import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiCopy, FiThumbsUp, FiThumbsDown, FiX, FiLoader } from 'react-icons/fi';
import { useAISummarize } from '../hooks/useAIApi';
import { AISummary } from '../types/index';

const PopoverOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const PopoverContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const PopoverHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
`;

const PopoverTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #222;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background: #f0f0f0;
    color: #222;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#222' : '#666'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  border-bottom: 2px solid ${props => props.$active ? '#222' : 'transparent'};
  
  &:hover {
    background: ${props => props.$active ? 'white' : '#f0f0f0'};
    color: #222;
  }
`;

const TabContent = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const ContentArea = styled.div`
  flex: 1;
  margin-bottom: 1rem;
`;

const SummaryContent = styled.div`
  line-height: 1.6;
  color: #374151;
  white-space: pre-line;
`;

const OriginalContent = styled.div`
  line-height: 1.6;
  color: #374151;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #666;
`;

const LoadingSpinner = styled(FiLoader)`
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const Disclaimer = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #0369a1;
`;

const Footer = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const FeedbackButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FeedbackButton = styled.button<{ $helpful?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border: 1px solid ${props => props.$helpful ? '#10b981' : '#d1d5db'};
  border-radius: 6px;
  background: ${props => props.$helpful ? '#ecfdf5' : 'white'};
  color: ${props => props.$helpful ? '#059669' : '#6b7280'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;

  &:hover {
    background: ${props => props.$helpful ? '#d1fae5' : '#f9fafb'};
  }
`;

interface SimplifyPopoverProps {
  requirementId: string;
  originalText: string;
  onClose: () => void;
}

const SimplifyPopover: React.FC<SimplifyPopoverProps> = ({
  requirementId,
  originalText,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'original'>('summary');
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { summarizeRequirement, loading, error } = useAISummarize();

  useEffect(() => {
    // Load summary when component mounts
    const loadSummary = async () => {
      const result = await summarizeRequirement(requirementId, 1);
      if (result) {
        setSummary(result);
      }
    };
    
    loadSummary();
  }, [requirementId, summarizeRequirement]);

  const handleCopy = async () => {
    const textToCopy = activeTab === 'summary' && summary ? summary.summary : originalText;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    setFeedback(type);
    // In a real implementation, this would send feedback to the backend
    console.log(`Feedback: ${type} for requirement ${requirementId}`);
  };

  return (
    <PopoverOverlay onClick={onClose}>
      <PopoverContainer onClick={e => e.stopPropagation()}>
        <PopoverHeader>
          <PopoverTitle>Simplify Legal Requirement</PopoverTitle>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </PopoverHeader>

        <TabsContainer>
          <Tab 
            $active={activeTab === 'summary'} 
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </Tab>
          <Tab 
            $active={activeTab === 'original'} 
            onClick={() => setActiveTab('original')}
          >
            Original
          </Tab>
        </TabsContainer>

        <TabContent>
          <Disclaimer>
            ⚠️ AI guidance only; refer to original requirement for authoritative legal text.
          </Disclaimer>

          {error && (
            <ErrorMessage>
              Failed to generate summary. Please try again.
            </ErrorMessage>
          )}

          <ContentArea>
            {activeTab === 'summary' ? (
              loading ? (
                <LoadingContainer>
                  <LoadingSpinner />
                  Generating plain-language summary...
                </LoadingContainer>
              ) : summary ? (
                <SummaryContent>{summary.summary}</SummaryContent>
              ) : (
                <div>No summary available</div>
              )
            ) : (
              <OriginalContent>{originalText}</OriginalContent>
            )}
          </ContentArea>

          <Footer>
            <ActionButtons>
              <ActionButton onClick={handleCopy}>
                <FiCopy size={14} />
                {copied ? 'Copied!' : 'Copy'}
              </ActionButton>
            </ActionButtons>

            <FeedbackButtons>
              <span style={{ fontSize: '0.875rem', color: '#6b7280', marginRight: '0.5rem' }}>
                Was this helpful?
              </span>
              <FeedbackButton 
                $helpful={feedback === 'helpful'}
                onClick={() => handleFeedback('helpful')}
              >
                <FiThumbsUp size={14} />
                👍
              </FeedbackButton>
              <FeedbackButton 
                $helpful={feedback === 'not-helpful'}
                onClick={() => handleFeedback('not-helpful')}
              >
                <FiThumbsDown size={14} />
                👎
              </FeedbackButton>
            </FeedbackButtons>
          </Footer>
        </TabContent>
      </PopoverContainer>
    </PopoverOverlay>
  );
};

export default SimplifyPopover;
