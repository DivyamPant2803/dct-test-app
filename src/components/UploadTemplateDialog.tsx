import React, { useState } from 'react';
import styled from 'styled-components';
import { FiUpload, FiX, FiFile, FiCheck, FiAlertCircle, FiChevronRight, FiChevronLeft, FiPlus, FiTrash2, FiZap } from 'react-icons/fi';
import { colors, borderRadius, shadows, spacing } from '../styles/designTokens';
import { UploadedTemplate, TemplateStatus, TemplateSection, TemplateField } from '../types/index';
import {
  validateFileType,
  validateFileSize,
  formatFileSize,
  getDocumentType,
} from '../services/uploadedTemplateService';
import { getPDFAsBase64 } from '../utils/pdfUtils';
import { getTemplateParser } from '../utils/templateParser';

// [Styled components from previous version - keeping the same styles]
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const Dialog = styled.div`
  background: ${colors.background.paper};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.lg};
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.xl};
  border-bottom: 1px solid ${colors.neutral.gray200};
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${colors.text.secondary};
  cursor: pointer;
  padding: ${spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${borderRadius.base};
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.neutral.gray100};
    color: ${colors.text.primary};
  }
`;

const Stepper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.lg} ${spacing.xl};
  border-bottom: 1px solid ${colors.neutral.gray200};
  gap: ${spacing.md};
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  font-size: 0.9rem;
  color: ${props => props.$active ? colors.neutral.black : props.$completed ? colors.semantic.success : colors.text.secondary};
  font-weight: ${props => props.$active ? '600' : '400'};
`;

const StepNumber = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$active ? colors.neutral.black : props.$completed ? colors.semantic.success : colors.neutral.gray200};
  color: ${props => (props.$active || props.$completed) ? 'white' : colors.text.secondary};
  font-weight: 600;
  font-size: 0.9rem;
`;

const StepDivider = styled.div`
  width: 40px;
  height: 2px;
  background: ${colors.neutral.gray200};
`;

const Content = styled.div`
  padding: ${spacing.xl};
  overflow-y: auto;
  flex: 1;
`;

const UploadZone = styled.div<{ $isDragging: boolean }>`
  border: 2px dashed ${props => props.$isDragging ? colors.neutral.black : colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  padding: ${spacing['3xl']};
  text-align: center;
  background: ${props => props.$isDragging ? colors.neutral.gray50 : 'transparent'};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: ${colors.neutral.black};
    background: ${colors.neutral.gray50};
  }
`;

const UploadIcon = styled(FiUpload)`
  font-size: 3rem;
  color: ${colors.neutral.gray400};
  margin-bottom: ${spacing.md};
`;

const UploadText = styled.p`
  font-size: 1rem;
  color: ${colors.text.primary};
  margin: ${spacing.sm} 0;
`;

const UploadHint = styled.p`
  font-size: 0.85rem;
  color: ${colors.text.secondary};
  margin: 0;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.md};
  background: ${colors.neutral.gray50};
  border-radius: ${borderRadius.base};
  border: 1px solid ${colors.neutral.gray200};
  margin-top: ${spacing.lg};
`;

const FileIcon = styled(FiFile)`
  font-size: 2rem;
  color: ${colors.neutral.gray600};
`;

const FileDetails = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: 4px;
`;

const FileSize = styled.div`
  font-size: 0.85rem;
  color: ${colors.text.secondary};
