import React, { useState } from 'react';
import styled from 'styled-components';
import { colors, borderRadius, spacing } from '../../styles/designTokens';
import StyledSelect from '../common/StyledSelect';
import { FiAlertTriangle, FiX, FiPlus } from 'react-icons/fi';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
`;

const Modal = styled.div`
  background: white;
  border-radius: ${borderRadius.lg};
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const Header = styled.div`
  padding: ${spacing.lg} ${spacing.xl};
  border-bottom: 1px solid ${colors.neutral.gray200};
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const CloseButton = styled.button`
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

const Content = styled.div`
  padding: ${spacing.xl};
`;

const FormGroup = styled.div`
  margin-bottom: ${spacing.xl};
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm};
`;

const HelpText = styled.div`
  font-size: 0.8rem;
  color: ${colors.text.secondary};
  margin-top: ${spacing.xs};
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
  margin-top: ${spacing.md};
`;

const Tag = styled.button<{ $selected: boolean }>`
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.full};
  border: 2px solid ${props => props.$selected ? colors.status.escalated : colors.neutral.gray300};
  background: ${props => props.$selected ? `${colors.status.escalated}15` : 'white'};
  color: ${props => props.$selected ? colors.status.escalated : colors.text.primary};
  font-size: 0.85rem;
  font-weight: ${props => props.$selected ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${spacing.xs};

  &:hover {
    border-color: ${colors.status.escalated};
    background: ${colors.status.escalated}10;
  }
`;

const CustomTagInput = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-top: ${spacing.md};
`;

const Input = styled.input`
  flex: 1;
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.status.escalated};
    box-shadow: 0 0 0 3px ${colors.status.escalated}15;
  }
`;

const AddButton = styled.button`
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.base};
  border: 1px solid ${colors.status.escalated};
  background: ${colors.status.escalated};
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SelectedTagsSection = styled.div`
  margin-top: ${spacing.lg};
  padding: ${spacing.md};
  background: ${colors.neutral.gray50};
  border-radius: ${borderRadius.base};
  border: 1px solid ${colors.neutral.gray200};
`;

const SelectedTagsLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.sm};
`;

const SelectedTagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.xs};
`;

const SelectedTag = styled.div`
  padding: ${spacing.xs} ${spacing.sm};
  background: ${colors.status.escalated};
  color: white;
  border-radius: ${borderRadius.base};
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  opacity: 0.8;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const Footer = styled.div`
  padding: ${spacing.lg} ${spacing.xl};
  border-top: 1px solid ${colors.neutral.gray200};
  display: flex;
  gap: ${spacing.md};
  justify-content: flex-end;
  position: sticky;
  bottom: 0;
  background: white;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${spacing.md} ${spacing.xl};
  border-radius: ${borderRadius.base};
  border: 1px solid ${props => props.$variant === 'primary' ? colors.status.escalated : colors.neutral.gray300};
  background: ${props => props.$variant === 'primary' ? colors.status.escalated : 'white'};
  color: ${props => props.$variant === 'primary' ? 'white' : colors.text.primary};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

interface EscalateModalProps {
  onEscalate: (escalateTo: 'Legal' | 'Business', reason: string) => void;
  onClose: () => void;
}

// Team-specific escalation reason tags
const LEGAL_TEAM_TAGS = [
  'Requires Legal Review',
  'Complex Compliance Issue',
  'Cross-Border Data Transfer',
  'Regulatory Clarification Needed',
  'Contract Review Required',
  'Data Privacy Concerns',
  'GDPR/Privacy Law Concerns',
  'Intellectual Property Issues',
  'Liability Assessment Needed',
  'Legal Risk Mitigation',
];

const BUSINESS_TEAM_TAGS = [
  'High Risk Assessment',
  'Vendor Risk Assessment',
  'Policy Exception Request',
  'Technical Complexity',
  'Budget Approval Required',
  'Business Impact Analysis',
  'Stakeholder Approval Needed',
  'Resource Allocation',
  'Strategic Decision Required',
  'Process Exception',
];

const EscalateModal: React.FC<EscalateModalProps> = ({
  onEscalate,
  onClose,
}) => {
  const [escalateTo, setEscalateTo] = useState<'Legal' | 'Business' | ''>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

  // Get tags based on selected team
  const availableTags = escalateTo === 'Legal' 
    ? LEGAL_TEAM_TAGS 
    : escalateTo === 'Business' 
    ? BUSINESS_TEAM_TAGS 
    : [];

  // Clear selected tags when team changes
  const handleTeamChange = (value: string) => {
    setEscalateTo(value as 'Legal' | 'Business' | '');
    setSelectedTags([]); // Reset tags when team changes
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const handleSubmit = () => {
    if (escalateTo && selectedTags.length > 0) {
      const reason = selectedTags.join('; ');
      onEscalate(escalateTo as 'Legal' | 'Business', reason);
    }
  };

  const teams = [
    { value: '', label: 'Select team...' },
    { value: 'Legal', label: 'Legal Team' },
    { value: 'Business', label: 'Business Team' },
  ];

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <FiAlertTriangle color={colors.status.escalated} />
            Escalate MER Submission
          </Title>
          <CloseButton onClick={onClose}>
            <FiX size={20} />
          </CloseButton>
        </Header>

        <Content>
          <FormGroup>
            <Label>Escalate To</Label>
            <StyledSelect
              value={escalateTo}
              onChange={handleTeamChange}
              options={teams}
              placeholder="Select team..."
            />
            <HelpText>Choose which team should review this submission</HelpText>
          </FormGroup>

          {escalateTo && (
            <FormGroup>
              <Label>Reason for Escalation *</Label>
              <HelpText>
                Select one or more {escalateTo === 'Legal' ? 'legal' : 'business'} reasons below, or add your own custom reason
              </HelpText>
              
              <TagsContainer>
                {availableTags.map(tag => (
                  <Tag
                    key={tag}
                    $selected={selectedTags.includes(tag)}
                    onClick={() => handleTagToggle(tag)}
                    type="button"
                  >
                    {tag}
                  </Tag>
                ))}
              </TagsContainer>

              <CustomTagInput>
                <Input
                  type="text"
                  placeholder="Add custom reason..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                />
                <AddButton
                  onClick={handleAddCustomTag}
                  disabled={!customTag.trim()}
                  type="button"
                >
                  <FiPlus size={16} />
                  Add
                </AddButton>
              </CustomTagInput>

              {selectedTags.length > 0 && (
                <SelectedTagsSection>
                  <SelectedTagsLabel>Selected Reasons ({selectedTags.length})</SelectedTagsLabel>
                  <SelectedTagsList>
                    {selectedTags.map(tag => (
                      <SelectedTag key={tag}>
                        {tag}
                        <RemoveTagButton onClick={() => handleRemoveTag(tag)} type="button">
                          <FiX size={14} />
                        </RemoveTagButton>
                      </SelectedTag>
                    ))}
                  </SelectedTagsList>
                </SelectedTagsSection>
              )}
            </FormGroup>
          )}
        </Content>

        <Footer>
          <Button $variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            $variant="primary"
            onClick={handleSubmit}
            disabled={!escalateTo || selectedTags.length === 0}
            type="button"
          >
            Escalate to {escalateTo || 'Team'}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default EscalateModal;
