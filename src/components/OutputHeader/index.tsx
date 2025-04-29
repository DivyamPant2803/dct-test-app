import React from 'react';
import styled from 'styled-components';
import OutputFilters from '../OutputFilters';

const HeaderContainer = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  background: white;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
`;

const ExportButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #eee;
  border-radius: 4px;
  background: white;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f8f8;
    border-color: #ddd;
    color: #333;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

interface OutputHeaderProps {
  informationCategory: string[];
  filters: Record<string, string[]>;
  onFilterChange: (filters: Record<string, string[]>) => void;
}

const OutputHeader: React.FC<OutputHeaderProps> = ({
  informationCategory,
  filters,
  onFilterChange
}) => {
  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Exporting to PDF...');
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log('Exporting to Excel...');
  };

  return (
    <HeaderContainer>
      <ExportButtonsContainer>
        <ExportButton onClick={handleExportPDF} title="Export as PDF">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          PDF
        </ExportButton>
        <ExportButton onClick={handleExportExcel} title="Export as Excel">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="8" y1="13" x2="16" y2="13"/>
            <line x1="8" y1="17" x2="16" y2="17"/>
            <line x1="10" y1="9" x2="14" y2="9"/>
          </svg>
          Excel
        </ExportButton>
      </ExportButtonsContainer>
      <OutputFilters
        informationCategory={informationCategory}
        filters={filters}
        onFilterChange={onFilterChange}
      />
    </HeaderContainer>
  );
};

export default OutputHeader;