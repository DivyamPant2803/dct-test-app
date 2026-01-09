import React from 'react';
import styled from 'styled-components';
import { TemplateSection, TemplateField } from '../../types/index';
import { colors, borderRadius, spacing } from '../../styles/designTokens';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
  min-height: 100%;
  overflow-y: auto;
  padding: ${spacing.xl};
  background: ${colors.neutral.gray50};
`;

const SectionCard = styled.div<{ $collapsed: boolean }>`
  background: white;
  border: 1px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.lg};
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.lg} ${spacing.xl};
  background: ${colors.neutral.gray50};
  border-bottom: 1px solid ${colors.neutral.gray200};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${colors.neutral.gray100};
  }
`;

const SectionTitle = styled.h4`
  font-size: 1.05rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${spacing.md};
`;

const SectionContent = styled.div<{ $collapsed: boolean }>`
  padding: ${props => props.$collapsed ? '0' : `${spacing.xl} ${spacing.xl}`};
  max-height: ${props => props.$collapsed ? '0' : '100%'};
  overflow: ${props => props.$collapsed ? 'hidden' : 'visible'};
  opacity: ${props => props.$collapsed ? '0' : '1'};
  transition: all 0.3s ease;
  display: ${props => props.$collapsed ? 'none' : 'block'};
`;

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${spacing.lg};
  row-gap: ${spacing.xl};
`;

const FieldGroup = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  ${props => props.$fullWidth && 'grid-column: 1 / -1;'}
`;

const FieldLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: ${spacing.xs};
`;

const FieldValue = styled.div`
  font-size: 1rem;
  color: ${colors.text.primary};
  padding: ${spacing.md} ${spacing.lg};
  background: white;
  border-radius: ${borderRadius.base};
  border: 1px solid ${colors.neutral.gray300};
  min-height: 52px;
  line-height: 1.6;
  display: flex;
  align-items: center;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-weight: 500;
  
  &:empty::before {
    content: '-';
    color: ${colors.text.secondary};
    font-weight: 400;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  border: 1px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.base};
  margin-top: ${spacing.sm};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: ${colors.neutral.gray50};
  padding: ${spacing.sm} ${spacing.md};
  text-align: left;
  font-weight: 600;
  font-size: 0.85rem;
  color: ${colors.text.primary};
  border-bottom: 2px solid ${colors.neutral.gray200};
`;

const Td = styled.td`
  padding: ${spacing.sm} ${spacing.md};
  border-bottom: 1px solid ${colors.neutral.gray100};
  font-size: 0.9rem;
  color: ${colors.text.primary};
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm};
  background: ${colors.neutral.gray50};
  border-radius: ${borderRadius.sm};
  font-size: 0.85rem;
`;

interface TemplateDataDisplayProps {
  sections: TemplateSection[];
  filledData: Record<string, any>;
  tableData?: Record<string, any[]>;
  fileData?: Record<string, any[]>;
}

const TemplateDataDisplay: React.FC<TemplateDataDisplayProps> = ({
  sections,
  filledData,
  tableData = {},
  fileData = {},
}) => {
  // Debug logging
  console.log('[TemplateDataDisplay] Component rendered with:', {
    sectionsCount: sections.length,
    sections: sections.map(s => ({ id: s.id, title: s.title, fieldsCount: s.fields.length })),
    filledDataKeys: Object.keys(filledData),
    tableDataKeys: Object.keys(tableData),
    fileDataKeys: Object.keys(fileData),
    sampleFilledData: filledData,
  });

  // Start with all sections EXPANDED (empty Set = nothing collapsed)
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const renderFieldValue = (field: TemplateField): React.ReactNode => {
    const value = filledData[field.id];
    
    console.log(`[TemplateDataDisplay] Rendering field "${field.id}":`, {
      fieldType: field.type,
      value: value,
      hasValue: !!value,
      allFilledDataKeys: Object.keys(filledData)
    });

    // Table field
    if (field.type === 'table' && tableData[field.id]) {
      const rows = tableData[field.id];
      if (!rows || rows.length === 0) return <FieldValue>No data</FieldValue>;

      return (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                {field.tableConfig?.columns.map(col => (
                  <Th key={col.id}>{col.label}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  {field.tableConfig?.columns.map(col => (
                    <Td key={col.id}>{row[col.id] || '-'}</Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      );
    }

    // File field
    if ((field.type === 'file' || field.type === 'file-multiple') && fileData[field.id]) {
      const files = fileData[field.id];
      if (!files || files.length === 0) return <FieldValue>No files attached</FieldValue>;

      return (
        <FileList>
          {files.map((file: any, idx: number) => (
            <FileItem key={idx}>
              📄 {file.fileName || file.name} ({((file.fileSize || file.size) / 1024).toFixed(1)} KB)
            </FileItem>
          ))}
        </FileList>
      );
    }

    // Checkbox field
    if (field.type === 'checkbox') {
      return <FieldValue>{value ? '✓ Yes' : '✗ No'}</FieldValue>;
    }

    // Regular field (text, textarea, select, etc.)
    const displayValue = value !== null && value !== undefined && value !== '' ? String(value) : '-';
    console.log(`[TemplateDataDisplay] Rendering regular field "${field.id}" with display value:`, displayValue);
    return <FieldValue>{displayValue}</FieldValue>;
  };


  console.log('[TemplateDataDisplay] RENDERING - Sections count:', sections.length);
  console.log('[TemplateDataDisplay] RENDERING - Sections:', sections);

  return (
    <Container>
      {sections.map(section => {
        const isCollapsed = collapsedSections.has(section.id);
        console.log(`[TemplateDataDisplay] Rendering section: ${section.title}, collapsed: ${isCollapsed}`);
        
        return (
          <SectionCard key={section.id} $collapsed={isCollapsed}>
            <SectionHeader onClick={() => toggleSection(section.id)}>
              <SectionTitle>
                {isCollapsed ? <FiChevronRight /> : <FiChevronDown />}
                {section.title}
              </SectionTitle>
            </SectionHeader>
            <SectionContent $collapsed={isCollapsed}>
              {section.description && (
                <div style={{ marginBottom: spacing.md, color: colors.text.secondary, fontSize: '0.9rem' }}>
                  {section.description}
                </div>
              )}
              <FieldsGrid>
                {section.fields.map(field => (
                  <FieldGroup 
                    key={field.id}
                    $fullWidth={field.width === 'full' || field.type === 'table' || field.type === 'file-multiple'}
                  >
                    <FieldLabel>{field.label}</FieldLabel>
                    {renderFieldValue(field)}
                  </FieldGroup>
                ))}
              </FieldsGrid>
            </SectionContent>
          </SectionCard>
        );
      })}
    </Container>
  );
};

export default TemplateDataDisplay;
