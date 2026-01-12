import React from 'react';
import styled from 'styled-components';
import { colors, borderRadius, spacing, shadows } from '../../styles/designTokens';
import { FiX, FiDownload } from 'react-icons/fi';
import { Evidence, FileAttachment } from '../../types/index';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.xl};
`;

const PreviewContainer = styled.div`
  background: ${colors.background.paper};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.lg};
  width: 90%;
  max-width: 1200px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: ${spacing.lg} ${spacing.xl};
  border-bottom: 1px solid ${colors.neutral.gray200};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${colors.background.paper};
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: ${spacing.md};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
`;

const IconButton = styled.button`
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

const PreviewContent = styled.div`
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.neutral.gray50};
  padding: ${spacing.lg};
`;

const IframePreview = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: white;
  border-radius: ${borderRadius.base};
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: ${borderRadius.base};
`;

const UnsupportedMessage = styled.div`
  text-align: center;
  color: ${colors.text.secondary};
  padding: ${spacing.xl};
`;

const DownloadButton = styled.button`
  padding: ${spacing.md} ${spacing.lg};
  background: ${colors.neutral.black};
  color: white;
  border: none;
  border-radius: ${borderRadius.base};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  font-weight: 600;
  margin-top: ${spacing.md};
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.neutral.gray800};
  }
`;

interface FilePreviewModalProps {
  attachment: FileAttachment | Evidence;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ attachment, onClose }) => {
  const fileName = 'filename' in attachment ? attachment.filename : attachment.fileName;
  const base64Data = attachment.base64Data;

  if (!base64Data) {
    return (
      <Overlay onClick={onClose}>
        <PreviewContainer onClick={(e) => e.stopPropagation()}>
          <Header>
            <Title>{fileName}</Title>
            <HeaderActions>
              <IconButton onClick={onClose} title="Close">
                <FiX size={20} />
              </IconButton>
            </HeaderActions>
          </Header>
          <PreviewContent>
            <UnsupportedMessage>
              <p>No preview available for this file.</p>
            </UnsupportedMessage>
          </PreviewContent>
        </PreviewContainer>
      </Overlay>
    );
  }

  // Determine file type from base64 data or filename
  const getFileType = (): string => {
    if (base64Data.startsWith('data:')) {
      const match = base64Data.match(/data:([^;]+);/);
      return match ? match[1] : '';
    }
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'application/pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return `image/${ext}`;
    if (ext === 'txt') return 'text/plain';
    return '';
  };

  const fileType = getFileType();
  const isImage = fileType.startsWith('image/');
  const isPDF = fileType === 'application/pdf';
  const isText = fileType === 'text/plain';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPreview = () => {
    if (isImage) {
      return <ImagePreview src={base64Data} alt={fileName} />;
    }

    if (isPDF || isText) {
      return <IframePreview src={base64Data} title={fileName} />;
    }

    // For unsupported file types
    return (
      <UnsupportedMessage>
        <p>Preview not available for this file type.</p>
        <DownloadButton onClick={handleDownload}>
          <FiDownload size={16} />
          Download to view
        </DownloadButton>
      </UnsupportedMessage>
    );
  };

  return (
    <Overlay onClick={onClose}>
      <PreviewContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{fileName}</Title>
          <HeaderActions>
            <IconButton onClick={handleDownload} title="Download">
              <FiDownload size={20} />
            </IconButton>
            <IconButton onClick={onClose} title="Close">
              <FiX size={20} />
            </IconButton>
          </HeaderActions>
        </Header>
        <PreviewContent>
          {renderPreview()}
        </PreviewContent>
      </PreviewContainer>
    </Overlay>
  );
};

export default FilePreviewModal;
