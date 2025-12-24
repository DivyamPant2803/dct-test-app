import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiChevronRight, 
  FiChevronDown, 
  FiPlus, 
  FiTrash2, 
  FiEye, 
  FiEyeOff, 
  FiRefreshCw, 
  FiUpload, 
  FiFile, 
  FiX 
} from 'react-icons/fi';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import { 
  UploadedTemplate, 
  TemplateSection, 
  TemplateField, 
  TableColumn,
  FileAttachment 
} from '../../types/index';
import { ApplicationData } from '../../services/applicationDataService';
import {
  loadPDFForRendering,
  renderPDFPage,
  base64ToBlob,
} from '../../utils/pdfUtils';

// ============================================================================
// Styled Components
// ============================================================================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
  width: 100%;
`;

const PreviewToggle = styled.button`
  padding: ${spacing.sm} ${spacing.md};
  background: white;
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  color: ${colors.text.primary};
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  transition: all 0.2s ease;
  align-self: flex-start;

  &:hover {
    background: ${colors.neutral.gray50};
    border-color: ${colors.neutral.black};
  }
`;

const PDFPreviewPanel = styled.div`
  background: ${colors.neutral.gray100};
  border-radius: ${borderRadius.base};
  padding: ${spacing.lg};
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  margin-bottom: ${spacing.md};
`;

const PDFCanvas = styled.canvas`
  box-shadow: ${shadows.md};
  background: white;
  max-width: 100%;
  height: auto;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl};
`;

const SectionCard = styled.div<{ $collapsed?: boolean }>`
  background: white;
  border: 1px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.sm};
  overflow: hidden;
`;

const SectionHeader = styled.div<{ $collapsible?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.lg} ${spacing.xl};
  background: ${colors.neutral.gray50};
  border-bottom: 1px solid ${colors.neutral.gray200};
  cursor: ${props => props.$collapsible ? 'pointer' : 'default'};
  transition: background 0.2s ease;

  ${props => props.$collapsible && `
    &:hover {
      background: ${colors.neutral.gray100};
    }
  `}
`;

const SectionTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0;
`;

const SectionBadge = styled.span`
  padding: 2px 8px;
  background: ${colors.neutral.gray200};
  border-radius: ${borderRadius.base};
  font-size: 0.75rem;
  color: ${colors.text.secondary};
`;

const SectionContent = styled.div<{ $collapsed?: boolean }>`
  padding: ${props => props.$collapsed ? '0' : spacing.xl};
  max-height: ${props => props.$collapsed ? '0' : '5000px'};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const SectionDescription = styled.p`
  font-size: 0.9rem;
  color: ${colors.text.secondary};
  margin: 0 0 ${spacing.lg} 0;
`;

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${spacing.md};
  
  /* Full width fields */
  & > [data-width="full"] {
    grid-column: 1 / -1;
  }
`;

const FormGroup = styled.div<{ $width?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  ${props => props.$width === 'full' && 'grid-column: 1 / -1;'}
`;

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${colors.text.primary};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
`;

const Required = styled.span`
  color: ${colors.semantic.error};
`;

const PrefillBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: ${colors.status.underReview}15;
  color: ${colors.status.underReview};
  border-radius: ${borderRadius.base};
  font-size: 0.7rem;
  font-weight: 500;
`;

const HelpText = styled.span`
  font-size: 0.8rem;
  color: ${colors.text.secondary};
  font-weight: 400;
  margin-left: ${spacing.xs};
`;

const Input = styled.input<{ $prefilled?: boolean }>`
  padding: ${spacing.md};
  border: 1px solid ${props => props.$prefilled ? colors.status.underReview : colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.95rem;
  color: ${colors.text.primary};
  transition: all 0.2s ease;
  background: ${props => props.$prefilled ? `${colors.status.underReview}05` : 'white'};

  &:focus {
    outline: none;
    border-color: ${colors.neutral.black};
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }

  &::placeholder {
    color: ${colors.neutral.gray400};
  }
`;

const TextArea = styled.textarea<{ $prefilled?: boolean }>`
  padding: ${spacing.md};
  border: 1px solid ${props => props.$prefilled ? colors.status.underReview : colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.95rem;
  font-family: inherit;
  color: ${colors.text.primary};
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s ease;
  background: ${props => props.$prefilled ? `${colors.status.underReview}05` : 'white'};

  &:focus {
    outline: none;
    border-color: ${colors.neutral.black};
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }

  &::placeholder {
    color: ${colors.neutral.gray400};
  }
`;