`;

const FormGroup = styled.div`
  margin-bottom: ${spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm};
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.95rem;
  color: ${colors.text.primary};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.neutral.black};
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.95rem;
  font-family: inherit;
  color: ${colors.text.primary};
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.neutral.black};
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.95rem;
  color: ${colors.text.primary};
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.neutral.black};
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  color: ${colors.semantic.error};
  font-size: 0.9rem;
  padding: ${spacing.md};
  background: ${colors.semantic.error}10;
  border-radius: ${borderRadius.base};
  border: 1px solid ${colors.semantic.error}40;
  margin-bottom: ${spacing.md};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.xl};
  border-top: 1px solid ${colors.neutral.gray200};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.md};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${spacing.md} ${spacing.xl};
  border-radius: ${borderRadius.base};
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};

  ${props => props.$variant === 'primary' ? `
    background: ${colors.neutral.black};
    color: white;
    border: none;

    &:hover:not(:disabled) {
      background: ${colors.neutral.gray800};
      transform: translateY(-1px);
      box-shadow: ${shadows.sm};
    }

    &:disabled {
      background: ${colors.neutral.gray400};
      cursor: not-allowed;
    }
  ` : `
    background: white;
    color: ${colors.neutral.black};
    border: 1px solid ${colors.neutral.gray300};

    &:hover:not(:disabled) {
      background: ${colors.neutral.gray100};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `}
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${colors.semantic.error};
  cursor: pointer;
  padding: ${spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${borderRadius.base};
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.semantic.error}15;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid ${colors.neutral.gray300};
  border-top-color: ${colors.neutral.black};
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Form Builder Specific Styles
const SectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const SectionCard = styled.div`
  background: white;
  border: 1px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.base};
  padding: ${spacing.lg};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.md};
`;

const SectionTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${colors.text.secondary};
  cursor: pointer;
  padding: ${spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${borderRadius.base};
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.neutral.gray100};
    color: ${colors.text.primary};
  }
`;

const FieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  margin-top: ${spacing.md};
`;

const FieldItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm};
  background: ${colors.neutral.gray50};
  border-radius: ${borderRadius.base};
  font-size: 0.9rem;
`;

const FieldBadge = styled.span<{ $type: string }>`
  padding: 2px 8px;
  background: ${colors.neutral.gray200};
  border-radius: ${borderRadius.base};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const AddButton = styled.button`
  width: 100%;
  padding: ${spacing.md};
  background: white;
  border: 1px dashed ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  color: ${colors.neutral.black};
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  transition: all 0.2s ease;
  margin-top: ${spacing.md};

  &:hover {
    background: ${colors.neutral.gray50};
    border-color: ${colors.neutral.black};
  }
`;

const HelpText = styled.p`
  font-size: 0.85rem;
  color: ${colors.text.secondary};
  margin: ${spacing.sm} 0 ${spacing.lg} 0;
`;

interface UploadTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (template: UploadedTemplate) => void;
}

