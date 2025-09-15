import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PersonaType, PersonaConfig } from '../types/persona';

interface PersonaContextType {
  currentPersona: PersonaType;
  setCurrentPersona: (persona: PersonaType) => void;
  availablePersonas: PersonaConfig[];
  isDemoMode: boolean;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

// Available personas configuration
const AVAILABLE_PERSONAS: PersonaConfig[] = [
  {
    id: 'user',
    name: 'End User',
    icon: '👤',
    color: '#4CAF50',
    description: 'Basic user functionality for managing transfers'
  },
  {
    id: 'admin',
    name: 'Administrator',
    icon: '⚙️',
    color: '#FF9800',
    description: 'Full administrative access and system management'
  },
  {
    id: 'legal',
    name: 'Legal',
    icon: '⚖️',
    color: '#9C27B0',
    description: 'Legal review and compliance management'
  },
  {
    id: 'business',
    name: 'Business',
    icon: '💼',
    color: '#2196F3',
    description: 'Business process management and approval'
  },
  {
    id: 'diso',
    name: 'DISO',
    icon: '🔒',
    color: '#F44336',
    description: 'Data security and risk assessment'
  },
];

interface PersonaProviderProps {
  children: ReactNode;
}

export const PersonaProvider: React.FC<PersonaProviderProps> = ({ children }) => {
  const [currentPersona, setCurrentPersona] = useState<PersonaType>('user');
  const [isDemoMode] = useState(true); // Always true for demo purposes

  // Load persona from localStorage on mount
  useEffect(() => {
    const savedPersona = localStorage.getItem('dct-current-persona') as PersonaType;
    console.log('Loading persona from localStorage:', savedPersona);
    if (savedPersona && AVAILABLE_PERSONAS.some(p => p.id === savedPersona)) {
      setCurrentPersona(savedPersona);
    } else {
      console.log('No valid persona found in localStorage, keeping current:', currentPersona);
    }
  }, []);

  // Save persona to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('dct-current-persona', currentPersona);
  }, [currentPersona]);

  const handleSetCurrentPersona = (persona: PersonaType) => {
    console.log('Persona changing from', currentPersona, 'to', persona);
    setCurrentPersona(persona);
  };

  const value: PersonaContextType = {
    currentPersona,
    setCurrentPersona: handleSetCurrentPersona,
    availablePersonas: AVAILABLE_PERSONAS,
    isDemoMode
  };

  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  );
};

export const usePersona = (): PersonaContextType => {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
};
