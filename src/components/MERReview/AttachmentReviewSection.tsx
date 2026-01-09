import React, { useState } from 'react';
import styled from 'styled-components';
import { Evidence, FileAttachment, AttachmentReviewDecision } from '../../types/index';
import { colors, borderRadius, spacing } from '../../styles/designTokens';
import { FiFile, FiCheck, FiX, FiEye } from 'react-icons/fi';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl};
  height: 100%;
  overflow-y: auto;
  padding: ${spacing.xl};
  background: ${colors.neutral.gray50};
`;

const CategoryTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0 0 ${spacing.md} 0;
  padding-bottom: ${spacing.sm};
  border-bottom: 2px solid ${colors.neutral.gray300};
`;

const AttachmentList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: ${spacing.md};
`;

const AttachmentItem = styled.div<{ $decision?: 'APPROVE' | 'REJECT' | null }>`
  background: ${props => 
    props.$decision === 'APPROVE' ? `${colors.semantic.success}08` :
    props.$decision === 'REJECT' ? `${colors.semantic.error}08` :
    'white'
  };
  border: 2px solid ${props =>
    props.$decision === 'APPROVE' ? colors.semantic.success :
    props.$decision === 'REJECT' ? colors.semantic.error :
    colors.neutral.gray200
  };
  border-radius: ${borderRadius.lg};
  padding: ${spacing.lg};
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    transform: translateY(-1px);
  }
`;

const AttachmentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.sm};
`;

const FileIcon = styled.div`
  color: ${colors.status.underReview};
  flex-shrink: 0;
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-weight: 500;
  font-size: 0.9rem;
  color: ${colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileMeta = styled.div`
  font-size: 0.75rem;
  color: ${colors.text.secondary};
  margin-top: 2px;
