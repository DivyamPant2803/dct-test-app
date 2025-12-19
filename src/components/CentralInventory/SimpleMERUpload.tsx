import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Evidence } from '../../types/index';
import { useEvidenceApi } from '../../hooks/useEvidenceApi';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import { FiUpload, FiFile, FiCheck } from 'react-icons/fi';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.base};
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.lg};
`;

const UploadArea = styled.div<{ $isDragOver: boolean }>`
  border: 2px dashed ${props => props.$isDragOver ? colors.status.underReview : colors.neutral.gray300};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.xl};
  text-align: center;
  cursor: pointer;
  background: ${props => props.$isDragOver ? `${colors.status.underReview}10` : colors.background.paper};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${colors.status.underReview};
    background: ${colors.neutral.gray50};
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: ${colors.status.underReview};
  margin-bottom: ${spacing.md};
`;

const UploadText = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm};
`;

const UploadHint = styled.div`
  font-size: 0.85rem;
  color: ${colors.text.secondary};
`;

const FileInput = styled.input`
  display: none;
`;

const UploadedFilesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
  margin-top: ${spacing.lg};
`;

const FileCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.lg};
  background: ${colors.background.paper};
  border: 1px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.base};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${colors.neutral.gray300};
    box-shadow: ${shadows.sm};
  }
`;

const FileInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: ${spacing.md};
`;

const FileIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${borderRadius.base};
  background: ${colors.status.underReview}20;
  color: ${colors.status.underReview};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const FileDetails = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-weight: 600;
  color: ${colors.text.primary};
  font-size: 0.95rem;
  margin-bottom: 4px;
`;

const FileMetadata = styled.div`
  font-size: 0.8rem;
  color: ${colors.text.secondary};
`;

const FileActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
`;

const DescriptionInput = styled.textarea`
  width: 100%;
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.9rem;
  font-family: inherit;
  color: ${colors.text.primary};
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.status.underReview};
    box-shadow: 0 0 0 3px ${colors.status.underReview}15;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.md};
  margin-top: ${spacing.md};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${spacing.sm} ${spacing.lg};
  border-radius: ${borderRadius.base};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  ${props => {
    switch (props.$variant) {
      case 'danger':
        return `
          background: ${colors.semantic.error};
          color: white;
          &:hover { background: #c82333; }
        `;
      case 'secondary':
        return `
          background: ${colors.neutral.gray200};
          color: ${colors.text.primary};
          &:hover { background: ${colors.neutral.gray300}; }
        `;
      default:
        return `
          background: ${colors.neutral.black};
          color: white;
          &:hover { background: ${colors.neutral.gray800}; }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.div<{ $status: 'pending' | 'uploaded' }>`
  padding: 4px 12px;
  border-radius: ${borderRadius.full};
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  
  ${props => props.$status === 'uploaded' ? `
    background: ${colors.semantic.success}20;
    color: ${colors.semantic.success};
  ` : `
    background: ${colors.status.underReview}20;
    color: ${colors.status.underReview};
  `}
`;

const ErrorMessage = styled.div`
  padding: ${spacing.md};
  background: ${colors.semantic.error}10;
  border: 1px solid ${colors.semantic.error}40;
  border-radius: ${borderRadius.base};
  color: ${colors.semantic.error};
  font-size: 0.9rem;
  margin-top: ${spacing.md};
`;

interface PendingFile {
  file: File;
  description: string;
  id: string;
}

interface SimpleMERUploadProps {
  transferId: string | null;
  onEvidenceUploaded: (rowId: string, actionIndex: number, evidence: Evidence) => void;
  uploadedEvidence: Map<string, Evidence>;
}

const SimpleMERUpload: React.FC<SimpleMERUploadProps> = ({
  transferId,
  onEvidenceUploaded,
  uploadedEvidence
}) => {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadEvidence } = useEvidenceApi();

  const acceptedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    const newFiles: PendingFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!acceptedFileTypes.includes(file.type)) {
        setError('Please select PDF, DOC, or XLS files only');
        continue;
      }

      if (file.size > maxFileSize) {
        setError(`File "${file.name}" exceeds 10MB limit`);
        continue;
      }

      newFiles.push({
        file,
        description: '',
        id: `pending-${Date.now()}-${i}`
      });
    }

    setPendingFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const updateFileDescription = (fileId: string, description: string) => {
    setPendingFiles(prev =>
      prev.map(f => f.id === fileId ? { ...f, description } : f)
    );
  };

  const removeFile = (fileId: string) => {
    setPendingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFile = async (pendingFile: PendingFile) => {
    if (!pendingFile.description.trim()) {
      setError('Please provide a description for the file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const requirementId = transferId
        ? `req-${transferId}-mer-${Date.now()}`
        : `req-mer-${Date.now()}`;

      const evidence = await uploadEvidence(
        pendingFile.file,
        requirementId,
        pendingFile.description,
        'MER Compliance',
        'N/A',
        'MER Supporting Documentation'
      );

      onEvidenceUploaded('mer-evidence', uploadedEvidence.size, evidence);
      removeFile(pendingFile.id);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Container>
      <div>
        <Title>Upload Supporting Evidence</Title>
        <Description>
          Upload any supporting documents required for this MER submission (e.g., architecture diagrams, compliance certificates, data flow diagrams).
        </Description>
      </div>

      <UploadArea
        $isDragOver={isDragOver}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <UploadIcon>
          <FiUpload />
        </UploadIcon>
        <UploadText>Click to select files or drag and drop</UploadText>
        <UploadHint>PDF, DOC, DOCX, XLS, XLSX files only (max 10MB each)</UploadHint>
      </UploadArea>

      <FileInput
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {/* Pending Files */}
      {pendingFiles.length > 0 && (
        <UploadedFilesList>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: colors.text.primary }}>
            Files to Upload ({pendingFiles.length})
          </h4>
          {pendingFiles.map(pendingFile => (
            <FileCard key={pendingFile.id}>
              <FileInfo>
                <FileIconWrapper>
                  <FiFile />
                </FileIconWrapper>
                <FileDetails>
                  <FileName>{pendingFile.file.name}</FileName>
                  <FileMetadata>{formatFileSize(pendingFile.file.size)}</FileMetadata>
                  <DescriptionInput
                    placeholder="Describe this evidence (required)..."
                    value={pendingFile.description}
                    onChange={(e) => updateFileDescription(pendingFile.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <ButtonGroup>
                    <Button
                      $variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        uploadFile(pendingFile);
                      }}
                      disabled={!pendingFile.description.trim() || isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                    <Button
                      $variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(pendingFile.id);
                      }}
                      disabled={isUploading}
                    >
                      Remove
                    </Button>
                  </ButtonGroup>
                </FileDetails>
              </FileInfo>
            </FileCard>
          ))}
        </UploadedFilesList>
      )}

      {/* Uploaded Files */}
      {uploadedEvidence.size > 0 && (
        <UploadedFilesList>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: colors.text.primary }}>
            Uploaded Evidence ({uploadedEvidence.size})
          </h4>
          {Array.from(uploadedEvidence.values()).map(evidence => (
            <FileCard key={evidence.id}>
              <FileInfo>
                <FileIconWrapper style={{ background: `${colors.semantic.success}20`, color: colors.semantic.success }}>
                  <FiCheck />
                </FileIconWrapper>
                <FileDetails>
                  <FileName>{evidence.filename}</FileName>
                  <FileMetadata>
                    Uploaded on {new Date(evidence.uploadedAt).toLocaleDateString()} • {evidence.description}
                  </FileMetadata>
                </FileDetails>
              </FileInfo>
              <FileActions>
                <StatusBadge $status="uploaded">
                  <FiCheck size={12} />
                  Uploaded
                </StatusBadge>
              </FileActions>
            </FileCard>
          ))}
        </UploadedFilesList>
      )}
    </Container>
  );
};

export default SimpleMERUpload;