const Select = styled.select<{ $prefilled?: boolean }>`
  padding: ${spacing.md};
  border: 1px solid ${props => props.$prefilled ? colors.status.underReview : colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.95rem;
  color: ${colors.text.primary};
  background: ${props => props.$prefilled ? `${colors.status.underReview}05` : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.neutral.black};
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  font-weight: 400;
  color: ${colors.text.primary};
  cursor: pointer;

  input {
    cursor: pointer;
    width: 18px;
    height: 18px;
  }
`;

// Radio and Radio Group Styles
const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const RadioOption = styled.label<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${props => props.$selected ? colors.neutral.black : colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$selected ? colors.neutral.gray50 : 'white'};

  &:hover {
    border-color: ${colors.neutral.black};
  }

  input {
    width: 16px;
    height: 16px;
  }
`;

const RadioGroupHorizontal = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
`;

// File Upload Styles
const FileUploadZone = styled.div<{ $isDragging?: boolean }>`
  border: 2px dashed ${props => props.$isDragging ? colors.neutral.black : colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  padding: ${spacing.xl};
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$isDragging ? colors.neutral.gray50 : 'white'};

  &:hover {
    border-color: ${colors.neutral.black};
    background: ${colors.neutral.gray50};
  }
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  margin-top: ${spacing.sm};
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.sm} ${spacing.md};
  background: ${colors.neutral.gray50};
  border-radius: ${borderRadius.base};
  border: 1px solid ${colors.neutral.gray200};
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-weight: 500;
  color: ${colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileSize = styled.div`
  font-size: 0.75rem;
  color: ${colors.text.secondary};
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: ${colors.semantic.error};
  cursor: pointer;
  padding: ${spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${borderRadius.base};
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.semantic.error}15;
  }
`;

// Table Styles
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.base};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const Th = styled.th`
  background: ${colors.neutral.gray50};
  padding: ${spacing.md};
  text-align: left;
  font-weight: 600;
  color: ${colors.text.primary};
  border-bottom: 2px solid ${colors.neutral.gray200};
  white-space: nowrap;
`;

const Td = styled.td`
  padding: ${spacing.sm};
  border-bottom: 1px solid ${colors.neutral.gray100};
`;

const TableInput = styled.input`
  width: 100%;
  padding: ${spacing.sm};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.85rem;
  color: ${colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${colors.neutral.black};
  }
`;

const TableSelect = styled.select`
  width: 100%;
  padding: ${spacing.sm};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.85rem;
  color: ${colors.text.primary};
  background: white;

  &:focus {
    outline: none;
    border-color: ${colors.neutral.black};
  }
`;

const AddRowButton = styled.button`
  width: 100%;
  padding: ${spacing.md};
  background: white;
  border: 1px dashed ${colors.neutral.gray300};
  border-radius: 0 0 ${borderRadius.base} ${borderRadius.base};
  color: ${colors.neutral.black};
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.neutral.gray50};
    border-color: ${colors.neutral.black};
  }
`;

const DeleteRowButton = styled.button`
  background: none;
  border: none;
  color: ${colors.semantic.error};
  cursor: pointer;
  padding: ${spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${borderRadius.base};
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.semantic.error}15;
  }
`;

const ContinueButton = styled.button`
  padding: ${spacing.md} ${spacing.xl};
  border-radius: ${borderRadius.base};
  background: ${colors.neutral.black};
  color: white;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  align-self: flex-end;
  margin-top: ${spacing.lg};

  &:hover {
    background: ${colors.neutral.gray800};
    transform: translateY(-1px);
    box-shadow: ${shadows.sm};
  }