const UploadTemplateDialog: React.FC<UploadTemplateDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  
  // Step 1: File upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string>('');
  
  // Step 2: Form structure
  const [sections, setSections] = useState<TemplateSection[]>([]);
  const [autoGenerated, setAutoGenerated] = useState(false);
  
  // Step 3: Metadata
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateStatus, setTemplateStatus] = useState<TemplateStatus>('DRAFT');
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = async (file: File) => {
    setError('');
    setIsProcessing(true);
    
    // Validate file type
    const typeValidation = validateFileType(file);
    if (!typeValidation.valid) {
      setError(typeValidation.error || 'Invalid file type');
      setIsProcessing(false);
      return;
    }
    
    // Validate file size
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      setError(sizeValidation.error || 'File too large');
      setIsProcessing(false);
      return;
    }
    
    setSelectedFile(file);
    
    try {
      // Convert PDF to base64
      const base64 = await getPDFAsBase64(file);
      setPdfBase64(base64);
      
      // Auto-fill template name from filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTemplateName(nameWithoutExt);
      
      // Auto-generate form structure from PDF
      await handleAutoGenerate(file);
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError('Failed to process PDF file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoGenerate = async (file: File) => {
    setIsParsing(true);
    setError('');
    
    try {
      const parser = getTemplateParser('pdf'); // Use PDF parser for now
      const generatedSections = await parser.parse(file);
      
      if (generatedSections.length > 0) {
        setSections(generatedSections);
        setAutoGenerated(true);
      } else {
        setError('Could not auto-detect form structure. Please build manually.');
      }
    } catch (err) {
      console.error('Auto-generation error:', err);
      setError('Auto-generation failed. You can still build the form manually.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleAddSection = () => {
    const newSection: TemplateSection = {
      id: `section-${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      description: '',
      fields: [],
      order: sections.length,
    };
    setSections([...sections, newSection]);
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const handleAddField = (sectionId: string, fieldType: TemplateField['type']) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        const newField: TemplateField = {
          id: `field-${Date.now()}`,
          label: `Field ${section.fields.length + 1}`,
          type: fieldType,
          required: false,
          order: section.fields.length,
        };
        return {
          ...section,
          fields: [...section.fields, newField],
        };
      }
      return section;
    }));
  };

  const handleDeleteField = (sectionId: string, fieldId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          fields: section.fields.filter(f => f.id !== fieldId),
        };
      }
      return section;
    }));
  };

  const handleNext = () => {
    setError('');
    
    if (currentStep === 1 && !selectedFile) {
      setError('Please select a file');
      return;
    }
    
    if (currentStep === 2 && sections.length === 0) {
      setError('Please add at least one section');
      return;
    }
    
    if (currentStep === 3) {
      if (!templateName.trim()) {
        setError('Please enter a template name');
        return;
      }
      handleSubmit();
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    try {
      const newTemplate: UploadedTemplate = {
        id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: templateName,
        description: templateDescription,
        status: templateStatus,
        templateType: 'DYNAMIC_FORM',
        originalFileName: selectedFile.name,
        fileSize: selectedFile.size,
        documentType: getDocumentType(selectedFile),
        pdfBase64,
        sections,
        fieldMappings,
        uploadedBy: 'Admin', // TODO: Get from auth context
        uploadedAt: new Date().toISOString(),
        usageCount: 0,
      };
      
      // Save to localStorage
      const existingTemplates = JSON.parse(localStorage.getItem('uploaded_templates') || '[]');
      existingTemplates.push(newTemplate);
      localStorage.setItem('uploaded_templates', JSON.stringify(existingTemplates));
      
      onSuccess(newTemplate);
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setPdfBase64('');
    setSections([]);
    setTemplateName('');
    setTemplateDescription('');
    setTemplateStatus('DRAFT');
    setFieldMappings({});
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <Dialog>
        <Header>
          <Title>Upload Template</Title>
          <CloseButton onClick={handleClose}>
            <FiX size={24} />
          </CloseButton>
        </Header>

        <Stepper>
          <Step $active={currentStep === 1} $completed={currentStep > 1}>
            <StepNumber $active={currentStep === 1} $completed={currentStep > 1}>
              {currentStep > 1 ? <FiCheck /> : '1'}
            </StepNumber>
            Upload PDF
          </Step>
          <StepDivider />
          <Step $active={currentStep === 2} $completed={currentStep > 2}>
            <StepNumber $active={currentStep === 2} $completed={currentStep > 2}>
              {currentStep > 2 ? <FiCheck /> : '2'}
            </StepNumber>
            Form Builder
          </Step>
          <StepDivider />
          <Step $active={currentStep === 3} $completed={false}>
            <StepNumber $active={currentStep === 3} $completed={false}>
              3
            </StepNumber>
            Metadata
          </Step>
        </Stepper>

        <Content>
          {error && (
            <ErrorMessage>
              <FiAlertCircle />
              {error}
            </ErrorMessage>
          )}

          {/* Step 1: Upload PDF */}
          {currentStep === 1 && (
            <>
              <UploadZone
                $isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <UploadIcon />
                <UploadText>Drag and drop your PDF template here</UploadText>
                <UploadHint>or click to browse (PDF files only - Max 10MB)</UploadHint>
              </UploadZone>
              <FileInput
                id="file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
              />
              {selectedFile && (
                <FileInfo>
                  <FileIcon />
                  <FileDetails>
                    <FileName>{selectedFile.name}</FileName>
                    <FileSize>{formatFileSize(selectedFile.size)}</FileSize>
                  </FileDetails>
                  {isProcessing && <LoadingSpinner />}
                  {!isProcessing && (
                    <RemoveButton onClick={() => {
                      setSelectedFile(null);
                      setPdfBase64('');
                    }}>
                      <FiX size={20} />
                    </RemoveButton>
                  )}
                </FileInfo>
              )}
            </>
          )}

          {/* Step 2: Form Builder */}
          {currentStep === 2 && (
            <>
              {isParsing && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.md, 
                  padding: spacing.md, 
                  background: colors.neutral.gray50,
                  borderRadius: borderRadius.base,
                  marginBottom: spacing.md 
                }}>
                  <LoadingSpinner />
                  <span>Auto-generating form structure from PDF...</span>
                </div>
              )}
              
              {autoGenerated && !isParsing && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: spacing.md, 
                  padding: spacing.md, 
                  background: colors.semantic.success + '15',
                  borderRadius: borderRadius.base,
                  marginBottom: spacing.md,
                  border: `1px solid ${colors.semantic.success}40`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    <FiCheck color={colors.semantic.success} />
                    <span style={{ color: colors.semantic.success, fontWeight: 500 }}>
                      Auto-generated {sections.length} section(s) with {sections.reduce((sum, s) => sum + s.fields.length, 0)} field(s)
                    </span>
                  </div>
                  <Button 
                    $variant="secondary" 
                    onClick={() => selectedFile && handleAutoGenerate(selectedFile)}
                    style={{ padding: `${spacing.sm} ${spacing.md}`, fontSize: '0.85rem' }}
                  >
                    <FiZap size={14} />
                    Re-generate
                  </Button>
                </div>
              )}
              
              <HelpText>
                {autoGenerated 
                  ? 'Review the auto-generated structure below. You can edit, add, or remove sections and fields as needed.'
                  : 'Define the structure of your template by creating sections and adding fields. These will be the editable fields users fill out.'
                }
              </HelpText>
              <SectionList>
                {sections.map((section) => (
                  <SectionCard key={section.id}>
                    <SectionHeader>
                      <SectionTitle>{section.title}</SectionTitle>
                      <IconButton onClick={() => handleDeleteSection(section.id)}>
                        <FiTrash2 />
                      </IconButton>
                    </SectionHeader>
                    
                    <FormGroup>
                      <Label>Section Title</Label>
                      <Input
                        value={section.title}
                        onChange={(e) => {
                          setSections(sections.map(s =>
                            s.id === section.id ? { ...s, title: e.target.value } : s
                          ));
                        }}
                      />
                    </FormGroup>

                    <FieldList>
                      {section.fields.map(field => (
                        <FieldItem key={field.id}>
                          <FieldBadge $type={field.type}>{field.type}</FieldBadge>
                          <span style={{ flex: 1 }}>{field.label}</span>
                          <IconButton onClick={() => handleDeleteField(section.id, field.id)}>
                            <FiTrash2 size={14} />
                          </IconButton>
                        </FieldItem>
                      ))}
                    </FieldList>

                    <AddButton onClick={() => handleAddField(section.id, 'text')}>
                      <FiPlus size={16} />
                      Add Field
                    </AddButton>
                  </SectionCard>
                ))}
              </SectionList>

              <AddButton onClick={handleAddSection}>
                <FiPlus size={16} />
                Add Section
              </AddButton>
            </>
          )}

          {/* Step 3: Metadata */}
          {currentStep === 3 && (
            <>
              <FormGroup>
                <Label>Template Name *</Label>
                <Input
                  placeholder="e.g., MER-13 Template"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  autoFocus
                />
              </FormGroup>
              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  placeholder="Brief description of this template..."
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <Label>Status</Label>
                <Select
                  value={templateStatus}
                  onChange={(e) => setTemplateStatus(e.target.value as TemplateStatus)}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </Select>
                <UploadHint style={{ marginTop: spacing.sm }}>
                  Only 'Active' templates will be available in Central Inventory
                </UploadHint>
              </FormGroup>
            </>
          )}
        </Content>

        <Footer>
          <Button $variant="secondary" onClick={handleBack} disabled={currentStep === 1 || isProcessing}>
            <FiChevronLeft />
            Back
          </Button>
          <ButtonGroup>
            <Button $variant="secondary" onClick={handleClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button $variant="primary" onClick={handleNext} disabled={isProcessing || (currentStep === 1 && !selectedFile)}>
              {isProcessing && <LoadingSpinner />}
              {!isProcessing && (
                <>
                  {currentStep === 3 ? 'Create Template' : 'Next'}
                  {currentStep < 3 && <FiChevronRight />}
                </>
              )}
            </Button>
          </ButtonGroup>
        </Footer>
      </Dialog>
    </Overlay>
  );
};

export default UploadTemplateDialog;
