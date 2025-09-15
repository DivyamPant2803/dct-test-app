import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { AUTHORITY_CONFIGS } from '../config/personaConfig';

const TextAreaContainer = styled.div`
  position: relative;
  width: 100%;
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s ease;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #222;
  }
`;

const MentionDropdown = styled.div<{ $isVisible: boolean; $position: { top: number; left: number } }>`
  position: absolute;
  top: ${props => props.$position.top}px;
  left: ${props => props.$position.left}px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  min-width: 200px;
  max-height: 200px;
  overflow-y: auto;
  opacity: ${props => props.$isVisible ? 1 : 0};
  visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
  transform: ${props => props.$isVisible ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;
`;

const MentionItem = styled.button<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.$isSelected ? '#f3f4f6' : 'transparent'};
  color: #374151;
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #f9fafb;
  }

  &:first-child {
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }

  &:last-child {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }
`;

const MentionIcon = styled.span`
  font-size: 1rem;
  width: 20px;
  text-align: center;
`;

const MentionContent = styled.div`
  flex: 1;
`;

const MentionName = styled.div`
  font-weight: 500;
  color: #111827;
`;

const MentionDescription = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
`;


interface AuthorityTaggingProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const AuthorityTagging: React.FC<AuthorityTaggingProps> = ({
  value,
  onChange,
  placeholder = "Add your review comments here...",
  disabled = false
}) => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter authorities based on query
  const filteredAuthorities = Object.values(AUTHORITY_CONFIGS).filter(authority =>
    authority.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Handle text change and detect @ mentions
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    // Check if user is typing @mention
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Check if there's no space after @ (meaning user is still typing the mention)
      if (!textAfterAt.includes(' ')) {
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        updateMentionPosition();
        setSelectedMentionIndex(0);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
    
    onChange(newValue);
  };

  // Update mention dropdown position
  const updateMentionPosition = () => {
    if (textareaRef.current) {
      const rect = textareaRef.current.getBoundingClientRect();
      setMentionPosition({
        top: rect.bottom - rect.top + 5,
        left: 0
      });
    }
  };

  // Handle mention selection
  const handleMentionSelect = (authority: typeof AUTHORITY_CONFIGS[keyof typeof AUTHORITY_CONFIGS]) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    
    // Find the last @ and replace the query with the selected authority
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const newText = textBeforeCursor.substring(0, lastAtIndex) + 
                   `@${authority.name}` + 
                   textAfterCursor;
    
    onChange(newText);
    setShowMentions(false);
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPosition = lastAtIndex + authority.name.length + 1;
      textareaRef.current?.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filteredAuthorities.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedMentionIndex(prev => 
            prev < filteredAuthorities.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedMentionIndex(prev => 
            prev > 0 ? prev - 1 : filteredAuthorities.length - 1
          );
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          if (filteredAuthorities[selectedMentionIndex]) {
            handleMentionSelect(filteredAuthorities[selectedMentionIndex]);
          }
          break;
        case 'Escape':
          setShowMentions(false);
          break;
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
        setShowMentions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <TextAreaContainer>
      <TextArea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      
      <MentionDropdown
        ref={dropdownRef}
        $isVisible={showMentions && filteredAuthorities.length > 0}
        $position={mentionPosition}
      >
        {filteredAuthorities.map((authority, index) => (
          <MentionItem
            key={authority.name}
            $isSelected={index === selectedMentionIndex}
            onClick={() => handleMentionSelect(authority)}
          >
            <MentionIcon>{authority.icon || '🏢'}</MentionIcon>
            <MentionContent>
              <MentionName>@{authority.name}</MentionName>
              <MentionDescription>{authority.description}</MentionDescription>
            </MentionContent>
          </MentionItem>
        ))}
      </MentionDropdown>
    </TextAreaContainer>
  );
};

export default AuthorityTagging;
