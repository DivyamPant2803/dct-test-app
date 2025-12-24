import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiChevronRight } from 'react-icons/fi';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import { UploadedTemplate, PDFFormField } from '../../types/index';
import { ApplicationData } from '../../services/applicationDataService';
import {
  loadPDFForRendering,
  renderPDFPage,
  base64ToBlob,
} from '../../utils/pdfUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
  width: 100%;
`;

const PDFViewer = styled.div`
  background: ${colors.neutral.gray100};
  border-radius: ${borderRadius.base};
  padding: ${spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.md};
  max-height: 600px;
  overflow-y: auto;
`;

const Canvas = styled.canvas`
  box-shadow: ${shadows.md};
  background: white;
  max-width: 100%;
  height: auto;
`;

const FormFieldsSection = styled.div`
  background: ${colors.background.paper};
  border-radius: ${borderRadius.base};
  padding: ${spacing.lg};
  border: 1px solid ${colors.neutral.gray200};
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0 0 ${spacing.md} 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const Label = styled.label`
  font-weight: 500;
  color: ${colors.text.primary};
  font-size: 0.9rem;
`;

const Input = styled.input`
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

  &:disabled {
    background: ${colors.neutral.gray100};
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
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

  &:disabled {
    background: ${colors.neutral.gray100};
    cursor: not-allowed;
  }
`;

const Select = styled.select`
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

  &:disabled {
    background: ${colors.neutral.gray100};
    cursor: not-allowed;
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
  }
`;

const InfoText = styled.p`
  font-size: 0.85rem;
  color: ${colors.text.secondary};
  margin: ${spacing.md} 0 0 0;
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

  &:disabled {
    background: ${colors.neutral.gray400};
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  color: ${colors.text.secondary};
  padding: ${spacing.xl};
`;

interface PDFTemplateViewerProps {
  template: UploadedTemplate;
  prefillData?: ApplicationData;
  onContinue: (
    filledData: Record<string, any>,
    tableData: Record<string, any[]>,
    fileData: Record<string, any[]>
  ) => void;
}

const PDFTemplateViewer: React.FC<PDFTemplateViewerProps> = ({
  template,
  prefillData,
  onContinue,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [editableFields, setEditableFields] = useState<PDFFormField[]>([]);

  useEffect(() => {
    loadAndRenderPDF();
  }, [template]);

  const loadAndRenderPDF = async () => {
    setIsLoading(true);
    try {
      // Convert base64 to blob
      const pdfBlob = base64ToBlob(template.pdfBase64);
      
      // Load PDF for rendering
      const pdf = await loadPDFForRendering(pdfBlob);
      
      // Render first page to canvas
      if (canvasRef.current) {
        await renderPDFPage(pdf, 1, canvasRef.current, 1.5);
      }

      // Initialize field values with prefilled data
      const initialValues: Record<string, any> = {};
      (template.formFields || []).forEach(field => {
        // Try to prefill from ApplicationData using field mappings
        const mappedKey = template.fieldMappings?.[field.name];
        if (mappedKey && prefillData) {
          // Access nested properties using dot notation
          const value = getNestedValue(prefillData, mappedKey);
          initialValues[field.name] = value || field.value || '';
        } else {
          initialValues[field.name] = field.value || '';
        }
      });

      setFieldValues(initialValues);
      setEditableFields(template.formFields || []);
    } catch (error) {
      console.error('Error loading PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get nested object values (e.g., "locations[0]" or "applicationName")
  const getNestedValue = (obj: any, path: string): any => {
    try {
      return path.split('.').reduce((current, key) => {
        // Handle array notation like "locations[0]"
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

  const handleFieldChange = (fieldName: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleContinue = () => {
    // PDF forms don't have table or file data, so pass empty objects
    onContinue(fieldValues, {}, {});
  };

  const renderFormField = (field: PDFFormField) => {
    const value = fieldValues[field.name] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <FormGroup key={field.name}>
            <Label>
              {field.name}
              {field.required && <span style={{ color: colors.semantic.error }}> *</span>}
            </Label>
            <TextArea
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.required}
            />
          </FormGroup>
        );

      case 'select':
        return (
          <FormGroup key={field.name}>
            <Label>
              {field.name}
              {field.required && <span style={{ color: colors.semantic.error }}> *</span>}
            </Label>
            <Select
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.required}
            >
              <option value="">Select...</option>
              {field.options?.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </FormGroup>
        );

      case 'checkbox':
        return (
          <FormGroup key={field.name}>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={value === true || value === 'true'}
                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              />
              {field.name}
            </CheckboxLabel>
          </FormGroup>
        );

      default: // text
        return (
          <FormGroup key={field.name}>
            <Label>
              {field.name}
              {field.required && <span style={{ color: colors.semantic.error }}> *</span>}
            </Label>
            <Input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.required}
            />
          </FormGroup>
        );
    }
  };

  if (isLoading) {
    return <LoadingText>Loading template...</LoadingText>;
  }

  return (
    <Container>
      <PDFViewer>
        <Canvas ref={canvasRef} />
      </PDFViewer>

      {editableFields.length > 0 && (
        <FormFieldsSection>
          <SectionTitle>Template Fields</SectionTitle>
          <InfoText>
            Review and edit the prefilled values below. Fields marked with * are required.
          </InfoText>
          <FormGrid style={{ marginTop: spacing.lg }}>
            {editableFields.map(field => renderFormField(field))}
          </FormGrid>
        </FormFieldsSection>
      )}

      {editableFields.length === 0 && (
        <InfoText>
          This template has no fillable fields. Click Continue to proceed.
        </InfoText>
      )}

      <ContinueButton onClick={handleContinue}>
        Continue
        <FiChevronRight />
      </ContinueButton>
    </Container>
  );
};

export default PDFTemplateViewer;