`;

const StatusBadge = styled.div<{ $status: 'APPROVED' | 'REJECTED' | 'PENDING' }>`
  padding: 4px 8px;
  border-radius: ${borderRadius.full};
  font-size: 0.7rem;
  font-weight: 600;
  ${props => {
    if (props.$status === 'APPROVED') {
      return `
        background: ${colors.semantic.success}20;
        color: ${colors.semantic.success};
      `;
    } else if (props.$status === 'REJECTED') {
      return `
        background: ${colors.semantic.error}20;
        color: ${colors.semantic.error};
      `;
    } else {
      return `
        background: ${colors.neutral.gray200};
        color: ${colors.text.secondary};
      `;
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${spacing.xs};
`;

const IconButton = styled.button<{ $variant?: 'approve' | 'reject' | 'view' }>`
  padding: ${spacing.xs} ${spacing.sm};
  border: 1px solid ${props =>
    props.$variant === 'approve' ? colors.semantic.success :
    props.$variant === 'reject' ? colors.semantic.error :
    colors.neutral.gray300
  };
  background: ${colors.background.paper};
  color: ${props =>
    props.$variant === 'approve' ? colors.semantic.success :
    props.$variant === 'reject' ? colors.semantic.error :
    colors.text.secondary
  };
  border-radius: ${borderRadius.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${props =>
      props.$variant === 'approve' ? `${colors.semantic.success}15` :
      props.$variant === 'reject' ? `${colors.semantic.error}15` :
      colors.neutral.gray100
    };
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CommentInput = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: ${spacing.sm};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
  margin-top: ${spacing.sm};

  &:focus {
    outline: none;
    border-color: ${colors.status.underReview};
    box-shadow: 0 0 0 3px ${colors.status.underReview}15;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing.xl};
  color: ${colors.text.secondary};
  font-size: 0.9rem;
`;

interface AttachmentReviewSectionProps {
  templateAttachments: FileAttachment[];
  supportingEvidence: Evidence[];
  attachmentDecisions: Map<string, AttachmentReviewDecision>;
  onDecisionChange: (attachmentId: string, decision: 'APPROVE' | 'REJECT' | null, note?: string) => void;
  onPreview: (attachment: FileAttachment | Evidence) => void;
}

const AttachmentReviewSection: React.FC<AttachmentReviewSectionProps> = ({
  templateAttachments,
  supportingEvidence,
  attachmentDecisions,
  onDecisionChange,
  onPreview,
}) => {
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const toggleComment = (id: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderAttachment = (
    id: string,
    name: string,
    size: number,
    type: 'template' | 'evidence',
    original: FileAttachment | Evidence
  ) => {
    const decision = attachmentDecisions.get(id);
    const showComment = expandedComments.has(id);

    return (
      <AttachmentItem key={id} $decision={decision?.decision || null}>
        <AttachmentHeader>
          <FileIcon>
            <FiFile size={18} />
          </FileIcon>
          <FileInfo>
            <FileName title={name}>{name}</FileName>
            <FileMeta>
              {formatFileSize(size)} • {type === 'template' ? 'Template Attachment' : 'Supporting Evidence'}
            </FileMeta>
          </FileInfo>
          <StatusBadge $status={decision?.decision === 'APPROVE' ? 'APPROVED' : decision?.decision === 'REJECT' ? 'REJECTED' : 'PENDING'}>
            {decision?.decision === 'APPROVE' ? 'Approved' : decision?.decision === 'REJECT' ? 'Rejected' : 'Pending'}
          </StatusBadge>
        </AttachmentHeader>

        <ActionButtons>
          <IconButton
            $variant="view"
            onClick={() => onPreview(original)}
            title="Preview file"
          >
            <FiEye size={14} />
            Preview
          </IconButton>
          <IconButton
            $variant="approve"
            onClick={() => {
              const newDecision = decision?.decision === 'APPROVE' ? null : 'APPROVE';
              onDecisionChange(id, newDecision, decision?.note);
              if (!newDecision) setExpandedComments(prev => { const next = new Set(prev); next.delete(id); return next; });
            }}
          >
            <FiCheck size={14} />
            {decision?.decision === 'APPROVE' ? 'Approved' : 'Approve'}
          </IconButton>
          <IconButton
            $variant="reject"
            onClick={() => {
              const newDecision = decision?.decision === 'REJECT' ? null : 'REJECT';
              onDecisionChange(id, newDecision, decision?.note);
              if (newDecision === 'REJECT' && !showComment) toggleComment(id);
              if (!newDecision) setExpandedComments(prev => { const next = new Set(prev); next.delete(id); return next; });
            }}
          >
            <FiX size={14} />
            {decision?.decision === 'REJECT' ? 'Rejected' : 'Reject'}
          </IconButton>
        </ActionButtons>

        {(showComment || decision?.note) && (
          <CommentInput
            placeholder="Add comment (optional for approval, recommended for rejection)..."
            value={decision?.note || ''}
            onChange={(e) => onDecisionChange(id, decision?.decision || null, e.target.value)}
          />
        )}
      </AttachmentItem>
    );
  };

  const totalAttachments = templateAttachments.length + supportingEvidence.length;

  if (totalAttachments === 0) {
    return (
      <Container>
        <EmptyState>No attachments to review</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      {templateAttachments.length > 0 && (
        <>
          <CategoryTitle>Template Attachments ({templateAttachments.length})</CategoryTitle>
          <AttachmentList>
            {templateAttachments.map(attachment =>
              renderAttachment(
                attachment.id,
                attachment.fileName,
                attachment.fileSize,
                'template',
                attachment
              )
            )}
          </AttachmentList>
        </>
      )}

      {supportingEvidence.length > 0 && (
        <>
          <CategoryTitle>Supporting Evidence ({supportingEvidence.length})</CategoryTitle>
          <AttachmentList>
            {supportingEvidence.map(evidence =>
              renderAttachment(
                evidence.id,
                evidence.filename,
                evidence.size,
                'evidence',
                evidence
              )
            )}
          </AttachmentList>
        </>
      )}
    </Container>
  );
};

export default AttachmentReviewSection;