`;

// ============================================================================
// Component
// ============================================================================

interface DynamicTemplateFormProps {
  template: UploadedTemplate;
  prefillData?: ApplicationData;
  onContinue: (
    filledData: Record<string, any>, 
    tableData: Record<string, any[]>,
    fileData: Record<string, FileAttachment[]>
  ) => void;
}

const DynamicTemplateForm: React.FC<DynamicTemplateFormProps> = ({
  template,
  prefillData,
  onContinue,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [tableData, setTableData] = useState<Record<string, any[]>>({});
  const [fileData, setFileData] = useState<Record<string, FileAttachment[]>>({});
  const [prefilledFields, setPrefilledFields] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [activeFileField, setActiveFileField] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize form data with prefilled values
  useEffect(() => {
    const initialData: Record<string, any> = {};
    const prefilled = new Set<string>();
    
    template.sections?.forEach(section => {
      section.fields.forEach(field => {
        // Check for direct prefillSource on the field
        if (field.prefillSource && prefillData) {
          const value = getNestedValue(prefillData, field.prefillSource);
          if (value !== undefined && value !== null && value !== '') {
            initialData[field.id] = value;
            prefilled.add(field.id);
          } else {
            initialData[field.id] = field.defaultValue || '';
          }
        } 
        // Fallback to fieldMappings on template
        else if (template.fieldMappings?.[field.id] && prefillData) {
          const mappedKey = template.fieldMappings[field.id];
          const value = getNestedValue(prefillData, mappedKey);
          if (value !== undefined && value !== null && value !== '') {
            initialData[field.id] = value;
            prefilled.add(field.id);
          } else {
            initialData[field.id] = field.defaultValue || '';
          }
        } else {
          initialData[field.id] = field.defaultValue || '';
        }
      });
    });
    
    setFormData(initialData);
    setPrefilledFields(prefilled);

    // Initialize table data
    const initialTables: Record<string, any[]> = {};
    template.sections?.forEach(section => {
      section.fields.forEach(field => {
        if (field.type === 'table' && field.tableConfig) {
          const minRows = field.tableConfig.minRows;
          initialTables[field.id] = Array(minRows).fill(null).map(() => ({}));
        }
      });
    });
    setTableData(initialTables);

    // Initialize collapsed sections
    const collapsed = new Set<string>();
    template.sections?.forEach(section => {
      if (section.defaultCollapsed) {
        collapsed.add(section.id);
      }
    });
    setCollapsedSections(collapsed);
  }, [template, prefillData]);

  useEffect(() => {
    if (showPDFPreview && canvasRef.current) {
      renderPDF();
    }
  }, [showPDFPreview]);

  const renderPDF = async () => {
    if (!canvasRef.current) return;
    
    try {
      const pdfBlob = base64ToBlob(template.pdfBase64);
      const pdf = await loadPDFForRendering(pdfBlob);
      await renderPDFPage(pdf, 1, canvasRef.current, 1.5);
    } catch (error) {
      console.error('Error rendering PDF:', error);
    }
  };

  const getNestedValue = (obj: any, path: string): any => {
    try {
      return path.split('.').reduce((current, key) => {
        const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
        if (arrayMatch) {
          const [, arrayKey, index] = arrayMatch;
          return current?.[arrayKey]?.[parseInt(index)];
        }
        return current?.[key];
      }, obj);
    } catch {
      return undefined;
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleTableCellChange = (fieldId: string, rowIndex: number, columnId: string, value: any) => {
    setTableData(prev => {
      const tableRows = [...(prev[fieldId] || [])];
      tableRows[rowIndex] = {
        ...tableRows[rowIndex],
        [columnId]: value,
      };
      return {
        ...prev,
        [fieldId]: tableRows,
      };
    });
  };

  const handleAddRow = (fieldId: string) => {
    setTableData(prev => ({
      ...prev,
      [fieldId]: [...(prev[fieldId] || []), {}],
    }));
  };

  const handleDeleteRow = (fieldId: string, rowIndex: number) => {
    setTableData(prev => ({
      ...prev,
      [fieldId]: prev[fieldId].filter((_, idx) => idx !== rowIndex),
    }));
  };

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

  // File handling
  const handleFileUpload = (fieldId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const field = template.sections?.flatMap(s => s.fields).find(f => f.id === fieldId);
    const multiple = field?.fileConfig?.multiple ?? false;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const attachment: FileAttachment = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fieldId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString(),
          base64Data: e.target?.result as string,
        };
        
        setFileData(prev => ({
          ...prev,
          [fieldId]: multiple ? [...(prev[fieldId] || []), attachment] : [attachment],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (fieldId: string, fileId: string) => {
    setFileData(prev => ({
      ...prev,
      [fieldId]: (prev[fieldId] || []).filter(f => f.id !== fileId),
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleContinue = () => {
    onContinue(formData, tableData, fileData);
  };

  // Check if a field should be visible based on its condition
  const shouldShowField = (field: TemplateField): boolean => {
    if (!field.condition) return true;
    
    const dependsOnValue = formData[field.condition.dependsOn];
    const showWhen = field.condition.showWhen;
    
    if (Array.isArray(showWhen)) {
      return showWhen.includes(dependsOnValue);
    }
    return dependsOnValue === showWhen;
  };

  // ============================================================================
  // Render Functions
  // ============================================================================

  const renderTableInput = (column: TableColumn, fieldId: string, rowIndex: number) => {
    const value = tableData[fieldId]?.[rowIndex]?.[column.id] || '';

    switch (column.type) {
      case 'select':
        return (
          <TableSelect
            value={value}
            onChange={(e) => handleTableCellChange(fieldId, rowIndex, column.id, e.target.value)}
          >
            <option value="">Select...</option>
            {column.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </TableSelect>
        );
      case 'number':
        return (
          <TableInput
            type="number"
            value={value}
            onChange={(e) => handleTableCellChange(fieldId, rowIndex, column.id, e.target.value)}
          />
        );
      case 'date':
        return (
          <TableInput
            type="date"
            value={value}
            onChange={(e) => handleTableCellChange(fieldId, rowIndex, column.id, e.target.value)}
          />
        );
      default:
        return (
          <TableInput
            type="text"
            value={value}
            onChange={(e) => handleTableCellChange(fieldId, rowIndex, column.id, e.target.value)}
          />
        );
    }
  };

  const renderField = (field: TemplateField) => {
    // Check conditional display
    if (!shouldShowField(field)) return null;

    const value = formData[field.id] ?? '';
    const isPrefilled = prefilledFields.has(field.id);

    // Table field
    if (field.type === 'table' && field.tableConfig) {
      const rows = tableData[field.id] || [];
      
      return (
        <FormGroup key={field.id} $width="full">
          <LabelContainer>
            <Label>
              {field.label}
              {field.required && <Required>*</Required>}
              {field.helpText && <HelpText>({field.helpText})</HelpText>}
            </Label>
          </LabelContainer>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  {field.tableConfig.columns.map(col => (
                    <Th key={col.id}>
                      {col.label}
                      {col.required && <Required> *</Required>}
                    </Th>
                  ))}
                  {field.tableConfig.allowDeleteRows && <Th>Actions</Th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {field.tableConfig!.columns.map(col => (
                      <Td key={col.id}>
                        {renderTableInput(col, field.id, rowIndex)}
                      </Td>
                    ))}
                    {field.tableConfig!.allowDeleteRows && rows.length > field.tableConfig!.minRows && (
                      <Td>
                        <DeleteRowButton onClick={() => handleDeleteRow(field.id, rowIndex)}>
                          <FiTrash2 size={16} />
                        </DeleteRowButton>
                      </Td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
            {field.tableConfig.allowAddRows && 
              (!field.tableConfig.maxRows || rows.length < field.tableConfig.maxRows) && (
              <AddRowButton onClick={() => handleAddRow(field.id)}>
                <FiPlus size={16} />
                Add Row
              </AddRowButton>
            )}
          </TableContainer>
        </FormGroup>
      );
    }

    // Radio field (Yes/No)
    if (field.type === 'radio') {
      const options = field.options || ['Yes', 'No'];
      return (
        <FormGroup key={field.id} $width={field.width}>
          <LabelContainer>
            <Label>
              {field.label}
              {field.required && <Required>*</Required>}
            </Label>
            {isPrefilled && <PrefillBadge><FiRefreshCw size={10} /> Prefilled</PrefillBadge>}
          </LabelContainer>
          <RadioGroupHorizontal>
            {options.map(option => (
              <RadioOption key={option} $selected={value === option}>
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                />
                {option}
              </RadioOption>
            ))}
          </RadioGroupHorizontal>
          {field.helpText && <HelpText>{field.helpText}</HelpText>}
        </FormGroup>
      );
    }

    // Radio Group (Multiple choice A/B/C)
    if (field.type === 'radio-group') {
      const options = field.options || [];
      return (
        <FormGroup key={field.id} $width={field.width}>
          <LabelContainer>
            <Label>
              {field.label}
              {field.required && <Required>*</Required>}
            </Label>
            {isPrefilled && <PrefillBadge><FiRefreshCw size={10} /> Prefilled</PrefillBadge>}
          </LabelContainer>
          <RadioGroup>
            {options.map(option => (
              <RadioOption key={option} $selected={value === option}>
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                />
                {option}
              </RadioOption>
            ))}
          </RadioGroup>
          {field.helpText && <HelpText>{field.helpText}</HelpText>}
        </FormGroup>
      );
    }

    // File upload
    if (field.type === 'file' || field.type === 'file-multiple') {
      const files = fileData[field.id] || [];

      return (
        <FormGroup key={field.id} $width={field.width || 'full'}>
          <Label>
            {field.label}
            {field.required && <Required>*</Required>}
          </Label>
          
          <FileUploadZone
            $isDragging={isDragging && activeFileField === field.id}
            onClick={() => {
              setActiveFileField(field.id);
              fileInputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
              setActiveFileField(field.id);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFileUpload(field.id, e.dataTransfer.files);
            }}
          >
            <FiUpload size={24} color={colors.neutral.gray400} />
            <p style={{ margin: `${spacing.sm} 0`, color: colors.text.primary }}>
              Drag & drop or click to upload
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: colors.text.secondary }}>
              {field.fileConfig?.accept?.join(', ') || 'PDF, DOC, DOCX'} 
              {field.fileConfig?.maxSizeMB && ` (max ${field.fileConfig.maxSizeMB}MB)`}
            </p>
          </FileUploadZone>

          {files.length > 0 && (
            <FileList>
              {files.map(file => (
                <FileItem key={file.id}>
                  <FiFile size={20} color={colors.neutral.gray600} />
                  <FileInfo>
                    <FileName>{file.fileName}</FileName>
                    <FileSize>{formatFileSize(file.fileSize)}</FileSize>
                  </FileInfo>
                  <RemoveFileButton onClick={() => handleRemoveFile(field.id, file.id)}>
                    <FiX size={16} />
                  </RemoveFileButton>
                </FileItem>
              ))}
            </FileList>
          )}

          {field.helpText && <HelpText>{field.helpText}</HelpText>}
        </FormGroup>
      );
    }

    // Regular fields (text, textarea, select, checkbox, number, date)
    return (
      <FormGroup key={field.id} $width={field.width}>
        <LabelContainer>
          <Label>
            {field.label}
            {field.required && <Required>*</Required>}
          </Label>
          {isPrefilled && <PrefillBadge><FiRefreshCw size={10} /> Prefilled</PrefillBadge>}
        </LabelContainer>
        
        {field.type === 'textarea' && (
          <TextArea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            $prefilled={isPrefilled}
          />
        )}
        
        {field.type === 'select' && (
          <Select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            $prefilled={isPrefilled}
          >
            <option value="">Select...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Select>
        )}
        
        {field.type === 'checkbox' && (
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
            />
            {field.placeholder || 'Check if applicable'}
          </CheckboxLabel>
        )}
        
        {['text', 'number', 'date'].includes(field.type) && (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            $prefilled={isPrefilled}
          />
        )}

        {field.helpText && <HelpText>{field.helpText}</HelpText>}
      </FormGroup>
    );
  };

  // Show message if template has no sections
  if (!template.sections || template.sections.length === 0) {
    return (
      <Container>
        <p>This template has no form structure defined. Please contact an administrator.</p>
      </Container>
    );
  }

  return (
    <Container>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (activeFileField) {
            handleFileUpload(activeFileField, e.target.files);
          }
        }}
      />

      {/* PDF Preview Toggle */}
      <PreviewToggle onClick={() => setShowPDFPreview(!showPDFPreview)}>
        {showPDFPreview ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        {showPDFPreview ? 'Hide' : 'Show'} Template Reference
      </PreviewToggle>

      {/* Collapsible PDF Preview */}
      {showPDFPreview && (
        <PDFPreviewPanel>
          <PDFCanvas ref={canvasRef} />
        </PDFPreviewPanel>
      )}

      {/* Main Form */}
      <FormContainer>
        {template.sections
          .sort((a, b) => a.order - b.order)
          .map((section: TemplateSection) => {
            const isCollapsed = collapsedSections.has(section.id);
            const isCollapsible = section.collapsible !== false; // Default to collapsible
            const visibleFields = section.fields.filter(f => shouldShowField(f));
            
            return (
              <SectionCard key={section.id} $collapsed={isCollapsed}>
                <SectionHeader 
                  $collapsible={isCollapsible}
                  onClick={() => isCollapsible && toggleSection(section.id)}
                >
                  <SectionTitleWrapper>
                    {isCollapsible && (
                      isCollapsed ? <FiChevronRight size={20} /> : <FiChevronDown size={20} />
                    )}
                    <SectionTitle>{section.title}</SectionTitle>
                    {prefilledFields.size > 0 && (
                      <SectionBadge>
                        {section.fields.filter(f => prefilledFields.has(f.id)).length} prefilled
                      </SectionBadge>
                    )}
                  </SectionTitleWrapper>
                </SectionHeader>
                
                <SectionContent $collapsed={isCollapsed}>
                  {section.description && <SectionDescription>{section.description}</SectionDescription>}
                  
                  <FieldsGrid>
                    {visibleFields
                      .sort((a, b) => a.order - b.order)
                      .map(field => renderField(field))}
                  </FieldsGrid>
                </SectionContent>
              </SectionCard>
            );
          })}
      </FormContainer>

      <ContinueButton onClick={handleContinue}>
        Continue
        <FiChevronRight />
      </ContinueButton>
    </Container>
  );
};

export default DynamicTemplateForm;
