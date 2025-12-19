import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MERTemplate, MERTemplateField } from '../../types/index';
import { FiLock, FiEdit, FiAlertCircle } from 'react-icons/fi';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${colors.text.primary};
`;

const TemplateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.md};
  background: ${colors.neutral.gray50};
  border-radius: ${borderRadius.base};
  border: 1px solid ${colors.neutral.gray200};
`;

const InfoItem = styled.span`
  font-size: 0.85rem;
  color: ${colors.text.secondary};
  
  strong {
    color: ${colors.text.primary};
    font-weight: 600;
  }
`;

const FieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const FieldGroup = styled.div<{ $hasError: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  padding: ${spacing.lg};
  background: ${colors.background.paper};
  border: 1px solid ${props => props.$hasError ? colors.semantic.error : colors.neutral.gray200};
  border-radius: ${borderRadius.base};
  transition: border-color 0.2s ease;
  
  &:hover {
    border-color: ${props => props.$hasError ? colors.semantic.error : colors.neutral.gray300};
  }
`;

const FieldHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Label = styled.label<{ $required: boolean }>`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  
  ${props => props.$required && `
    &::after {
      content: '*';
      color: ${colors.semantic.error};
      font-weight: bold;
    }
  `}
`;

const FieldBadge = styled.span<{ $locked: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: ${borderRadius.full};
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => props.$locked ? `
    background: ${colors.neutral.gray200};
    color: ${colors.text.secondary};
  ` : `
    background: ${colors.status.underReview}20;
    color: ${colors.status.underReview};
  `}
`;

const Input = styled.input<{ $locked: boolean }>`
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.95rem;
  color: ${colors.text.primary};
  transition: all 0.2s ease;
  background: ${props => props.$locked ? colors.neutral.gray50 : colors.background.paper};
  
  &:focus {
    outline: none;
    border-color: ${colors.status.underReview};
    box-shadow: 0 0 0 3px ${colors.status.underReview}15;
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea<{ $locked: boolean }>`
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.95rem;
  font-family: inherit;
  color: ${colors.text.primary};
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s ease;
  background: ${props => props.$locked ? colors.neutral.gray50 : colors.background.paper};
  
  &:focus {
    outline: none;
    border-color: ${colors.status.underReview};
    box-shadow: 0 0 0 3px ${colors.status.underReview}15;
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const Select = styled.select<{ $locked: boolean }>`
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.95rem;
  color: ${colors.text.primary};
  transition: all 0.2s ease;
  background: ${props => props.$locked ? colors.neutral.gray50 : colors.background.paper};
  
  &:focus {
    outline: none;
    border-color: ${colors.status.underReview};
    box-shadow: 0 0 0 3px ${colors.status.underReview}15;
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const HelpText = styled.span`
  font-size: 0.8rem;
  color: ${colors.text.secondary};
  font-style: italic;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  color: ${colors.semantic.error};
  font-size: 0.85rem;
  font-weight: 500;
`;

const ValidationSummary = styled.div`
  padding: ${spacing.md};
  background: ${colors.semantic.error}10;
  border: 1px solid ${colors.semantic.error}40;
  border-radius: ${borderRadius.base};
  color: ${colors.semantic.error};
  font-size: 0.9rem;
`;

const ContinueButton = styled.button<{ $disabled: boolean }>`
  background-color: ${props => props.$disabled ? colors.neutral.gray400 : colors.neutral.black};
  color: white;
  border: none;
  padding: ${spacing.base} ${spacing.xl};
  border-radius: ${borderRadius.base};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  align-self: flex-start;
  box-shadow: ${shadows.sm};

  &:hover:not(:disabled) {
    background-color: ${colors.neutral.gray800};
    transform: translateY(-2px);
    box-shadow: ${shadows.base};
  }
`;

interface MERTemplateReviewProps {
  template: MERTemplate;
  onContinue: (filledTemplate: MERTemplate) => void;
}

const MERTemplateReview: React.FC<MERTemplateReviewProps> = ({ template, onContinue }) => {
  const [fields, setFields] = useState<MERTemplateField[]>(template.fields);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFields(template.fields);
  }, [template]);

  const handleFieldChange = (fieldId: string, value: string) => {
    setFields(prevFields =>
      prevFields.map(field =>
        field.id === fieldId ? { ...field, value } : field
      )
    );
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (field.required && !field.value.trim()) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateFields()) {
      const filledTemplate: MERTemplate = {
        ...template,
        fields
      };
      onContinue(filledTemplate);
    }
  };

  const renderField = (field: MERTemplateField) => {
    const hasError = !!errors[field.id];
    
    return (
      <FieldGroup key={field.id} $hasError={hasError}>
        <FieldHeader>
          <Label htmlFor={field.id} $required={field.required}>
            {field.label}
          </Label>
          <FieldBadge $locked={!field.editable}>
            {field.editable ? (
              <>
                <FiEdit size={12} />
                Editable
              </>
            ) : (
              <>
                <FiLock size={12} />
                Prefilled
              </>
            )}
          </FieldBadge>
        </FieldHeader>

        {field.type === 'textarea' ? (
          <TextArea
            id={field.id}
            value={field.value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            disabled={!field.editable}
            $locked={!field.editable}
          />
        ) : field.type === 'select' ? (
          <Select
            id={field.id}
            value={field.value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            disabled={!field.editable}
            $locked={!field.editable}
          >
            <option value="">-- Select {field.label} --</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        ) : field.type === 'file' ? (
          <Input
            id={field.id}
            type="text"
            value={field.value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || 'Enter file URL or upload path'}
            disabled={!field.editable}
            $locked={!field.editable}
          />
        ) : (
          <Input
            id={field.id}
            type="text"
            value={field.value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            disabled={!field.editable}
            $locked={!field.editable}
          />
        )}

        {field.helpText && <HelpText>{field.helpText}</HelpText>}
        
        {hasError && (
          <ErrorMessage>
            <FiAlertCircle />
            {errors[field.id]}
          </ErrorMessage>
        )}
      </FieldGroup>
    );
  };

  const hasValidationErrors = Object.keys(errors).length > 0;

  return (
    <Container>
      <Header>
        <Title>Review MER Template</Title>
        <TemplateInfo>
          <InfoItem>
            <strong>Type:</strong> {template.merType}
          </InfoItem>
          <InfoItem>
            <strong>Version:</strong> {template.version}
          </InfoItem>
          <InfoItem>
            <strong>Description:</strong> {template.description}
          </InfoItem>
        </TemplateInfo>
      </Header>

      <FieldsContainer>
        {fields.map(renderField)}
      </FieldsContainer>

      {hasValidationErrors && (
        <ValidationSummary>
          Please fill in all required fields before continuing
        </ValidationSummary>
      )}

      <ContinueButton
        $disabled={false}
        onClick={handleContinue}
      >
        Continue to Evidence Upload
      </ContinueButton>
    </Container>
  );
};

export default MERTemplateReview;
