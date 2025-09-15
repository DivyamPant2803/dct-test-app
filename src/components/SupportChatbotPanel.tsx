import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiSend, FiX, FiMessageCircle, FiLoader } from 'react-icons/fi';
import { useAIChat } from '../hooks/useAIApi';
import { ChatMsg } from '../types/index';

const PanelOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: flex-end;
  z-index: 2000;
  padding: 1rem;
`;

const PanelContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  height: 80vh;
  max-height: 700px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  flex-shrink: 0;
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #222;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const ContextToggle = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  flex-shrink: 0;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  margin: 0;
`;

const QuickChips = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  flex-shrink: 0;
`;

const QuickChipsTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.75rem;
`;

const ChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Chip = styled.button`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  background: white;
  color: #374151;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled.div<{ $isUser: boolean }>`
  display: flex;
  justify-content: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div<{ $isUser: boolean }>`
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: ${props => props.$isUser ? '#222' : '#f3f4f6'};
  color: ${props => props.$isUser ? 'white' : '#374151'};
  font-size: 0.875rem;
  line-height: 1.5;
  word-wrap: break-word;
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
  text-align: center;
`;

const SourceSnippet = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #0369a1;
`;

const SourceLink = styled.a`
  color: #0369a1;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #0284c7;
  }
`;

const InputContainer = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  background: #f8f9fa;
  flex-shrink: 0;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: none;
  min-height: 40px;
  max-height: 120px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #222;
    box-shadow: 0 0 0 2px rgba(34, 34, 34, 0.1);
  }
`;

const SendButton = styled.button<{ $disabled?: boolean }>`
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.$disabled ? '#d1d5db' : '#222'};
  color: ${props => props.$disabled ? '#9ca3af' : 'white'};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #444;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  font-style: italic;
`;

const LoadingSpinner = styled(FiLoader)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Disclaimer = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: #0369a1;
`;

interface SupportChatbotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  contextRequirementId?: string;
}

const SupportChatbotPanel: React.FC<SupportChatbotPanelProps> = ({
  isOpen,
  onClose,
  contextRequirementId
}) => {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState('');
  const [useContext, setUseContext] = useState(!!contextRequirementId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { sendMessage, getChatHistory, loading } = useAIChat();

  useEffect(() => {
    if (isOpen) {
      // Load chat history when panel opens
      const history = getChatHistory(contextRequirementId);
      setMessages(history);
    }
  }, [isOpen, contextRequirementId, getChatHistory]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: ChatMsg = {
      id: `msg_${Date.now()}`,
      role: 'user',
      text: inputText.trim(),
      createdAt: new Date().toISOString(),
      contextRequirementId: useContext ? contextRequirementId : undefined
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');

    // Send to AI and get response
    const updatedMessages = await sendMessage(
      newMessages, 
      useContext ? contextRequirementId : undefined
    );
    setMessages(updatedMessages);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickChip = (text: string) => {
    setInputText(text);
  };

  // const handleClearHistory = () => {
  //   clearChatHistory(contextRequirementId);
  //   setMessages([]);
  // };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <PanelOverlay $isOpen={isOpen} onClick={onClose}>
      <PanelContainer onClick={e => e.stopPropagation()}>
        <PanelHeader>
          <PanelTitle>
            <FiMessageCircle />
            Support Assistant
          </PanelTitle>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </PanelHeader>

        {contextRequirementId && (
          <ContextToggle>
            <ToggleLabel>
              <ToggleInput
                type="checkbox"
                checked={useContext}
                onChange={(e) => setUseContext(e.target.checked)}
              />
              Use context from selected requirement
            </ToggleLabel>
          </ContextToggle>
        )}

        <QuickChips>
          <QuickChipsTitle>Quick questions:</QuickChipsTitle>
          <ChipsContainer>
            <Chip onClick={() => handleQuickChip('What evidence is needed?')}>
              What evidence is needed?
            </Chip>
            <Chip onClick={() => handleQuickChip('Upload steps')}>
              Upload steps
            </Chip>
            <Chip onClick={() => handleQuickChip('Escalation policy')}>
              Escalation policy
            </Chip>
          </ChipsContainer>
        </QuickChips>

        <MessagesContainer>
          <Disclaimer>
            ⚠️ AI guidance only; refer to original requirement for authoritative legal text.
          </Disclaimer>

          {messages.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              color: '#9ca3af', 
              fontStyle: 'italic',
              marginTop: '2rem'
            }}>
              Ask me anything about compliance requirements!
            </div>
          )}

          {messages.map((message) => (
            <Message key={message.id} $isUser={message.role === 'user'}>
              <div>
                <MessageBubble $isUser={message.role === 'user'}>
                  {message.text}
                </MessageBubble>
                <MessageTime>{formatTime(message.createdAt)}</MessageTime>
                
                {message.role === 'assistant' && message.contextRequirementId && (
                  <SourceSnippet>
                    <strong>Source:</strong> Requirement {message.contextRequirementId}
                    <br />
                    <SourceLink href="#" onClick={(e) => e.preventDefault()}>
                      View requirement details
                    </SourceLink>
                  </SourceSnippet>
                )}
              </div>
            </Message>
          ))}

          {loading && (
            <Message $isUser={false}>
              <div>
                <MessageBubble $isUser={false}>
                  <LoadingMessage>
                    <LoadingSpinner />
                    Thinking...
                  </LoadingMessage>
                </MessageBubble>
              </div>
            </Message>
          )}

          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputContainer>
          <InputWrapper>
            <MessageInput
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about compliance requirements..."
              rows={1}
            />
            <SendButton 
              onClick={handleSendMessage}
              $disabled={!inputText.trim() || loading}
            >
              <FiSend size={16} />
            </SendButton>
          </InputWrapper>
        </InputContainer>
      </PanelContainer>
    </PanelOverlay>
  );
};

export default SupportChatbotPanel;
