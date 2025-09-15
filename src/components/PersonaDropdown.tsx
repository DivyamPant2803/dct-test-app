import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiChevronDown } from 'react-icons/fi';
import { usePersona } from '../contexts/PersonaContext';

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownTrigger = styled.button`
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
  min-width: 160px;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;


const PersonaName = styled.span`
  flex: 1;
  text-align: left;
`;

const ChevronIcon = styled(FiChevronDown)<{ $isOpen: boolean }>`
  transition: transform 0.2s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.25rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;
`;

const DropdownItem = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.$isActive ? '#f3f4f6' : 'transparent'};
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


const ItemContent = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 500;
  color: #111827;
`;

const ItemDescription = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
`;

// const DemoModeBanner = styled.div`
//   padding: 0.5rem 1rem;
//   background: #fef3c7;
//   border-bottom: 1px solid #f59e0b;
//   font-size: 0.75rem;
//   color: #92400e;
//   text-align: center;
//   font-weight: 500;
// `;

const PersonaDropdown: React.FC = () => {
  const { currentPersona, setCurrentPersona, availablePersonas } = usePersona();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentPersonaConfig = availablePersonas.find(p => p.id === currentPersona);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePersonaChange = (personaId: string) => {
    setCurrentPersona(personaId as any);
    setIsOpen(false);
  };

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownTrigger onClick={() => setIsOpen(!isOpen)}>
        <PersonaName>{currentPersonaConfig?.name || 'Select Persona'}</PersonaName>
        <ChevronIcon $isOpen={isOpen} size={16} />
      </DropdownTrigger>

      <DropdownMenu $isOpen={isOpen}>
        {availablePersonas.map((persona) => (
          <DropdownItem
            key={persona.id}
            $isActive={persona.id === currentPersona}
            onClick={() => handlePersonaChange(persona.id)}
          >
            <ItemContent>
              <ItemName>{persona.name}</ItemName>
              <ItemDescription>{persona.description}</ItemDescription>
            </ItemContent>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </DropdownContainer>
  );
};

export default PersonaDropdown;
