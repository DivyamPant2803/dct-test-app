import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

interface SelectOption {
  value: string;
  label: string;
}

interface StyledSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const SelectContainer = styled.div<{ $disabled?: boolean }>`
  position: relative;
  min-width: 150px;
  opacity: ${props => props.$disabled ? 0.6 : 1};
  pointer-events: ${props => props.$disabled ? 'none' : 'auto'};
`;

const SelectButton = styled.button<{ $isOpen: boolean; $hasValue: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  border: 2px solid ${props => props.$isOpen ? '#222' : '#e1e5e9'};
  border-radius: 8px;
  background: white;
  color: ${props => props.$hasValue ? '#222' : '#6b7280'};
  font-size: 0.9rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    border-color: #222;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: none;
    border-color: #222;
    box-shadow: 0 0 0 3px rgba(34, 34, 34, 0.1);
  }
`;

const SelectText = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ChevronIcon = styled(FiChevronDown)<{ $isOpen: boolean }>`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%) ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
  color: #6b7280;
  width: 16px;
  height: 16px;
`;

const DropdownList = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #222;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-8px)'};
  transition: all 0.2s ease;
`;

const DropdownItem = styled.button<{ $isSelected: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.$isSelected ? '#f8f9fa' : 'white'};
  color: #222;
  font-size: 0.9rem;
  font-weight: ${props => props.$isSelected ? '600' : '500'};
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f1f3f4;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }

  &:focus {
    outline: none;
    background: #f8f9fa;
  }
`;

const CheckIcon = styled(FiCheck)`
  color: #222;
  width: 16px;
  height: 16px;
  opacity: 0.8;
`;

const StyledSelect: React.FC<StyledSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  disabled = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <SelectContainer ref={selectRef} $disabled={disabled} className={className}>
      <SelectButton
        $isOpen={isOpen}
        $hasValue={!!selectedOption}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <SelectText>{displayText}</SelectText>
        <ChevronIcon $isOpen={isOpen} />
      </SelectButton>
      
      <DropdownList $isOpen={isOpen} role="listbox">
        {options.map((option) => (
          <DropdownItem
            key={option.value}
            $isSelected={option.value === value}
            onClick={() => handleSelect(option.value)}
            role="option"
            aria-selected={option.value === value}
          >
            {option.label}
            {option.value === value && <CheckIcon />}
          </DropdownItem>
        ))}
      </DropdownList>
    </SelectContainer>
  );
};

export default StyledSelect;
