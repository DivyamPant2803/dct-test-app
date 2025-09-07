import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { RequirementRow } from '../types/index';
import { useEvidenceApi } from '../hooks/useEvidenceApi';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background: #f0f0f0;
    color: #222;
  }
`;

const Content = styled.div`
  padding: 1.5rem;
  flex: 1;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #222;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #222;
  }
  
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #222;
  }
`;

const FileUploadArea = styled.div<{ $isDragOver: boolean; $hasFile: boolean }>`
  border: 2px dashed ${props => props.$isDragOver ? '#222' : props.$hasFile ? '#4CAF50' : '#ccc'};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background: ${props => props.$isDragOver ? '#f8f9fa' : props.$hasFile ? '#f0f8f0' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #222;
    background: #f8f9fa;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

const FileName = styled.div`
  font-weight: 500;
  color: #222;
  margin-bottom: 0.25rem;
`;

const FileSize = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  color: #F44336;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const RequirementInfo = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  margin-bottom: 1rem;
`;

const RequirementTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #222;
  font-size: 1rem;
`;

const RequirementDetails = styled.div`
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: 1px solid ${props => props.variant === 'primary' ? '#222' : '#ccc'};
  background: ${props => props.variant === 'primary' ? '#222' : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : '#222'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#444' : '#f8f8f8'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #222;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface UploadEvidenceModalProps {
  requirement: RequirementRow;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadEvidenceModal: React.FC<UploadEvidenceModalProps> = ({
  requirement,
  onClose,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadEvidence } = useEvidenceApi();

  const acceptedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (file: File) => {
    setError(null);
    
    // Validate file type
    if (!acceptedFileTypes.includes(file.type)) {
      setError('Please select a PDF, DOC, or XLS file');
      return;
    }
    
    // Validate file size
    if (file.size > maxFileSize) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!description.trim()) {
      setError('Please provide a description');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      await uploadEvidence(selectedFile, requirement.id, description);
      onSuccess();
      onClose();
    } catch (error) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', error);
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
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Upload Evidence</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>
        
        <Content>
          <RequirementInfo>
            <RequirementTitle>{requirement.name}</RequirementTitle>
            <RequirementDetails>
              <div><strong>Jurisdiction:</strong> {requirement.jurisdiction}</div>
              <div><strong>Entity:</strong> {requirement.entity}</div>
              <div><strong>Subject Type:</strong> {requirement.subjectType}</div>
              {requirement.description && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Description:</strong> {requirement.description}
                </div>
              )}
            </RequirementDetails>
          </RequirementInfo>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Select File</Label>
              <FileUploadArea
                $isDragOver={isDragOver}
                $hasFile={!!selectedFile}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {selectedFile ? (
                  <div>
                    <div>✓ File selected</div>
                    <FileInfo>
                      <FileName>{selectedFile.name}</FileName>
                      <FileSize>{formatFileSize(selectedFile.size)}</FileSize>
                    </FileInfo>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>📁</div>
                    <div>Click to select file or drag and drop</div>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                      PDF, DOC, XLS files only (max 10MB)
                    </div>
                  </div>
                )}
              </FileUploadArea>
              <FileInput
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileInputChange}
              />
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <TextArea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a brief description of the evidence..."
                required
              />
            </FormGroup>

            <ButtonGroup>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!selectedFile || !description.trim() || isUploading}
              >
                {isUploading && <LoadingSpinner />}
                {isUploading ? 'Uploading...' : 'Upload Evidence'}
              </Button>
            </ButtonGroup>
          </Form>
        </Content>
      </Modal>
    </Overlay>
  );
};

export default UploadEvidenceModal;
